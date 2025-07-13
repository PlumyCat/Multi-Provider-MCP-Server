#!/usr/bin/env node
import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import dotenv from "dotenv";
import {
  ChatMessage,
  ModelInfo,
  ModelConfig,
  BaseProvider
} from "./types.js";
import { createProvider } from "./providers/index.js";
import { loadConfig } from "./config.js";

dotenv.config();

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

function createMcpServer(): McpServer {
  const config = loadConfig();

  const server = new McpServer(
    {
      name: "multi-provider-mcp-server",
      version: "0.3.0"
    },
    {
      capabilities: {
        resources: {},
        tools: {},
        prompts: {}
      }
    }
  );

  const provider = createProvider(config.providers[config.selectedProvider]);
  const conversationHistory: ChatMessage[] = [];

  // Chat completion tool
  server.tool(
    "chat_completion",
    "Chat completion with the selected AI provider",
    {
      message: z.string().optional(),
      messages: z.array(z.object({
        role: z.enum(['system', 'user', 'assistant']),
        content: z.string()
      })).optional(),
      model: z.string().default(provider.config.defaultModel),
      temperature: z.number().min(0).max(2).default(0.7),
      max_tokens: z.number().positive().int().default(8000),
      top_p: z.number().min(0).max(1).default(1.0),
      frequency_penalty: z.number().min(-2).max(2).default(0.1),
      presence_penalty: z.number().min(-2).max(2).default(0)
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
        const response = await provider.chatCompletion(messages, {
          model: args.model,
          temperature: args.temperature,
          max_tokens: args.max_tokens,
          top_p: args.top_p,
          frequency_penalty: args.frequency_penalty,
          presence_penalty: args.presence_penalty
        });

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

  // Multi-turn chat tool
  server.tool(
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
      }),
      model: z.string().default(provider.config.defaultModel),
      temperature: z.number().min(0).max(2).default(0.7),
      max_tokens: z.number().positive().int().default(8000),
      top_p: z.number().min(0).max(1).default(1.0),
      frequency_penalty: z.number().min(-2).max(2).default(0.1),
      presence_penalty: z.number().min(-2).max(2).default(0)
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
        conversationHistory.push(transformedNewMessage);

        // Transform all messages for API
        const transformedMessages = conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        const response = await provider.chatCompletion(transformedMessages, {
          model: args.model,
          temperature: args.temperature,
          max_tokens: args.max_tokens,
          top_p: args.top_p,
          frequency_penalty: args.frequency_penalty,
          presence_penalty: args.presence_penalty
        });

        // Add assistant's response to history
        const assistantMessage = {
          role: 'assistant' as const,
          content: response
        };
        conversationHistory.push(assistantMessage);

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

  return server;
}

const app = express();

// Enable CORS for browser access
app.use(cors({
  origin: '*',
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
}));

app.use(express.json());

// Store transports by session ID
const transports: { [sessionId: string]: SSEServerTransport } = {};

// SSE endpoint for establishing connection
app.get('/sse', async (req, res) => {
  console.log('🔗 New SSE connection request');

  const transport = new SSEServerTransport('/messages', res);
  transports[transport.sessionId] = transport;

  res.on("close", () => {
    console.log(`📝 SSE connection closed for session ${transport.sessionId}`);
    delete transports[transport.sessionId];
  });

  const server = createMcpServer();
  await server.connect(transport);

  console.log(`✅ MCP Server connected for session ${transport.sessionId}`);
});

// Message endpoint for client requests
app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  console.log(`📨 Message received for session ${sessionId}`);

  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res, req.body);
  } else {
    console.log(`❌ No transport found for session ${sessionId}`);
    res.status(400).send('No transport found for sessionId');
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    provider: process.env.PROVIDER || 'deepseek',
    sessions: Object.keys(transports).length
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 Multi-Provider MCP HTTP Server listening on port ${PORT}`);
  console.log(`📊 Provider: ${process.env.PROVIDER || 'deepseek'}`);
  console.log(`🔗 SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`🔗 Messages endpoint: http://localhost:${PORT}/messages`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
}); 