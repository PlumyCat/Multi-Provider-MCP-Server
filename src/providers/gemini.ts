import axios, { AxiosInstance } from 'axios';
import { AbstractProvider } from './base.js';
import { ChatMessage, ChatCompletionOptions, ModelInfo, ProviderConfig, GeminiResponse } from '../types.js';

export class GeminiProvider extends AbstractProvider {
  private axiosInstance: AxiosInstance;

  constructor(config: ProviderConfig) {
    super(config);
    this.validateApiKey();
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta',
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async chatCompletion(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string> {
    const opts = { ...this.getDefaultOptions(), ...options };
    
    // Convert messages to Gemini format
    const geminiMessages = this.convertToGeminiMessages(messages);
    
    try {
      const response = await this.axiosInstance.post<GeminiResponse>(
        `/models/${opts.model}:generateContent?key=${this.config.apiKey}`,
        {
          contents: geminiMessages,
          generationConfig: {
            temperature: opts.temperature,
            maxOutputTokens: opts.max_tokens,
            topP: opts.top_p
          }
        }
      );

      if (response.data.candidates && response.data.candidates.length > 0) {
        return response.data.candidates[0].content.parts[0].text;
      }
      
      throw new Error('No response generated');
    } catch (error) {
      throw new Error(`Gemini API error: ${axios.isAxiosError(error) ? error.response?.data?.error?.message ?? error.message : 'Unknown error'}`);
    }
  }

  private convertToGeminiMessages(messages: ChatMessage[]): any[] {
    const geminiMessages: any[] = [];
    
    for (const message of messages) {
      if (message.role === 'system') {
        // Gemini doesn't have a system role, so we prepend it to the first user message
        // or create a user message if none exists
        const systemContent = `System: ${message.content}`;
        if (geminiMessages.length === 0) {
          geminiMessages.push({
            role: 'user',
            parts: [{ text: systemContent }]
          });
        } else {
          // Prepend to the first user message
          const firstUserIndex = geminiMessages.findIndex(m => m.role === 'user');
          if (firstUserIndex >= 0) {
            geminiMessages[firstUserIndex].parts[0].text = systemContent + '\n\n' + geminiMessages[firstUserIndex].parts[0].text;
          }
        }
      } else {
        geminiMessages.push({
          role: message.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: message.content }]
        });
      }
    }
    
    return geminiMessages;
  }

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: "gemini-1.5-pro",
        name: "Gemini 1.5 Pro",
        description: "Most capable model for complex reasoning tasks"
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        description: "Fast and efficient model for most tasks"
      },
      {
        id: "gemini-1.0-pro",
        name: "Gemini 1.0 Pro",
        description: "Previous generation model for general use"
      },
      {
        id: "gemini-exp-1206",
        name: "Gemini Experimental 1206",
        description: "Experimental model with latest improvements"
      }
    ];
  }
}