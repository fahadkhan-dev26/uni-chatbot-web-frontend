import { useCallback, useEffect, useRef, useState } from 'react';
import { chatService } from '../services/chatService';
import { useAuth } from './useAuth';
import {
  createSessionId,
  getActiveConversationId,
  getSessionId,
  mergeConversations,
  persistActiveConversationId,
  persistSessionId,
  readConversationIndex,
  removeConversation,
  upsertConversation,
} from '../utils/chatStorage';

const createMessageId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `m-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const toErrorMessage = (error) =>
  error?.friendlyMessage ||
  error?.message ||
  'Something went wrong. Please try again.';

const isUnavailableConversation = (error) =>
  error?.response?.status === 404 || error?.response?.status === 403;

const mapServerMessages = (messages = []) =>
  messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      sources: message.sources ?? [],
      attachments: message.attachments ?? [],
      createdAt: message.createdAt,
    }));

/**
 * Owns the student chat state: the active conversation, optimistic message
 * flow, anonymous session tokens and the local conversation index.
 */
export function useChat() {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState(readConversationIndex);
  const [sessionId, setSessionId] = useState(
    () => getSessionId() || createSessionId(),
  );
  const [conversationId, setConversationId] = useState(
    () => getActiveConversationId(),
  );
  const [isSending, setIsSending] = useState(false);
  const [isLoadingConversation, setIsLoadingConversation] = useState(
    () => Boolean(getActiveConversationId()),
  );
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const sendingRef = useRef(false);
  const lastQuestionRef = useRef(null);
  const loadTokenRef = useRef(0);
  // Bumped whenever the visible conversation changes (new chat, load, delete).
  // An answer that arrives after that point belongs to a conversation the
  // student is no longer looking at and must not be appended.
  const viewRef = useRef(0);

  useEffect(() => {
    persistSessionId(sessionId);
  }, [sessionId]);

  // Restore the conversation that was open when the page was last closed.
  useEffect(() => {
    const activeId = getActiveConversationId();
    const sid = getSessionId();
    if (!activeId || !sid) return undefined;

    const token = ++loadTokenRef.current;
    const isStale = () => token !== loadTokenRef.current;

    chatService
      .getConversation(activeId, sid)
      .then(({ data }) => {
        if (isStale()) return;
        const conversation = data.conversation;
        setMessages(mapServerMessages(conversation.messages));
        setConversationId(conversation.id);
        setSessionId(conversation.sessionId || sid);
        setIsLoadingConversation(false);
      })
      .catch((err) => {
        if (isStale()) return;
        setIsLoadingConversation(false);

        // A conversation deleted server-side (or a stale local entry) is not an
        // error the student can act on — drop it and open a fresh chat.
        if (isUnavailableConversation(err)) {
          setConversations(removeConversation(activeId));
          persistActiveConversationId(null);
          setConversationId(null);
          setSessionId(createSessionId());
          return;
        }

        setError({ type: 'load', message: toErrorMessage(err) });
      });

    return undefined;
  }, []);

  // Refresh conversation metadata from the server: every conversation for a
  // signed-in user, or the current session's conversation for a guest.
  useEffect(() => {
    const guestSessionId = getSessionId();
    if (!isAuthenticated && !getActiveConversationId()) return undefined;
    if (!isAuthenticated && !guestSessionId) return undefined;

    const params = isAuthenticated
      ? { limit: 20 }
      : { sessionId: guestSessionId, limit: 20 };

    let cancelled = false;

    chatService
      .listHistory(params)
      .then(({ data }) => {
        if (cancelled) return;
        const entries = (data.conversations ?? [])
          .map((conversation) => ({
            conversationId: conversation.id,
            sessionId: conversation.sessionId,
            title: conversation.title,
            messageCount: conversation.messageCount,
            lastMessageAt: conversation.lastMessageAt,
          }))
          .filter((entry) => entry.conversationId && entry.sessionId);

        if (entries.length) setConversations(mergeConversations(entries));
      })
      .catch((error) => {
        console.warn('Could not refresh conversation history:', error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const submit = useCallback(
    async (rawQuestion, { appendUser = true, files = [] } = {}) => {
      const question = rawQuestion.trim();
      if (!question || sendingRef.current) return;

      lastQuestionRef.current = { question, files };
      sendingRef.current = true;
      const view = viewRef.current;
      setIsSending(true);
      setError(null);

      if (appendUser) {
        setMessages((previous) => [
          ...previous,
          {
            id: createMessageId(),
            role: 'user',
            content: question,
            sources: [],
            attachments: files.map((file) => ({
              name: file.name,
              type: file.type,
              size: file.size,
            })),
            createdAt: new Date().toISOString(),
          },
        ]);
      }

      try {
        const { data } = await chatService.sendMessage({
          question,
          sessionId,
          files,
        });

        if (view !== viewRef.current) return;

        setMessages((previous) => [
          ...previous,
          {
            id: createMessageId(),
            role: 'assistant',
            content: data.answer,
            sources: data.sources ?? [],
            meta: data.meta,
            createdAt: new Date().toISOString(),
          },
        ]);

        setSessionId(data.sessionId);
        setConversationId(data.conversationId);
        persistActiveConversationId(data.conversationId);

        const existing = conversations.find(
          (item) => item.conversationId === data.conversationId,
        );
        const nextIndex = upsertConversation({
          conversationId: data.conversationId,
          sessionId: data.sessionId,
          title: existing?.title || question.slice(0, 80),
          messageCount: (existing?.messageCount ?? 0) + 2,
          lastMessageAt: new Date().toISOString(),
        });
        setConversations(nextIndex);
      } catch (err) {
        if (view === viewRef.current) {
          setError({ type: 'send', message: toErrorMessage(err) });
        }
      } finally {
        sendingRef.current = false;
        setIsSending(false);
      }
    },
    [conversations, sessionId],
  );

  const sendMessage = useCallback(
    (question, files = []) => submit(question, { files }),
    [submit],
  );

  const startNewChat = useCallback(() => {
    viewRef.current += 1;
    loadTokenRef.current += 1;
    setIsLoadingConversation(false);
    setSessionId(createSessionId());
    setConversationId(null);
    persistActiveConversationId(null);
    setMessages([]);
    setError(null);
    lastQuestionRef.current = null;
  }, []);

  const loadConversation = useCallback(
    async (id) => {
      const entry = conversations.find(
        (item) => item.conversationId === id,
      );
      if (!entry) return false;

      const token = ++loadTokenRef.current;
      viewRef.current += 1;
      setError(null);
      setIsLoadingConversation(true);
      setSessionId(entry.sessionId);
      setConversationId(entry.conversationId);
      persistActiveConversationId(entry.conversationId);

      try {
        const { data } = await chatService.getConversation(
          entry.conversationId,
          entry.sessionId,
        );
        if (token !== loadTokenRef.current) return true;
        const conversation = data.conversation;
        setMessages(mapServerMessages(conversation.messages));
        setSessionId(conversation.sessionId || entry.sessionId);
        return true;
      } catch (err) {
        if (token !== loadTokenRef.current) return true;

        if (isUnavailableConversation(err)) {
          setConversations(removeConversation(entry.conversationId));
          persistActiveConversationId(null);
          setSessionId(createSessionId());
          setConversationId(null);
          setMessages([]);
          setError(null);
          return true;
        }

        setMessages([]);
        setError({ type: 'load', message: toErrorMessage(err) });
        return true;
      } finally {
        if (token === loadTokenRef.current) setIsLoadingConversation(false);
      }
    },
    [conversations],
  );

  /**
   * @returns {Promise<{ ok: boolean, message?: string }>}
   */
  const deleteConversation = useCallback(
    async (id) => {
      const entry = conversations.find(
        (item) => item.conversationId === id,
      );
      if (!entry) return { ok: false, message: 'Conversation not found.' };

      setDeletingId(id);
      try {
        await chatService.deleteConversation(id, entry.sessionId);
        setConversations(removeConversation(id));

        if (conversationId === id) {
          viewRef.current += 1;
          loadTokenRef.current += 1;
          setIsLoadingConversation(false);
          setSessionId(createSessionId());
          setConversationId(null);
          persistActiveConversationId(null);
          setMessages([]);
          setError(null);
          lastQuestionRef.current = null;
        }

        return { ok: true };
      } catch (err) {
        return { ok: false, message: toErrorMessage(err) };
      } finally {
        setDeletingId(null);
      }
    },
    [conversations, conversationId],
  );

  const retry = useCallback(async () => {
    if (error?.type === 'send' && lastQuestionRef.current) {
      submit(lastQuestionRef.current.question, {
        appendUser: false,
        files: lastQuestionRef.current.files,
      });
      return;
    }

    if (error?.type === 'load' && conversationId) {
      const loaded = await loadConversation(conversationId);
      if (!loaded) startNewChat();
      return;
    }

    startNewChat();
  }, [
    error,
    conversationId,
    submit,
    loadConversation,
    startNewChat,
  ]);

  return {
    messages,
    conversations,
    sessionId,
    conversationId,
    isSending,
    isLoadingConversation,
    deletingId,
    error,
    sendMessage,
    startNewChat,
    loadConversation,
    deleteConversation,
    retry,
  };
}
