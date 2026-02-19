# 🙏 Gita Guide: AI Research Tool as Bhagavad Gita AI Assistant

An intelligent AI-powered chat application that provides wisdom and guidance from the Bhagavad Gita using vector search and LLM technology.

## 🌟 Features

- **Real-time Chat Interface** - Interactive conversation with an AI Gita expert
- **Vector Search** - Retrieves relevant Gita verses using Pinecone vector database
- **Streaming Responses** - Real-time text streaming for immediate feedback
- **Intelligent Context** - Provides accurate answers grounded in actual Gita verses
- **Production-Ready** - Secure environment handling and error management
- **Responsive Design** - Beautiful UI with Tailwind CSS

## 🏗️ Architecture

```
my-gita-app/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main page
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   └── api/
│   │       └── chat/
│   │           └── route.ts      # Chat API endpoint
│   ├── components/
│   │   └── Chat.tsx              # Chat UI component
│   └── lib/
│       └── pinecone.ts           # Pinecone vector DB client
├── scripts/
│   ├── scrape.ts                 # Scrape verses from VedaBase
│   └── upload.ts                 # Upload to Pinecone
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **LLM**: Groq (llama-3.3-70b-versatile)
- **Vector DB**: Pinecone
- **Embeddings**: HuggingFace Transformers
- **AI SDK**: Vercel AI SDK 6.0
- **Web Scraping**: Playwright, Cheerio

## 📋 Prerequisites

- **Node.js 22+** (LTS) - [Install here](https://nodejs.org)
- **npm 10+** or yarn
- API Keys:
  - **Groq API Key** (LLM provider) - [Get here](https://console.groq.com)
  - **Pinecone API Key** (Optional but recommended) - [Get here](https://www.pinecone.io)
  - **HuggingFace API Key** (Optional, for embeddings) - [Get here](https://huggingface.co/settings/tokens)

### ✅ Verify Node Version

```bash
node -v    # Should show v22.x.x or higher
npm -v     # Should show 10.x.x or higher
```

### 📌 Node Version Management (Optional)

If you need to manage multiple Node versions:

```bash
# Using nvm (recommended)
nvm install 22
nvm use 22

# Using Homebrew (macOS)
brew install node@22
brew link node@22
```

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd my-gita-app
# Ensure you're using Node 22+
node -v  # Should show v22.x.x or higher
npm install
```

### 2. Setup Environment Variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Required - Groq LLM
GROQ_API_KEY=your_groq_api_key

# Optional - Pinecone Vector Database (for semantic search)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_HOST=your_pinecone_host

# Optional - HuggingFace (needed with Pinecone for embeddings)
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💬 Usage

1. Type your question about the Bhagavad Gita
2. The AI will:
   - Search for relevant verses in Pinecone (if configured)
   - Generate an intelligent response using Groq LLM
   - Stream the response in real-time
3. View the conversation history
4. Click "Reset" to clear chat

## 📊 Data Pipeline (One-time Setup)

To populate Pinecone with Gita verses:

### 1. Scrape Verses

```bash
npx tsx scripts/scrape.ts
```

This creates `gita.json` with verses from [VedaBase](https://vedabase.io)

### 2. Upload to Pinecone

```bash
npx tsx scripts/upload.ts
```

This generates embeddings and uploads to Pinecone.

See [scripts/README.md](scripts/README.md) for detailed instructions.

## ⚙️ Configuration

### Without Pinecone (Fallback Mode)

The app works without Pinecone! The AI will answer based on general knowledge:

```env
GROQ_API_KEY=your_groq_api_key
# Skip PINECONE_* and HUGGINGFACE_API_KEY
```

### With Pinecone (Recommended)

For RAG (Retrieval-Augmented Generation) with actual verses:

```env
GROQ_API_KEY=your_groq_api_key
PINECONE_API_KEY=your_key
PINECONE_INDEX_HOST=your_host
HUGGINGFACE_API_KEY=your_key
```

## 🧪 Development

### Run Dev Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## 🔍 How It Works

### Request Flow

```
User Input
    ↓
Frontend (Chat.tsx) - Sends to API
    ↓
API (route.ts)
    ├─ Generate Embedding (HuggingFace)
    ├─ Vector Search (Pinecone)
    ├─ Retrieve Relevant Verses
    └─ Generate Response (Groq LLM)
    ↓
Streaming Response
    ↓
Frontend - Display in Real-time
```

### Vector Search Process

1. User question → Embedding (HuggingFace)
2. Query Pinecone with embedding vector
3. Retrieve top 3 relevant verses
4. Include verses as context for LLM
5. LLM generates response citing Gita

## 📁 Project Structure

- `src/app/` - Next.js app directory (pages & API)
- `src/components/` - React components
- `src/lib/` - Utility functions (Pinecone client)
- `scripts/` - One-time setup scripts
- `public/` - Static assets
- `gita.json` - Verse database (generated)

## 🔒 Security

- ✅ Environment variables never exposed in code
- ✅ `.env.local` automatically excluded from git
- ✅ Production logging doesn't reveal infrastructure
- ✅ Safe for Vercel deployment
- ✅ No hardcoded API keys

See `.gitignore` for excluded files.

## 📦 Dependencies

### Key Packages

- `next` - React framework
- `@ai-sdk/groq` - Groq LLM integration
- `ai` - Vercel AI SDK
- `@pinecone-database/pinecone` - Vector DB
- `@huggingface/transformers` - Embeddings
- `playwright` - Web scraping
- `tailwindcss` - Styling

## 🚀 Deployment

### Deploy on Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
# Add secrets in Vercel Dashboard:
GROQ_API_KEY
PINECONE_API_KEY
PINECONE_INDEX_HOST
HUGGINGFACE_API_KEY
```

### Deploy on Other Platforms

Works on any Node.js hosting (Heroku, Railway, Fly.io, etc.)

## 📝 Environment Variables Reference

| Variable | Required | Purpose |
|----------|----------|---------|
| `GROQ_API_KEY` | ✅ Yes | LLM provider for responses |
| `PINECONE_API_KEY` | ❌ Optional | Vector database for semantic search |
| `PINECONE_INDEX_HOST` | ❌ Optional | Pinecone index endpoint |
| `HUGGINGFACE_API_KEY` | ❌ Optional | Embeddings generator |

## 🐛 Troubleshooting

### "Pinecone not configured" appears in logs

**Solution**: This is normal if you haven't set Pinecone keys. The app still works with LLM-only mode.

To enable Pinecone:
1. Get API key from [Pinecone](https://www.pinecone.io)
2. Add to `.env.local`
3. Run data pipeline scripts
4. Restart dev server

### No response from API

Check terminal logs:
- ❌ Missing `GROQ_API_KEY` → Add it to `.env.local`
- ⚠️ Pinecone error → Check Pinecone credentials (optional)
- ⚠️ Network error → Check API connectivity

### Verses not appearing in responses

1. Ensure Pinecone is set up: `scripts/scrape.ts` → `scripts/upload.ts`
2. Verify `PINECONE_INDEX_HOST` is correct
3. Check terminal for "Retrieved X verses from Pinecone"

## 📚 Resources

- [Bhagavad Gita - VedaBase](https://vedabase.io/en/library/bg)
- [Groq Documentation](https://console.groq.com/docs)
- [Pinecone Documentation](https://docs.pinecone.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel AI SDK](https://sdk.vercel.ai)

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please feel free to submit pull requests.

## 📧 Support

For issues and questions, please open a GitHub issue.

---

Made with 🙏 for seekers of wisdom
