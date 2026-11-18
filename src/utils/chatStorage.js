/**
 * Client-side chat session and conversation index.
 *
 * The backend stores one conversation per anonymous sessionId. To offer a
 * ChatGPT-style history for guests, the browser keeps an index of the
 * conversations it has started — each with its own session token. Message
 * content is always loaded from the API; only metadata lives here.
 */

const SESSION_KEY = 'uac.chat.sessionId';
const INDEX_KEY = 'uac.chat.conversations';
const ACTIVE_KEY = 'uac.chat.activeConversationId';
const MAX_ENTRIES = 40;

export const createSessionId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
};

export const getSessionId = () => localStorage.getItem(SESSION_KEY);

export const persistSessionId = (sessionId) => {
  if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
};

export const getActiveConversationId = () => localStorage.getItem(ACTIVE_KEY);

export const persistActiveConversationId = (conversationId) => {
  if (conversationId) {
    localStorage.setItem(ACTIVE_KEY, conversationId);
  } else {
    localStorage.removeItem(ACTIVE_KEY);
  }
};

export const readConversationIndex = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(INDEX_KEY));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.conversationId && item?.sessionId);
  } catch {
    return [];
  }
};

const writeIndex = (entries) => {
  const sorted = [...entries]
    .sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
    .slice(0, MAX_ENTRIES);
  localStorage.setItem(INDEX_KEY, JSON.stringify(sorted));
  return sorted;
};

export const upsertConversation = (entry) => {
  const remaining = readConversationIndex().filter(
    (item) => item.conversationId !== entry.conversationId,
  );
  return writeIndex([entry, ...remaining]);
};

export const removeConversation = (conversationId) =>
  writeIndex(
    readConversationIndex().filter(
      (item) => item.conversationId !== conversationId,
    ),
  );

/** Merge server-authored summaries into the local index (last write wins). */
export const mergeConversations = (entries) => {
  const byId = new Map(
    readConversationIndex().map((item) => [item.conversationId, item]),
  );

  for (const entry of entries) {
    if (!entry?.conversationId || !entry?.sessionId) continue;
    byId.set(entry.conversationId, {
      ...byId.get(entry.conversationId),
      ...entry,
    });
  }

  return writeIndex([...byId.values()]);
};
