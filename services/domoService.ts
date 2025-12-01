import { RagResponse, AiResponse } from '../types';

const DEFAULT_FILESET_ID = 'b0b29ed0-d279-4258-b2d7-d3e8101f54e5';

/**
 * Searches documents using the RAG endpoint.
 */
export const searchDocuments = async (
  query: string,
  fileSetId: string = DEFAULT_FILESET_ID,
  topk: number = 3
): Promise<RagResponse> => {
  try {
    const inputParameters = {
      query,
      fileSet: fileSetId,
      topk,
    };

    // Ryuu.js call to Code Engine
    const data = await domo.post(
      `/domo/codeengine/v2/packages/rag`,
      inputParameters
    );
    return data as RagResponse;
  } catch (error) {
    console.error('Error searching documents:', error);
    // Return empty matches on error to allow graceful degradation (chat without context)
    return { matches: [] };
  }
};

/**
 * Generates text using the AI endpoint.
 */
export const generateAiResponse = async (prompt: string): Promise<string> => {
  try {
    const body = {
      input: prompt,
    };

    // Ryuu.js call to AI Service
    const response = await domo.post(`/domo/ai/v1/text/generation`, body);
    const aiResponse = response as AiResponse;

    if (aiResponse.choices && aiResponse.choices.length > 0) {
      return aiResponse.choices[0].output;
    }
    return "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to communicate with AI service.');
  }
};

/**
 * Orchestrates the RAG flow: Search -> Construct Prompt -> Generate.
 */
export const handleRagChat = async (
  userQuery: string,
  fileSetId: string
): Promise<{ text: string; sources: string[] }> => {
  // 1. Search for context
  const searchResults = await searchDocuments(userQuery, fileSetId);

  // 2. Extract context text and unique sources
  const matches = searchResults.matches || [];
  const sources = Array.from(new Set(matches.map((m) => m.metadata.path)));

  let contextText = '';
  if (matches.length > 0) {
    contextText = matches
      .map((m) => `[Source: ${m.metadata.path}]\n${m.content.text}`)
      .join('\n\n---\n\n');
  }

  // 3. Construct the augmented prompt
  const finalPrompt = matches.length > 0
    ? `You are a helpful assistant. Use the following retrieved documentation to answer the user's question. If the answer is not in the documentation, say so, but try to be helpful based on general knowledge if possible.\n\nDOCUMENTATION:\n${contextText}\n\nUSER QUESTION:\n${userQuery}`
    : userQuery; // Fallback to raw query if no matches found

  // 4. Generate Answer
  const aiText = await generateAiResponse(finalPrompt);

  return {
    text: aiText,
    sources,
  };
};