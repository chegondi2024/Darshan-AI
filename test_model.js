import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function test() {
  const models = ['gemini-1.5-flash', 'gemini-pro', 'gemini-1.5-flash-latest'];
  for (const m of models) {
    try {
      console.log(`Testing model: ${m}`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Hello");
      console.log(`Success with ${m}: ${result.response.text()}`);
      break;
    } catch (e) {
      console.error(`Failed with ${m}: ${e.message}`);
    }
  }
}

test();
