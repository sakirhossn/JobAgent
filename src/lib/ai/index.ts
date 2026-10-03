import { AIProvider } from "./ai-provider.interface";
import { MockAIProvider } from "./mock-ai-provider";
import { GeminiAIProvider } from "./gemini-ai-provider";

let currentProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (currentProvider) return currentProvider;

  const providerType = process.env.AI_PROVIDER || "mock";
  if (providerType === "gemini" && process.env.GEMINI_API_KEY) {
    currentProvider = new GeminiAIProvider();
  } else {
    currentProvider = new MockAIProvider();
  }

  return currentProvider;
}

export function setAIProvider(provider: AIProvider): void {
  currentProvider = provider;
}
