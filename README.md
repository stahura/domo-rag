# Ryuu RAG Assistant

A Retrieval-Augmented Generation (RAG) chat application built for Domo. This assistant allows users to chat with their documents stored in Domo Filesets using Domo's AI and Code Engine services.

## Features

*   **RAG-Powered Chat**: Answers user questions using context retrieved from specific documents.
*   **Dynamic Knowledge Base Selection**: Automatically fetches AI-enabled Filesets from Domo and allows users to switch between them dynamically.
*   **Markdown Rendering**: Rich text formatting for AI responses (tables, lists, code blocks, bold/italic text).
*   **Domo Native Integration**: Seamless authentication and API calls using `ryuu.js`.
*   **Iframe Optimized**: Custom scroll handling to ensure smooth experience when embedded within Domo dashboards or other websites.
*   **Modern UI**: Clean interface with Domo branding, loading states, and responsive design.

## How It Works

The application orchestrates a RAG flow using three main Domo APIs. Here is the core logic located in `services/domoService.ts`:

### 1. Fetching Knowledge Bases (Filesets)
The app dynamically retrieves available filesets that have been flagged as "AI Enabled".

```typescript
export const getFilesets = async (): Promise<any[]> => {
  const body = {
    fieldSort: [{ field: 'name', order: 'ASC' }],
    filters: [{ field: 'ai_enabled', value: [true], operator: 'EQUALS' }],
  };
  // Hits the Domo Filesets Search API
  const response = await domo.post('/domo/files/v1/filesets/search', body);
  return response.fileSets || [];
};
```

### 2. Semantic Search (Retrieval)
When a user asks a question, the app queries the selected Fileset for relevant context.

```typescript
export const searchDocuments = async (query: string, fileSetId: string, topK: number = 1) => {
  const endpoint = `/domo/files/v1/filesets/${fileSetId}/query`;
  const payload = {
    query,
    directoryPath: "", // Root directory of the fileset
    topK, // Number of relevant chunks to retrieve
  };
  return await domo.post(endpoint, payload);
};
```

### 3. AI Generation
The retrieved context is combined with the user's query to create a prompt for the AI model.

```typescript
export const handleRagChat = async (userQuery: string, fileSetId: string) => {
  // 1. Search for relevant content
  const searchResults = await searchDocuments(userQuery, fileSetId);
  
  // 2. Construct the prompt with context
  const contextText = searchResults.matches.map(m => m.content.text).join('\n\n');
  const finalPrompt = `... DOCUMENTATION:\n${contextText}\n\nUSER QUESTION:\n${userQuery}`;

  // 3. Generate response using Domo AI Service
  const response = await domo.post(`/domo/ai/v1/text/generation`, { input: finalPrompt });
  return { text: response.choices[0].output, sources: ... };
};
```

## Setup & Development

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Build**:
    ```bash
    npm run build
    ```

3.  **Deploy**:
    Upload the contents of the `dist` folder to your Domo App design.

## Tech Stack

*   **React 19**: UI Framework
*   **Vite**: Build tool
*   **Ryuu.js**: Domo Platform SDK
*   **Tailwind CSS**: Styling
*   **React Markdown**: Response rendering
*   **Lucide React**: Icons
