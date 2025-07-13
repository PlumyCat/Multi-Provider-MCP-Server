import axios, { AxiosInstance } from 'axios';
import { AbstractProvider } from './base.js';
import { ChatMessage, ChatCompletionOptions, ModelInfo, ProviderConfig, OpenAIResponse } from '../types.js';

export class OpenAIProvider extends AbstractProvider {
  private axiosInstance: AxiosInstance;

  constructor(config: ProviderConfig) {
    super(config);
    this.validateApiKey();
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async chatCompletion(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string> {
    const opts = { ...this.getDefaultOptions(), ...options };
    
    try {
      const response = await this.axiosInstance.post<OpenAIResponse>('/chat/completions', {
        model: opts.model,
        messages,
        temperature: opts.temperature,
        max_tokens: opts.max_tokens,
        top_p: opts.top_p,
        frequency_penalty: opts.frequency_penalty,
        presence_penalty: opts.presence_penalty
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`OpenAI API error: ${axios.isAxiosError(error) ? error.response?.data?.error?.message ?? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: "gpt-4.1-mini",
        name: "gpt-4.1-mini",
        description: "Most advanced GPT-4o model with multimodal capabilities"
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4 Omni Mini",
        description: "Smaller, faster version of GPT-4 Omni"
      },
      {
        id: "gpt-4.1-nano",
        name: "gpt-4.1-nano",
        description: "Fast and capable GPT-4 model"
      }
    ];
  }
}