import axios, { AxiosInstance } from 'axios';
import { AbstractProvider } from './base.js';
import { ChatMessage, ChatCompletionOptions, ModelInfo, ProviderConfig, OpenAIResponse } from '../types.js';

export class AzureOpenAIProvider extends AbstractProvider {
  private axiosInstance: AxiosInstance;
  private deploymentName: string;

  constructor(config: ProviderConfig) {
    super(config);
    this.validateApiKey();
    
    if (!config.baseUrl) {
      throw new Error('Azure OpenAI requires a baseUrl (e.g., https://your-resource.openai.azure.com)');
    }
    
    // Extract deployment name from default model or use it directly
    this.deploymentName = config.defaultModel;
    
    this.axiosInstance = axios.create({
      baseURL: config.baseUrl,
      headers: {
        'api-key': config.apiKey,
        'Content-Type': 'application/json'
      }
    });
  }

  async chatCompletion(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string> {
    const opts = { ...this.getDefaultOptions(), ...options };
    
    // Use deployment name from model or default
    const deploymentName = opts.model || this.deploymentName;
    
    try {
      const response = await this.axiosInstance.post<OpenAIResponse>(
        `/openai/deployments/${deploymentName}/chat/completions?api-version=2024-02-15-preview`,
        {
          messages,
          temperature: opts.temperature,
          max_tokens: opts.max_tokens,
          top_p: opts.top_p,
          frequency_penalty: opts.frequency_penalty,
          presence_penalty: opts.presence_penalty
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Azure OpenAI API error: ${axios.isAxiosError(error) ? error.response?.data?.error?.message ?? error.message : 'Unknown error'}`);
    }
  }

  getAvailableModels(): ModelInfo[] {
    return [
      {
        id: "gpt-4o",
        name: "GPT-4 Omni",
        description: "Most advanced GPT-4 model with multimodal capabilities"
      },
      {
        id: "gpt-4o-mini",
        name: "GPT-4 Omni Mini",
        description: "Smaller, faster version of GPT-4 Omni"
      },
      {
        id: "gpt-4.1-mini",
        name: "gpt-4.1-mini",
        description: "Fast and capable gpt-4.1 model"
      },
      {
        id: "gpt-4.1",
        name: "gpt-4.1",
        description: "Most advanced gpt-4.1 model with multimodal capabilities"
      }
    ];
  }
}