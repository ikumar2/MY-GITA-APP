import { groq } from '@ai-sdk/groq';
import { streamText } from 'ai';
import { getPineconeIndex } from '@/lib/pinecone';
import { HuggingFaceTransformersEmbeddings } from '@langchain/community/embeddings/huggingface_transformers';

export const dynamic = 'force-dynamic';
const embeddings = new HuggingFaceTransformersEmbeddings({
  model: 'Xenova/all-MiniLM-L6-v2',
});

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

    // 2. Vector Search (Pinecone) - only if configured
    if (process.env.PINECONE_API_KEY && process.env.PINECONE_INDEX_HOST) {
      try {
        if (isDev) console.log('🔍 Using Pinecone vector search...');
        const queryVector = await embeddings.embedQuery(lastMessage);

        const index = getPineconeIndex();
        const result = await index.query({
          vector: queryVector,
          topK: 3,
          includeMetadata: true,
        });

        context = result.matches
          .map((match) => match.metadata?.translation)
          .filter((translation): translation is string => typeof translation === 'string')
          .join('\n\n');

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
      }
    }

    // 3. Streaming Response
    const result = streamText({
      model: groq(process.env.GROQ_MODEL || 'openai/gpt-oss-120b'),
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