#!/usr/bin/env node
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import dotenv from "dotenv";
import {
  ChatMessage,
  ModelInfo,
  ModelConfig,
  BaseProvider
} from "./types.js";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createProvider } from "./providers/index.js";
import { loadConfig } from "./config.js";

// Obtenir le répertoire du script actuel
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: join(__dirname, '..', '.env') });

const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: "temperature",
    name: "Temperature",
    type: "number",
    description: "Controls randomness in the output (0.0 to 2.0)",
    default: 0.7,
    minimum: 0,
    maximum: 2
  },
  {
    id: "max_tokens",
    name: "Maximum Tokens",
    type: "integer",
    description: "Maximum number of tokens to generate",
    default: 8000,
    minimum: 1
  },
  {
    id: "top_p",
    name: "Top P",
    type: "number",
    description: "Controls diversity via nucleus sampling (0.0 to 1.0)",
    default: 1.0,
    minimum: 0,
    maximum: 1
  },
  {
    id: "frequency_penalty",
    name: "Frequency Penalty",
    type: "number",
    description: "Reduces repetition by penalizing frequent tokens (-2.0 to 2.0)",
    default: 0.1,
    minimum: -2,
    maximum: 2
  },
  {
    id: "presence_penalty",
    name: "Presence Penalty",
    type: "number",
    description: "Reduces repetition by penalizing used tokens (-2.0 to 2.0)",
    default: 0,
    minimum: -2,
    maximum: 2
  }
];

class MultiProviderServer {
  private server: McpServer;
  private provider: BaseProvider;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    const config = loadConfig();

    this.server = new McpServer(
      {
        name: "multi-provider-mcp-server",
        version: "0.3.0"
      },
      {
        capabilities: {
          resources: {
            subscribe: true,
            listChanged: true
          },
          tools: {
            listChanged: true
          },
          prompts: {
            listChanged: true
          }
        }
      }
    );

    this.provider = createProvider(config.providers[config.selectedProvider]);

    // Set up error handling first
    this.setupErrorHandling();

    // Then set up resources and tools
    this.setupResources();
    this.setupTools();
  }

  private setupErrorHandling(): void {
    // Handle process termination
    process.on('SIGINT', async () => {
      console.error("Shutting down...");
      await this.server.close();
      process.exit(0);
    });

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error("[Uncaught Exception]", error);
      process.exit(1);
    });
  }

  private setupResources(): void {
    // Models resource
    this.server.resource(
      "models",
      new ResourceTemplate("models://{modelId}", {
        list: async () => {
          const models = this.provider.getAvailableModels();
          return {
            resources: models.map(model => ({
              uri: `models://${model.id}`,
              name: model.name,
              description: model.description
            }))
          };
        }
      }),
      async (uri: any, { modelId }: any) => {
        const models = this.provider.getAvailableModels();
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(models.find(m => m.id === modelId), null, 2)
          }]
        };
      }
    );

    // Model config resource
    this.server.resource(
      "model-config",
      new ResourceTemplate("config://{modelId}", {
        list: async () => ({
          resources: MODEL_CONFIGS.map(config => ({
            uri: `config://${config.id}`,
            name: config.name,
            description: config.description
          }))
        })
      }),
      async (uri: any, { modelId }: any) => ({
        contents: MODEL_CONFIGS.map(config => ({
          uri: `config://${modelId}/${config.id}`,
          text: JSON.stringify(config, null, 2)
        }))
      })
    );
  }

  private setupTools(): void {
    // Chat completion tool - simplified for single provider usage
    this.server.tool(
      "chat_completion",
      "Chat completion with the configured AI provider",
      {
        message: z.string().optional(),
        messages: z.array(z.object({
          role: z.enum(['system', 'user', 'assistant']),
          content: z.string()
        })).optional()
      },
      async (args: any) => {
        let messages: ChatMessage[];
        if (args.message) {
          messages = [{ role: 'user', content: args.message }];
        } else if (args.messages) {
          messages = args.messages;
        } else {
          throw new Error("Either 'message' or 'messages' must be provided");
        }

        try {
          // Use provider's default configuration
          const response = await this.provider.chatCompletion(messages);

          return {
            content: [{
              type: "text",
              text: response
            }]
          };
        } catch (error) {
          throw new Error(`Provider error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    );

    // Multi-turn chat tool - simplified for single provider usage
    this.server.tool(
      "multi_turn_chat",
      "Multi-turn chat with conversation history maintained between messages",
      {
        messages: z.union([
          z.string(),
          z.array(z.object({
            role: z.enum(['system', 'user', 'assistant']),
            content: z.object({
              type: z.literal('text'),
              text: z.string()
            })
          }))
        ]).transform(messages => {
          if (typeof messages === 'string') {
            return [{
              role: 'user' as const,
              content: {
                type: 'text' as const,
                text: messages
              }
            }];
          }
          return messages;
        })
      },
      async (args: any) => {
        try {
          // Transform new messages
          const newMessage = args.messages[0];
          const transformedNewMessage = {
            role: newMessage.role,
            content: newMessage.content.text
          };

          // Add new message to history
          this.conversationHistory.push(transformedNewMessage);

          // Transform all messages for API
          const transformedMessages = this.conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          }));

          // Use provider's default configuration
          const response = await this.provider.chatCompletion(transformedMessages);

          // Add assistant's response to history
          const assistantMessage = {
            role: 'assistant' as const,
            content: response
          };
          this.conversationHistory.push(assistantMessage);

          return {
            content: [{
              type: "text",
              text: assistantMessage.content
            }]
          };
        } catch (error) {
          throw new Error(`Provider error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    );
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`Multi-provider MCP server running on stdio with ${this.provider.type} provider`);
  }
}

const server = new MultiProviderServer();
server.run().catch(console.error);