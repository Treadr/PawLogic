import { useState, useRef, useEffect, useCallback } from 'react';
import { usePets } from '../context/PetContext';
import { askCoaching, listSessions, getSession, deleteSession } from '../services/analysis';
import ErrorBanner from '../components/ErrorBanner';
import type { CoachingSession } from '../types';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

function FormattedText({ text }: { text: string }) {
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="formatted-text">
      {paragraphs.map((para, i) => {
        const lines = para.split('\n');
        const isList = lines.every((l) => /^[\s]*[-*\u2022\d+.)]\s/.test(l) || l.trim() === '');
        if (isList) {
          return (
            <ul key={i} className="coach-list">
              {lines.filter((l) => l.trim()).map((line, j) => (
                <li key={j}>{formatInline(line.replace(/^[\s]*[-*\u2022]\s?|^[\s]*\d+[.)]\s?/, ''))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{lines.map((line, j) => (
          <span key={j}>{formatInline(line)}{j < lines.length - 1 && <br />}</span>
        ))}</p>;
      })}
    </div>
  );
}

function formatInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function formatSessionDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default function CoachingPage() {
  const { selectedPet } = usePets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionTitle, setSessionTitle] = useState<string | null>(null);
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [showSessions, setShowSessions] = useState(false);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadSessions = useCallback(async () => {
    if (!selectedPet) return;
    setSessionsLoading(true);
    try {
      const list = await listSessions(selectedPet.id);
      setSessions(list);
    } catch {
      // Silently fail -- sessions list is supplementary
    } finally {
      setSessionsLoading(false);
    }
  }, [selectedPet]);

  // Load sessions when pet changes or panel opens
  useEffect(() => {
    if (selectedPet) {
      loadSessions();
    }
  }, [selectedPet, loadSessions]);

  // Reset chat state when pet changes
  useEffect(() => {
    setMessages([]);
    setSessionId(null);
    setSessionTitle(null);
    setShowSessions(false);
  }, [selectedPet?.id]);

  const handleNewSession = () => {
    setMessages([]);
    setSessionId(null);
    setSessionTitle(null);
    setShowSessions(false);
  };

  const handleLoadSession = async (sid: string) => {
    try {
      setLoading(true);
      const detail = await getSession(sid);
      setSessionId(detail.id);
      setSessionTitle(detail.title);
      setMessages(
        detail.messages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'ai',
          content: m.content,
        }))
      );
      setShowSessions(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSession = async (sid: string) => {
    try {
      await deleteSession(sid);
      setSessions((prev) => prev.filter((s) => s.id !== sid));
      if (sessionId === sid) {
        handleNewSession();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete session');
    }
  };

  const handleSend = async () => {
    if (!selectedPet || !input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    setError('');

    try {
      const result = await askCoaching(selectedPet.id, question, sessionId ?? undefined);
      setMessages((prev) => [...prev, { role: 'ai', content: result.response }]);

      // Capture session_id on first message
      if (result.session_id && !sessionId) {
        setSessionId(result.session_id);
        setSessionTitle(question.slice(0, 100));
        // Refresh session list
        loadSessions();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!selectedPet) {
    return <div className="empty-state"><h3>Select a pet</h3></div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>AI Coaching - {selectedPet.name}</h2>
        <p>Ask questions about your pet's behavior and get science-backed advice</p>
      </div>

      {/* Session header bar */}
      <div className="session-header-bar">
        <div className="session-header-title">
          {sessionTitle ? sessionTitle : 'New conversation'}
        </div>
        <div className="session-header-actions">
          <button className="btn btn-sm btn-outline" onClick={handleNewSession}>
            + New
          </button>
          <button
            className={`btn btn-sm ${showSessions ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setShowSessions(!showSessions)}
          >
            Sessions
            {sessions.length > 0 && (
              <span className="session-badge">{sessions.length}</span>
            )}
          </button>
        </div>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      {/* Session list panel */}
      {showSessions && (
        <div className="session-list-panel">
          {sessionsLoading ? (
            <div className="session-list-empty">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="session-list-empty">No past sessions</div>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className={`session-list-item ${s.id === sessionId ? 'active' : ''}`}
              >
                <div
                  className="session-list-item-content"
                  onClick={() => handleLoadSession(s.id)}
                >
                  <div className="session-list-item-title">{s.title}</div>
                  <div className="session-list-item-meta">
                    {s.message_count} messages &middot; {formatSessionDate(s.updated_at)}
                  </div>
                </div>
                <button
                  className="session-list-delete"
                  onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id); }}
                  title="Delete session"
                >
                  &times;
                </button>
              </div>
            ))
          )}
        </div>
      )}

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">{"🧠"}</div>
              <h3>Ask the Behavior Coach</h3>
              <p>Ask about {selectedPet.name}'s behavior patterns, triggers, or get advice on training strategies.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 16 }}>
                {[
                  `Why does ${selectedPet.name} do this?`,
                  'What are common triggers?',
                  'How can I reduce this behavior?',
                  'What replacement behaviors can I teach?',
                ].map((q) => (
                  <button
                    key={q}
                    className="chip"
                    onClick={() => { setInput(q); }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              {msg.role === 'ai' ? <FormattedText text={msg.content} /> : msg.content}
            </div>
          ))}

          {loading && (
            <div className="chat-bubble ai" style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>
              Thinking...
            </div>
          )}

          <div ref={messagesEnd} />
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${selectedPet.name}'s behavior...`}
            disabled={loading}
          />
          <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
