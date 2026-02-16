import { useState, useRef, useEffect } from 'react';
import { usePets } from '../context/PetContext';
import { askCoaching } from '../services/analysis';
import ErrorBanner from '../components/ErrorBanner';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

export default function CoachingPage() {
  const { selectedPet } = usePets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!selectedPet || !input.trim() || loading) return;
    const question = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: question }]);
    setLoading(true);
    setError('');

    try {
      const result = await askCoaching(selectedPet.id, question);
      setMessages((prev) => [...prev, { role: 'ai', content: result.response }]);
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

      {error && <ErrorBanner message={error} onDismiss={() => setError('')} />}

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon">{'\ud83e\udde0'}</div>
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
              {msg.content}
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
