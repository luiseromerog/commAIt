# CommAIt 🚀

AI-powered Git commit message generator with emojis. Analyzes your staged changes and generates concise, descriptive commit messages using AI.

![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![License](https://img.shields.io/badge/license-MIT-lightgray)

## ✨ Features

- 🤖 **AI-Powered**: Generates commit messages using OpenAI or your local LLM
- 🎨 **Emoji Support**: Automatically includes relevant emojis
- 🌐 **Flexible**: Works with OpenAI API, LM Studio, Ollama, llama.cpp, and more
- ⚙️ **Configurable**: Global and project-specific configurations
- 🎯 **Smart Filtering**: Automatically ignores lock files, binaries, and irrelevant files
- 🔄 **Interactive**: Choose to accept, edit, regenerate, or cancel
- 🔌 **Git Hook**: Install as a `prepare-commit-msg` hook for seamless integration

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

### Global Configuration (`~/.config/commait/config.json`)

```json
{
  "apiKey": "sk-your-openai-key",
  "baseUrl": "https://api.openai.com/v1",
  "model": "gpt-4o-mini",
  "systemPrompt": "You are a professional Git commit message assistant...",
  "filters": ["package-lock.json", "*.svg", "*.min.js"]
}
```

### Project-Specific Configuration (`.commait.json`)

Create a `.commait.json` file in your project root:

```json
{
  "prompt": "Generate commit messages in Spanish, using Jira format: [TICKET-123]: description",
  "model": "claude-3-5-sonnet",
  "filters": ["*.log", "*.tmp"]
}
```

Project configuration overrides global settings.

## 📖 Usage

### Basic Commands

```bash
# Generate commit message interactively
commait commit

# Generate commit message and skip interactive prompt
commait commit --accept

# Generate message for specific file
commait generate -d src/index.ts

# Install as Git hook
commait install-hook

# Force reinstall hook (overwrite existing)
commait install-hook --force
```

### Interactive Options

When running `commait commit`, you'll be presented with these options:

- **✓ Accept and commit**: Use the generated message
- **✏️ Edit in editor**: Open your default editor to customize
- **🔄 Regenerate message**: Generate a new message
- **⚠ Cancel commit**: Cancel and unstage changes

## 🎨 Supported LLMs

CommAIt works with any LLM that implements the OpenAI-compatible API:

- **OpenAI**: `https://api.openai.com/v1`
- **Anthropic**: `https://api.anthropic.com/v1` (with custom handling)
- **LM Studio**: `http://localhost:1234/v1`
- **Ollama**: `http://localhost:11434/v1`
- **llama.cpp**: `http://localhost:8080/v1`
- **Any OpenAI-compatible API**

## 📁 Project Structure

```
commait/
├── src/
│   ├── index.ts         # CLI entry point
│   ├── config/
│   │   ├── global.ts    # Global config loader
│   │   └── local.ts     # Project config loader
│   ├── git/
│   │   └── index.ts     # Git operations
│   ├── ai/
│   │   ├── client.ts    # AI API client
│   │   └── prompt.ts    # Prompt builder
│   └── hook/
│       └── index.ts     # Git hook logic
├── dist/                 # Build output
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## 🐛 Troubleshooting

### "API key not found"

Make sure you've set your API key:

```bash
export OPENAI_API_KEY="sk-your-key"
```

Or configure it in `~/.config/commait/config.json`.

### "No files are staged"

Add files before running CommAIt:

```bash
git add .
commait commit
```

### Connection timeout

If you're using a local LLM, make sure it's running and accessible.

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by [Luis Romero](https://github.com/luiseromerog)
- UI powered by [@clack/prompts](https://github.com/clack-contrib/prompts)
- CLI framework: [commander](https://github.com/tj/commander.js)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`commait commit`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Made with CommAIt** 🚀\n<!-- Dummy change for testing -->
