import { Pinecone } from '@pinecone-database/pinecone';
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import fs from 'fs';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function uploadToPinecone() {
    console.log("🤖 Initializing Local Model...");
    const embeddings = new HuggingFaceTransformersEmbeddings({
        modelName: "Xenova/all-MiniLM-L6-v2", 
    });

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pc.index({ host: process.env.PINECONE_INDEX_HOST! });

    const verses = JSON.parse(fs.readFileSync('gita.json', 'utf-8'));
    const batchSize = 50; 

    for (let i = 0; i < verses.length; i += batchSize) {
        const batch = verses.slice(i, i + batchSize);
        console.log(`🚀 Processing batch: ${i + 1} to ${i + batch.length}...`);

        const records = [];

        for (const verse of batch) {
            const text = verse.fullText || verse.translation || "";
            const vector = await embeddings.embedQuery(text);

            records.push({
                id: verse.id,
                values: vector,
                metadata: {
                    verseNumber: verse.verseNumber,
                    translation: verse.translation || ""
                }
            });
        }

        // CORRECT V4 SYNTAX: Pass an object with a 'records' key
        await index.upsert({ records }); 
        console.log(`✅ Upserted ${records.length} records.`);
    }
}

uploadToPinecone().then(() => console.log("🎉 SUCCESS!")).catch(console.error);