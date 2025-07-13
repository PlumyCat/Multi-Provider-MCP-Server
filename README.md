# Multi-Provider MCP Server - Universal LLM "Swiss Army Knife"

A unified Model Context Protocol (MCP) server that provides a **single, consistent interface** to multiple AI providers. Perfect for **Microsoft Copilot Studio** and other MCP-compatible applications.

## 🎯 **Key Concept: One Server, One Provider, One Model**

Unlike traditional multi-provider servers, this MCP server is designed to be **configured once per provider**. Each server instance focuses on a single AI provider with its optimal default settings, making it perfect for enterprise deployments.

<a href="https://glama.ai/mcp/servers/asht4rqltn"><img width="380" height="200" src="https://glama.ai/mcp/servers/asht4rqltn/badge" alt="Universal MCP Server" /></a>

[![npm version](https://img.shields.io/npm/v/deepseek-mcp-server)](https://www.npmjs.com/package/deepseek-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/deepseek-mcp-server)](https://www.npmjs.com/package/deepseek-mcp-server)
[![GitHub issues](https://img.shields.io/github/issues/DMontgomery40/deepseek-mcp-server)](https://github.com/DMontgomery40/deepseek-mcp-server/issues)
[![GitHub forks](https://img.shields.io/github/forks/DMontgomery40/deepseek-mcp-server)](https://github.com/DMontgomery40/deepseek-mcp-server/network)
[![GitHub stars](https://img.shields.io/github/stars/DMontgomery40/deepseek-mcp-server)](https://github.com/DMontgomery40/deepseek-mcp-server/stargazers)
[![GitHub license](https://img.shields.io/github/license/DMontgomery40/deepseek-mcp-server?color=blue)](https://github.com/DMontgomery40/deepseek-mcp-server/blob/main/LICENSE)

## 🚀 **Perfect for Microsoft Copilot Studio**

This MCP server provides a **unified interface** for all AI providers, making it ideal for:
- **Microsoft Copilot Studio** custom connectors
- **Enterprise AI deployments** with provider flexibility
- **Consistent bot behavior** across different LLM providers
- **Easy provider switching** without code changes

## 📦 **Installation**

### Quick Start with npm

```bash
npm install -g deepseek-mcp-server
```

### Manual Installation

```bash
git clone https://github.com/DMontgomery40/deepseek-mcp-server.git
cd deepseek-mcp-server
npm install
npm run build
```

## 🔧 **Configuration**

### Supported Providers

Choose **one provider** per server instance:

| Provider | Description | Default Model |
|----------|-------------|---------------|
| `deepseek` | DeepSeek AI models | `deepseek-reasoner` |
| `openai` | OpenAI GPT models | `gpt-4o` |
| `azure-openai` | Azure OpenAI Service | `gpt-4o` |
| `claude` | Anthropic Claude models | `claude-3-5-sonnet-20241022` |
| `mistral` | Mistral AI models | `mistral-large-latest` |
| `codestral` | Mistral Codestral models | `codestral-latest` |
| `gemini` | Google Gemini models | `gemini-1.5-pro` |

### Environment Variables

Set the appropriate API key based on your chosen provider:

```bash
# For DeepSeek
DEEPSEEK_API_KEY=your-deepseek-api-key

# For OpenAI
OPENAI_API_KEY=your-openai-api-key

# For Azure OpenAI
AZURE_OPENAI_API_KEY=your-azure-openai-api-key
AZURE_OPENAI_BASE_URL=https://your-resource.openai.azure.com

# For Claude
CLAUDE_API_KEY=your-claude-api-key

# For Mistral
MISTRAL_API_KEY=your-mistral-api-key

# For Codestral
CODESTRAL_API_KEY=your-codestral-api-key

# For Gemini
GEMINI_API_KEY=your-gemini-api-key
```

### Basic MCP Configuration

#### For Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "LLM": {
      "command": "node",
      "args": ["F:/MCP-Server/deepseek-mcp-server/build/index.js"],
      "cwd": "F:/MCP-Server/deepseek-mcp-server",
      "env": {
        "PROVIDER": "azure-openai"
      }
    }
  }
}
```

#### For Cursor (`mcp.json`)

```json
{
  "mcpServers": {
    "LLM": {
      "command": "node",
      "args": ["F:/MCP-Server/deepseek-mcp-server/build/index.js"],
      "cwd": "F:/MCP-Server/deepseek-mcp-server",
      "env": {
        "PROVIDER": "azure-openai"
      }
    }
  }
}
```

## 🎯 **Usage**

### Simple Interface

The server provides **two simple tools** with no complex configuration:

#### 1. `chat_completion`
Basic single-turn chat completion:

```javascript
{
  "message": "Hello, how are you?"
}
```

#### 2. `multi_turn_chat`
Multi-turn conversation with maintained history:

```javascript
{
  "messages": "Continue our conversation about AI"
}
```

### No Configuration Required

**The beauty of this approach**: The bot/client doesn't need to know:
- Which AI provider is being used
- Which model is active
- What parameters are optimal
- How to handle different APIs

Everything is handled automatically by the server configuration.

## 🏢 **Enterprise Deployment Examples**

### Scenario 1: Multiple Bots, Different Providers

```bash
# Bot A: Customer Support (Azure OpenAI)
PROVIDER=azure-openai → Uses gpt-4o for consistent responses

# Bot B: Code Assistant (DeepSeek)
PROVIDER=deepseek → Uses deepseek-reasoner for technical queries

# Bot C: Creative Writing (Claude)
PROVIDER=claude → Uses claude-3-5-sonnet for creative tasks
```

### Scenario 2: Same Bot, Easy Provider Migration

```bash
# Week 1: Testing with OpenAI
PROVIDER=openai

# Week 2: Switch to Azure OpenAI for compliance
PROVIDER=azure-openai

# Week 3: Try DeepSeek for cost optimization
PROVIDER=deepseek
```

**Zero code changes required!** 🎉

## 🔍 **Testing and Development**

### Build and Test

```bash
npm run build
npm test
```

### Test with MCP Inspector

```bash
npm run build
npx @modelcontextprotocol/inspector node ./build/index.js
```

### Environment File Support

Create a `.env` file in the project root:

```env
# Provider Selection
PROVIDER=azure-openai

# API Configuration
AZURE_OPENAI_API_KEY=your-key-here
AZURE_OPENAI_BASE_URL=https://your-resource.openai.azure.com
```

## 🚀 **Microsoft Copilot Studio Integration**

This MCP server is specifically designed for **Microsoft Copilot Studio** custom connectors:

### Benefits:
- **Consistent Interface**: Same tools across all providers
- **No Provider Lock-in**: Easy to switch providers
- **Enterprise Ready**: Built for production deployments
- **Simplified Management**: One configuration per bot

### Implementation:
1. **Deploy MCP Server** with your chosen provider
2. **Configure Copilot Studio** to use MCP endpoints
3. **Use Simple Tools** - `chat_completion` and `multi_turn_chat`
4. **Switch Providers** by changing environment variables only

## 📚 **API Reference**

### Tools

#### `chat_completion`
- **Description**: Single-turn chat completion
- **Input**: `{ message: string }`
- **Output**: Text response from configured provider

#### `multi_turn_chat`
- **Description**: Multi-turn conversation with history
- **Input**: `{ messages: string }`
- **Output**: Contextual response maintaining conversation flow

### Resources

- **`models`**: List available models for the configured provider
- **`model-config`**: Configuration options for the current provider

## 🔒 **Security**

- **API Keys**: Stored as environment variables only
- **Provider Isolation**: Each server instance uses one provider
- **No Credential Exposure**: Client never sees API keys or provider details

## 🆘 **Support**

- **GitHub Issues**: [Report bugs or request features](https://github.com/DMontgomery40/deepseek-mcp-server/issues)
- **GitHub Discussions**: [Community support](https://github.com/DMontgomery40/deepseek-mcp-server/discussions)

## 📄 **License**

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built for the future of AI integration** 🤖✨
