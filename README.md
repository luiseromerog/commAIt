# CommAIt 🚀

AI-powered Git commit message generator with emojis. Analyzes your staged changes and generates concise, descriptive commit messages using AI.

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-lightgray)

## ✨ Features

- 🤖 **AI-Powered**: Generates commit messages using OpenAI or your local LLM
- 🎨 **Emoji Support**: Automatically includes relevant emojis
- 🌐 **Flexible**: Works with OpenAI API, LM Studio, Ollama, llama.cpp, and more
- ⚙️ **Configurable**: 3-layer configuration (Internal Defaults -> Global -> Project)
- 🎯 **Smart Filtering**: Automatically ignores lock files, binaries, and irrelevant files
- 🔄 **Interactive**: Choose to accept, edit, regenerate, or cancel
- 🔌 **Git Hook**: Install as a `prepare-commit-msg` hook for seamless integration
- 🔍 **Verbose Mode**: Debug configuration sources and API payloads

## 📦 Installation

### Via npm

```bash
npm install -g commait
```

### Prerequisites

- Node.js 18+
- Git
- An AI API key (OpenAI, or configure a local LLM)

## 🚀 Quick Start

### Using OpenAI

```bash
# Set your API key
export OPENAI_API_KEY="sk-your-openai-key"

# Stage your changes
git add .

# Generate commit message
commait commit
```

### Using Local LLM (LM Studio / Ollama / llama.cpp)

```bash
# Configure local LLM in ~/.config/commait/config.json
cat > ~/.config/commait/config.json << EOF
{
  "baseUrl": "http://localhost:1234/v1",
  "model": "llama3.1",
  "apiKey": ""
}
EOF

# Stage your changes
git add .

# Generate commit message
commait commit
```

### Install Git Hook

```bash
commait install-hook
```

Now when you run `git commit`, CommAIt will automatically generate a commit message for you!

## ⚙️ Configuration

CommAIt uses a 3-layer merge strategy: **Internal Defaults** ➔ **Global Config** ➔ **Project Config**.

### 1. Global Configuration (`~/.config/commait/config.json`)

```json
{
  "apiKey": "sk-your-openai-key",
  "baseUrl": "https://api.openai.com/v1",
  "model": "gpt-4o-mini",
  "maxTokens": 4096,
  "systemPrompt": "Custom global instructions...",
  "filters": ["package-lock.json", "*.svg"]
}
```

### 2. Project-Specific Configuration (`.commait.json`)

Create a `.commait.json` file in your project root:

```json
{
  "prompt": "Generate commit messages in Spanish",
  "model": "claude-3-5-sonnet",
  "maxTokens": 2048,
  "filters": ["*.log"]
}
```

*Note: In project configuration, the field is `prompt` instead of `systemPrompt` for brevity. It overrides any global instructions.*

## 📖 Usage

### Basic Commands

```bash
# Generate commit message interactively from staged changes
commait commit

# Use a custom message (bypass AI)
commait commit -m "feat: my manual message"

# Generate message for a specific file (even if not staged)
commait generate -d src/index.ts

# Show verbose output (config paths, prompt sources, etc.)
commait --verbose commit

# Install as Git hook
commait install-hook

# Force reinstall hook (overwrite existing)
commait install-hook --force
```

### Global Options

- `-p, --project`: Use project-specific configuration (default)
- `-g, --global`: Use global configuration only
- `-v, --verbose`: Show detailed debug information
- `-V, --version`: Show version number

### Interactive Options

When running `commait commit`, you'll be presented with:

- **✓ Accept (y)**: Use the message and execute `git commit`
- **✏️ Edit (e)**: Open your default editor to customize
- **🔄 Regenerate (r)**: Generate a new message using AI
- **⚠ Cancel (q)**: Cancel the operation

## 📁 Project Structure

```
commait/
├── src/
│   ├── index.ts         # CLI entry point
│   ├── config/
│   │   ├── defaults.ts  # Internal default values
│   │   ├── global.ts    # Global config loader
│   │   └── local.ts     # Project config loader
│   ├── git/
│   │   └── index.ts     # Git operations
│   ├── ai/
│   │   ├── client.ts    # AI API client
│   │   └── prompt.ts    # Prompt builder
│   └── hook/
│       └── index.ts     # Git hook logic
└── README.md
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by [Luis Romero](https://github.com/luiseromerog)
- CLI framework: [commander](https://github.com/tj/commander.js)

---

**Made with CommAIt** 🚀
