import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { getPineconeIndex } from '@/lib/pinecone';
import { HfInference } from '@huggingface/inference';

export const dynamic = 'force-dynamic';
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  const isDev = process.env.NODE_ENV !== 'production';

  try {
    const { messages } = await req.json();
    
    if (!messages || messages.length === 0) {
      return new Response('No messages provided', { status: 400 });
    }

    // 1. Get the text of the last message
    const lastMessage = messages[messages.length - 1]?.content;
    if (!lastMessage) {
      return new Response('Last message has no content', { status: 400 });
    }

    let context = '';
    let usedPinecone = false;

    // 2. Vector Search (Pinecone) - only if configured
    if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_HOST && process.env.HUGGINGFACE_API_KEY) {
      try {
        if (isDev) console.log('🔍 Using Pinecone vector search...');
        const embedding = await hf.featureExtraction({
          model: 'sentence-transformers/all-MiniLM-L6-v2',
          inputs: lastMessage,
        });
        const queryVector = embedding as number[];

        const index = getPineconeIndex();
        const result = await index.query({
          vector: queryVector,
          topK: 3,
          includeMetadata: true,
        });

        context = result.matches
          .map((m: any) => m.metadata?.translation)
          .filter(Boolean)
          .join('\n\n');
        
        usedPinecone = true;
        if (isDev) console.log(`✅ Retrieved ${result.matches.length} verses from Pinecone`);
      } catch (pineconeError) {
        if (isDev) console.warn('⚠️ Pinecone error:', pineconeError);
        // Silently continue in production, log in dev
      }
    } else {
      if (isDev) {
        console.log('⚠️ Pinecone not configured');
        if (!process.env.PINECONE_API_KEY) console.log('  - PINECONE_API_KEY missing');
        if (!process.env.PINECONE_INDEX_HOST) console.log('  - PINECONE_INDEX_HOST missing');
        if (!process.env.HUGGINGFACE_API_KEY) console.log('  - HUGGINGFACE_API_KEY missing');
      }
    }

    // 3. Streaming Response
    const result = streamText({
      model: groq('llama-3.3-70b-versatile'),
      system: context 
        ? `You are a Bhagavad Gita expert. Use the following verses from the Gita to inform your answer:\n\n${context}`
        : 'You are a knowledgeable expert on the Bhagavad Gita. Provide insightful answers based on your knowledge.',
      messages: messages,
    });

    // Stream the text content
    return new Response(result.textStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    if (isDev) {
      console.error("API ERROR:", error);
    }
    // In production, return generic error to client
    return new Response(JSON.stringify({ 
      error: isDev && error instanceof Error ? error.message : 'Unable to process request'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}