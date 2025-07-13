import { ProviderConfig, ProviderType } from './types.js';

export interface ServerConfig {
  selectedProvider: ProviderType;
  providers: Record<ProviderType, ProviderConfig>;
}

export function loadConfig(): ServerConfig {
  const selectedProvider = (process.env.PROVIDER || 'deepseek') as ProviderType;
  
  const providers: Record<ProviderType, ProviderConfig> = {
    deepseek: {
      type: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      models: ['deepseek-chat', 'deepseek-reasoner'],
      defaultModel: process.env.DEEPSEEK_DEFAULT_MODEL || 'deepseek-reasoner'
    },
    openai: {
      type: 'openai',
      apiKey: process.env.OPENAI_API_KEY || '',
      baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
      models: ['gpt-4o-mini', 'gpt-4.1-mini', 'gpt-4.1-nano'],
      defaultModel: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4.1-mini'
    },
    'azure-openai': {
      type: 'azure-openai',
      apiKey: process.env.AZURE_OPENAI_API_KEY || '',
      baseUrl: process.env.AZURE_OPENAI_BASE_URL || '', // Required for Azure
      models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1-mini'],
      defaultModel: process.env.AZURE_OPENAI_DEFAULT_MODEL || 'gpt-4.1-mini'
    },
    claude: {
      type: 'claude',
      apiKey: process.env.CLAUDE_API_KEY || '',
      baseUrl: process.env.CLAUDE_BASE_URL || 'https://api.anthropic.com/v1',
      models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      defaultModel: process.env.CLAUDE_DEFAULT_MODEL || 'claude-3-5-sonnet-20241022'
    },
    mistral: {
      type: 'mistral',
      apiKey: process.env.MISTRAL_API_KEY || '',
      baseUrl: process.env.MISTRAL_BASE_URL || 'https://api.mistral.ai/v1',
      models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'open-mistral-7b', 'open-mixtral-8x7b', 'open-mixtral-8x22b'],
      defaultModel: process.env.MISTRAL_DEFAULT_MODEL || 'mistral-large-latest'
    },
    codestral: {
      type: 'codestral',
      apiKey: process.env.CODESTRAL_API_KEY || '',
      baseUrl: process.env.CODESTRAL_BASE_URL || 'https://codestral.mistral.ai/v1',
      models: ['codestral-latest', 'codestral-2405'],
      defaultModel: process.env.CODESTRAL_DEFAULT_MODEL || 'codestral-latest'
    },
    gemini: {
      type: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || '',
      baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
      models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-1.0-pro', 'gemini-exp-1206'],
      defaultModel: process.env.GEMINI_DEFAULT_MODEL || 'gemini-1.5-pro'
    }
  };

  // Validate that the selected provider has an API key
  const selectedProviderConfig = providers[selectedProvider];
  if (!selectedProviderConfig.apiKey) {
    throw new Error(`API key is required for ${selectedProvider} provider. Please set the appropriate environment variable.`);
  }

  // Special validation for Azure OpenAI
  if (selectedProvider === 'azure-openai' && !selectedProviderConfig.baseUrl) {
    throw new Error('Azure OpenAI requires AZURE_OPENAI_BASE_URL to be set (e.g., https://your-resource.openai.azure.com)');
  }

  return {
    selectedProvider,
    providers
  };
}