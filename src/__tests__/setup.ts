import { jest } from '@jest/globals';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DEEPSEEK_API_KEY = 'test-deepseek-key';
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.CLAUDE_API_KEY = 'test-claude-key';
process.env.MISTRAL_API_KEY = 'test-mistral-key';
process.env.CODESTRAL_API_KEY = 'test-codestral-key';
process.env.GEMINI_API_KEY = 'test-gemini-key';
process.env.AZURE_OPENAI_API_KEY = 'test-azure-key';
process.env.AZURE_OPENAI_BASE_URL = 'https://test.openai.azure.com';

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = jest.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
  jest.clearAllMocks();
});