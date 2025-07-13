import { describe, it, expect } from '@jest/globals';
import { loadConfig } from '../config';
import { createProvider } from '../providers';
import { DeepSeekProvider } from '../providers/deepseek';

describe('Basic functionality', () => {
  it('should load configuration', () => {
    process.env.DEEPSEEK_API_KEY = 'test-key';
    const config = loadConfig();
    expect(config.selectedProvider).toBe('deepseek');
    expect(config.providers.deepseek.apiKey).toBe('test-key');
  });

  it('should create providers', () => {
    const config = {
      type: 'deepseek' as const,
      apiKey: 'test-key',
      models: ['deepseek-chat'],
      defaultModel: 'deepseek-chat'
    };
    
    const provider = createProvider(config);
    expect(provider).toBeInstanceOf(DeepSeekProvider);
    expect(provider.type).toBe('deepseek');
  });

  it('should get available models', () => {
    const config = {
      type: 'deepseek' as const,
      apiKey: 'test-key',
      models: ['deepseek-chat'],
      defaultModel: 'deepseek-chat'
    };
    
    const provider = createProvider(config);
    const models = provider.getAvailableModels();
    expect(models).toHaveLength(2);
    expect(models[0].id).toBe('deepseek-chat');
  });

  it('should validate required API keys', () => {
    delete process.env.DEEPSEEK_API_KEY;
    expect(() => loadConfig()).toThrow('API key is required');
  });

  it('should validate Azure OpenAI base URL', () => {
    process.env.PROVIDER = 'azure-openai';
    process.env.AZURE_OPENAI_API_KEY = 'test-key';
    delete process.env.AZURE_OPENAI_BASE_URL;
    
    expect(() => loadConfig()).toThrow('Azure OpenAI requires AZURE_OPENAI_BASE_URL');
  });
});