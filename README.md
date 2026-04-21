<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Nexus Chat

A modern chat interface powered by local AI models. Nexus provides a sleek, responsive chat experience with real-time streaming responses using Ollama's open-source models.

## Features

- 💬 **Real-time streaming** - See AI responses as they're generated
- 🔒 **Local-first** - Runs entirely on your machine with Ollama
- 🎨 **Modern UI** - Built with React, Tailwind CSS, and Framer Motion
- 📝 **Context management** - Maintains conversation history with intelligent truncation
- 🛡️ **Safety guardrails** - Content filtering to prevent harmful outputs
- ⚡ **Fast & responsive** - Vite-powered development with hot module reloading

## Prerequisites

- Node.js 18+
- [Ollama](https://ollama.ai) installed and running locally
- `gemma4:e4b` model (or another compatible model)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start Ollama** (in a separate terminal):
   ```bash
   ollama serve
   ```

3. **Pull the Gemma model** (if not already installed):
   ```bash
   ollama pull gemma4:e4b
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Visit `http://localhost:3000/`

## API Configuration

The app connects to Ollama's generate endpoint at `http://localhost:11434/api/generate`. To use a different model:

1. Edit `src/services/geminiService.ts`
2. Change `MODEL_NAME` to your desired model (e.g., `mistral`, `neural-chat`, etc.)
3. Restart the dev server

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run TypeScript type checking

## Project Structure

```
src/
├── components/      # React components (ChatInterface, Message)
├── services/        # API integration (Ollama)
├── types.ts         # TypeScript type definitions
├── App.tsx          # Main application component
└── main.tsx         # Entry point
```

## License

Apache-2.0
