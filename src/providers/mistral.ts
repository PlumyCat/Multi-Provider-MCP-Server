import axios, { AxiosInstance } from 'axios';
import { AbstractProvider } from './base.js';
import { ChatMessage, ChatCompletionOptions, ModelInfo, ProviderConfig, MistralResponse } from '../types.js';

export class MistralProvider extends AbstractProvider {
  private axiosInstance: AxiosInstance;

  constructor(config: ProviderConfig) {
    super(config);
    this.validateApiKey();
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || 'https://api.mistral.ai/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async chatCompletion(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string> {
    const opts = { ...this.getDefaultOptions(), ...options };
    
    try {
      const response = await this.axiosInstance.post<MistralResponse>('/chat/completions', {
        model: opts.model,
        messages,
        temperature: opts.temperature,
        max_tokens: opts.max_tokens,
        top_p: opts.top_p
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Mistral API error: ${axios.isAxiosError(error) ? error.response?.data?.error?.message ?? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: "mistral-large-latest",
        name: "Mistral Large",
        description: "Most advanced model for complex reasoning tasks"
      },
      {
        id: "mistral-medium-latest",
        name: "Mistral Medium",
        description: "Balanced model for most use cases"
      },
      {
        id: "mistral-small-latest",
        name: "Mistral Small",
        description: "Fast and efficient model for simple tasks"
      },
      {
        id: "open-mistral-7b",
        name: "Open Mistral 7B",
        description: "Open-source 7B parameter model"
      },
      {
        id: "open-mixtral-8x7b",
        name: "Open Mixtral 8x7B",
        description: "Open-source mixture of experts model"
      },
      {
        id: "open-mixtral-8x22b",
        name: "Open Mixtral 8x22B",
        description: "Larger open-source mixture of experts model"
      }
    ];
  }
}