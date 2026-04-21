/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Message } from "../types";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "gemma4:e4b";

/**
 * Basic guardrails to filter prohibited keywords.
 * Phase 1.3 of the development plan.
 */
const prohibitedKeywords = [
  "hate speech",
  "illegal content",
  "violence",
  "harmful activities",
];

export function validateInput(text: string): { isValid: boolean; reason?: string } {
  const lowercaseText = text.toLowerCase();
  for (const keyword of prohibitedKeywords) {
    if (lowercaseText.includes(keyword)) {
      return { 
        isValid: false, 
        reason: "I cannot fulfill this request as it violates my safety guidelines." 
      };
    }
  }
  return { isValid: true };
}

/**
 * Handles communication with Ollama API with streaming support.
 * Phase 1.1 & 1.2 of the development plan.
 */
export async function* getModelResponseStream(history: Message[]) {
  // Phase 3.1: Context Management (Truncation)
  // Keep the last 15 messages to ensure we stay within context limits
  const truncatedHistory = history.length > 15 ? history.slice(-15) : history;

  // Format history into a single prompt
  let prompt = "";
  for (const msg of truncatedHistory) {
    if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n`;
    } else if (msg.role === 'model') {
      prompt += `Assistant: ${msg.content}\n`;
    }
  }
  prompt += "Assistant: ";

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("Failed to read response stream");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      
      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          try {
            const json = JSON.parse(line);
            if (json.response) {
              yield json.response;
            }
          } catch (e) {
            // Skip invalid JSON lines
          }
        }
      }
    }

    // Process any remaining data in the buffer
    if (buffer.trim()) {
      try {
        const json = JSON.parse(buffer);
        if (json.response) {
          yield json.response;
        }
      } catch (e) {
        // Skip invalid JSON
      }
    }
  } catch (error) {
    console.error("Ollama API Error:", error);
    throw new Error("Failed to connect to Ollama. Please ensure the local Ollama server is running on 127.0.0.1:11434 with the gemma2:e2b model loaded.");
  }
}
