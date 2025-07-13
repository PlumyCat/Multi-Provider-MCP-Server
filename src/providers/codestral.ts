import axios, { AxiosInstance } from 'axios';
import { AbstractProvider } from './base.js';
import { ChatMessage, ChatCompletionOptions, ModelInfo, ProviderConfig, MistralResponse } from '../types.js';

export class CodestralProvider extends AbstractProvider {
  private axiosInstance: AxiosInstance;

  constructor(config: ProviderConfig) {
    super(config);
    this.validateApiKey();
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || 'https://codestral.mistral.ai/v1',
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
      throw new Error(`Codestral API error: ${axios.isAxiosError(error) ? error.response?.data?.error?.message ?? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: "codestral-latest",
        name: "Codestral Latest",
        description: "Most recent version of Codestral for code generation and completion"
      },
      {
        id: "codestral-2405",
        name: "Codestral 2405",
        description: "Codestral model specialized for code generation and programming tasks"
      }
    ];
  }
}