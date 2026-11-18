import api from './api';

// Retrieval plus local LLM inference can exceed the backend's 120s Ollama
// timeout once document embeddings are involved, so allow a wider margin.
const ANSWER_TIMEOUT_MS = 180_000;

export const chatService = {
  /**
   * POST /api/chat/message
   * Anonymous callers pass their sessionId; the first turn may omit it and
   * the API returns a generated one.
   *
   * Files are sent as multipart/form-data under the "attachments" field;
   * Axios sets the boundary header itself.
   */
  sendMessage: ({ question, sessionId, topK, minScore, category, files = [] }) => {
    if (files.length > 0) {
      const form = new FormData();
      form.append('question', question);
      if (sessionId) form.append('sessionId', sessionId);

      files.forEach((file) => form.append('attachments', file, file.name));

      return api.post('/chat/message', form, { timeout: ANSWER_TIMEOUT_MS });
    }

    const payload = { question };
    if (sessionId) payload.sessionId = sessionId;
    if (typeof topK === 'number') payload.topK = topK;
    if (typeof minScore === 'number') payload.minScore = minScore;
    if (category) payload.category = category;

    return api.post('/chat/message', payload, { timeout: ANSWER_TIMEOUT_MS });
  },

  /** GET /api/chat/history — requires sessionId for guests. */
  listHistory: (params) => api.get('/chat/history', { params }),

  /** GET /api/chat/:id — guests must present the conversation's sessionId. */
  getConversation: (conversationId, sessionId) =>
    api.get(`/chat/${conversationId}`, { params: { sessionId } }),

  /** DELETE /api/chat/:id — soft delete. */
  deleteConversation: (conversationId, sessionId) =>
    api.delete(`/chat/${conversationId}`, { params: { sessionId } }),
};
