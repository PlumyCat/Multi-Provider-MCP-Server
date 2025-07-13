export { AbstractProvider } from './base.js';
export { DeepSeekProvider } from './deepseek.js';
export { OpenAIProvider } from './openai.js';
export { AzureOpenAIProvider } from './azure-openai.js';
export { ClaudeProvider } from './claude.js';
export { MistralProvider } from './mistral.js';
export { CodestralProvider } from './codestral.js';
export { GeminiProvider } from './gemini.js';

import { DeepSeekProvider } from './deepseek.js';
import { OpenAIProvider } from './openai.js';
import { AzureOpenAIProvider } from './azure-openai.js';
import { ClaudeProvider } from './claude.js';
import { MistralProvider } from './mistral.js';
import { CodestralProvider } from './codestral.js';
import { GeminiProvider } from './gemini.js';
import { ProviderConfig, BaseProvider } from '../types.js';

export function createProvider(config: ProviderConfig): BaseProvider {
  switch (config.type) {
    case 'deepseek':
      return new DeepSeekProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'azure-openai':
      return new AzureOpenAIProvider(config);
    case 'claude':
      return new ClaudeProvider(config);
    case 'mistral':
      return new MistralProvider(config);
    case 'codestral':
      return new CodestralProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    default:
      throw new Error(`Unknown provider type: ${config.type}`);
  }
}