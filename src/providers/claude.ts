import axios, { AxiosInstance } from 'axios';
import { AbstractProvider } from './base.js';
import { ChatMessage, ChatCompletionOptions, ModelInfo, ProviderConfig, ClaudeResponse } from '../types.js';

export class ClaudeProvider extends AbstractProvider {
  private axiosInstance: AxiosInstance;

  constructor(config: ProviderConfig) {
    super(config);
    this.validateApiKey();
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || 'https://api.anthropic.com/v1',
      headers: {
        'x-api-key': config.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      }
    });
  }

  async chatCompletion(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string> {
    const opts = { ...this.getDefaultOptions(), ...options };
    
    // Convert messages to Claude format
    const claudeMessages = this.convertToClaudeMessages(messages);
    
    try {
      const response = await this.axiosInstance.post<ClaudeResponse>('/messages', {
        model: opts.model,
        max_tokens: opts.max_tokens,
        messages: claudeMessages,
        temperature: opts.temperature,
        top_p: opts.top_p
      });

      return response.data.content[0].text;
    } catch (error) {
      throw new Error(`Claude API error: ${axios.isAxiosError(error) ? error.response?.data?.error?.message ?? error.message : 'Unknown error'}`);
    }
  }

  private convertToClaudeMessages(messages: ChatMessage[]): any[] {
    const claudeMessages: any[] = [];
    
    for (const message of messages) {
      if (message.role === 'system') {
        // Claude handles system messages differently, but we'll include them as user messages with a prefix
        claudeMessages.push({
          role: 'user',
          content: `[System]: ${message.content}`
        });
      } else {
        claudeMessages.push({
          role: message.role,
          content: message.content
        });
      }
    }
    
    return claudeMessages;
  }

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        description: "Most intelligent model with superior performance on complex tasks"
      },
      {
        id: "claude-3-5-haiku-20241022",
        name: "Claude 3.5 Haiku",
        description: "Fastest and most compact model for near-instant responsiveness"
      },
      {
        id: "claude-3-opus-20240229",
        name: "Claude 3 Opus",
        description: "Most powerful model for highly complex tasks"
      },
      {
        id: "claude-3-sonnet-20240229",
        name: "Claude 3 Sonnet",
        description: "Balance of intelligence and speed"
      },
      {
        id: "claude-3-haiku-20240307",
        name: "Claude 3 Haiku",
        description: "Fast and efficient model for everyday tasks"
      }
    ];
  }
}