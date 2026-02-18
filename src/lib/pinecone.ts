import { Pinecone } from '@pinecone-database/pinecone';

// Singleton pattern: This ensures we only create the Pinecone client once
// even if the server restarts or reloads during development.
const globalForPinecone = global as unknown as { pinecone?: Pinecone };

let pinecone: Pinecone | null = null;

export const getPinecone = () => {
  if (pinecone) return pinecone;
  
  if (!process.env.PINECONE_API_KEY) {
    throw new Error('PINECONE_API_KEY is not defined in .env.local');
  }

  pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
  });

  if (process.env.NODE_ENV !== 'production') {
    globalForPinecone.pinecone = pinecone;
  }

  return pinecone;
};

// Helper to get your index quickly
export const getPineconeIndex = () => {
  const host = process.env.PINECONE_INDEX_HOST;
  if (!host) throw new Error('PINECONE_INDEX_HOST is not defined');
  
  return getPinecone().index({ host });
};