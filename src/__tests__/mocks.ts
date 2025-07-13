import { jest } from '@jest/globals';
import { DeepSeekResponse, OpenAIResponse, ClaudeResponse, MistralResponse, GeminiResponse } from '../types.js';

// Mock axios
export const mockAxios = {
  create: jest.fn(() => mockAxiosInstance),
  isAxiosError: jest.fn(),
  post: jest.fn(),
  get: jest.fn()
};

export const mockAxiosInstance = {
  post: jest.fn<any>(),
  get: jest.fn<any>(),
  interceptors: {
    response: {
      use: jest.fn()
    }
  }
};

// Mock responses
export const mockDeepSeekResponse: DeepSeekResponse = {
  id: 'test-id',
  object: 'chat.completion',
  created: Date.now(),
  model: 'deepseek-chat',
  choices: [{
    index: 0,
    message: {
      role: 'assistant',
      content: 'Test response from DeepSeek'
    },
    finish_reason: 'stop'
  }],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 5,
    total_tokens: 15
  }
};

export const mockOpenAIResponse: OpenAIResponse = {
  id: 'test-id',
  object: 'chat.completion',
  created: Date.now(),
  model: 'gpt-4o',
  choices: [{
    index: 0,
    message: {
      role: 'assistant',
      content: 'Test response from OpenAI'
    },
    finish_reason: 'stop'
  }],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 5,
    total_tokens: 15
  }
};

export const mockClaudeResponse: ClaudeResponse = {
  id: 'test-id',
  type: 'message',
  role: 'assistant',
  content: [{
    type: 'text',
    text: 'Test response from Claude'
  }],
  model: 'claude-3-5-sonnet-20241022',
  stop_reason: 'end_turn',
  stop_sequence: null,
  usage: {
    input_tokens: 10,
    output_tokens: 5
  }
};

export const mockMistralResponse: MistralResponse = {
  id: 'test-id',
  object: 'chat.completion',
  created: Date.now(),
  model: 'mistral-large-latest',
  choices: [{
    index: 0,
    message: {
      role: 'assistant',
      content: 'Test response from Mistral'
    },
    finish_reason: 'stop'
  }],
  usage: {
    prompt_tokens: 10,
    completion_tokens: 5,
    total_tokens: 15
  }
};

export const mockGeminiResponse: GeminiResponse = {
  candidates: [{
    content: {
      parts: [{
        text: 'Test response from Gemini'
      }],
      role: 'model'
    },
    finishReason: 'STOP',
    index: 0,
    safetyRatings: []
  }],
  usageMetadata: {
    promptTokenCount: 10,
    candidatesTokenCount: 5,
    totalTokenCount: 15
  }
};

// Reset all mocks
export const resetMocks = () => {
  jest.clearAllMocks();
  mockAxiosInstance.post.mockReset();
  mockAxiosInstance.get.mockReset();
};