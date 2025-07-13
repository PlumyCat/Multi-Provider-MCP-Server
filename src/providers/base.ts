import { BaseProvider, ChatMessage, ChatCompletionOptions, ModelInfo, ProviderConfig } from '../types.js';

export abstract class AbstractProvider implements BaseProvider {
  public type: ProviderConfig['type'];
  public config: ProviderConfig;

  constructor(config: ProviderConfig) {
    this.type = config.type;
    this.config = config;
  }

  abstract chatCompletion(messages: ChatMessage[], options?: ChatCompletionOptions): Promise<string>;
  abstract getAvailableModels(): ModelInfo[];

  protected validateApiKey(): void {
    if (!this.config.apiKey) {
      throw new Error(`API key is required for ${this.type} provider`);
    }
  }

  protected getDefaultOptions(): Required<ChatCompletionOptions> {
    return {
      model: this.config.defaultModel,
      temperature: 0.7,
      max_tokens: 8000,
      top_p: 1.0,
      frequency_penalty: 0.1,
      presence_penalty: 0
    };
  }
}