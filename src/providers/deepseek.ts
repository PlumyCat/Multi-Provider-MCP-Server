import axios, { AxiosInstance } from 'axios';
import { AbstractProvider } from './base.js';
import { ChatMessage, ChatCompletionOptions, ModelInfo, ProviderConfig, DeepSeekResponse } from '../types.js';

export class DeepSeekProvider extends AbstractProvider {
  private axiosInstance: AxiosInstance;

  constructor(config: ProviderConfig) {
    super(config);
    this.validateApiKey();
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl || 'https://api.deepseek.com/v1',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async chatCompletion(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string> {
    const opts = { ...this.getDefaultOptions(), ...options };
    
    try {
      const response = await this.axiosInstance.post<DeepSeekResponse>('/chat/completions', {
        messages,
        model: opts.model,
        temperature: opts.temperature,
        max_tokens: opts.max_tokens,
        top_p: opts.top_p,
        frequency_penalty: opts.frequency_penalty,
        presence_penalty: opts.presence_penalty
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      if (opts.model === 'deepseek-reasoner') {
        console.error("Error with deepseek-reasoner, falling back to deepseek-chat");
        
        try {
          const fallbackResponse = await this.axiosInstance.post<DeepSeekResponse>('/chat/completions', {
            messages,
            model: 'deepseek-chat',
            temperature: opts.temperature,
            max_tokens: opts.max_tokens,
            top_p: opts.top_p,
            frequency_penalty: opts.frequency_penalty,
            presence_penalty: opts.presence_penalty
          });

          return "Note: Fallback to deepseek-chat due to reasoner error.\n\n" + 
                 fallbackResponse.data.choices[0].message.content;
        } catch (fallbackError) {
          throw new Error(`DeepSeek API error: ${axios.isAxiosError(fallbackError) ? fallbackError.response?.data?.error?.message ?? fallbackError.message : 'Unknown error'}`);
        }
      }
      
      throw new Error(`DeepSeek API error: ${axios.isAxiosError(error) ? error.response?.data?.error?.message ?? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: "deepseek-chat",
        name: "DeepSeek Chat",
        description: "General-purpose chat model optimized for dialogue"
      },
      {
        id: "deepseek-reasoner",
        name: "DeepSeek Reasoner",
        description: "Model optimized for reasoning and problem-solving"
      }
    ];
  }
}