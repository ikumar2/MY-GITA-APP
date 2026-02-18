# Data Pipeline Scripts

These scripts are used to scrape Bhagavad Gita verses and populate the Pinecone vector database.

## Prerequisites

```bash
# Ensure you have .env.local with:
PINECONE_API_KEY=your_key
PINECONE_INDEX_HOST=your_host
HUGGINGFACE_API_KEY=your_key (optional, for API-based embeddings)
```

## Scripts

### 1. `scrape.ts` - Scrape Verses from VedaBase
Scrapes Bhagavad Gita verses from https://vedabase.io

```bash
npx tsx scripts/scrape.ts
```

**Output:** `gita.json` containing verse data with translations

### 2. `upload.ts` - Upload to Pinecone
Generates embeddings and uploads verses to Pinecone vector database

```bash
npx tsx scripts/upload.ts
```

**Note:** Requires `gita.json` from the scrape step

## Workflow

1. Run scraper: `npx tsx scripts/scrape.ts`
2. Review generated `gita.json`
3. Upload to Pinecone: `npx tsx scripts/upload.ts`
4. Test in app: Ask Gita-related questions

## Notes

- These are one-time setup scripts
- For updates, run the same scripts again
- Keep `.env.local` out of version control (already in .gitignore)
