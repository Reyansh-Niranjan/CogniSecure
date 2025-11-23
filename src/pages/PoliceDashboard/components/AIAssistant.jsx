// ============================================
// AI ASSISTANT COMPONENT
// ============================================
// This component provides an interactive AI chat interface for officers
// It uses OpenRouter API for AI responses with vision capabilities
// ============================================

import { useState, useRef, useEffect, useCallback } from 'react';

// OpenRouter API Key from environment (optionally provided)
const ENV_OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

/**
 * AIAssistant Component
 * Floating chat interface for AI assistance
 * 
 * Props:
 * @param {boolean} isOpen - Controlled open state (optional)
 * @param {function} onClose - Callback to close (optional)
 * @param {object} context - Context data (e.g., current incident with media)
 */
export default function AIAssistant({ isOpen: controlledIsOpen, onClose, onOpen, context, onContextProcessed }) {
  // State for chat visibility (internal if not controlled)
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isVisible = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  // Chat history state
  const [messages, setMessages] = useState([
    {
      id: 'msg-initial-0',
      type: 'assistant',
      text: 'Hello Officer. I am ready to assist you. I can analyze incident footage, draft reports, and summarize events.',
      timestamp: new Date()
    }
  ]);

  // Input state
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  // use refs for dedupe/processing to avoid race conditions with state updates
  const processingRef = useRef(false);
  const lastHandledContextRef = useRef(null);

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  // OpenRouter key can come from environment or from localStorage (dev-time entry)
  const [apiKey, setApiKey] = useState(() => {
    try {
      return ENV_OPENROUTER_API_KEY || (typeof localStorage !== 'undefined' ? localStorage.getItem('OPENROUTER_API_KEY') : null);
    } catch (e) {
      return ENV_OPENROUTER_API_KEY || null;
    }
  });
  const [keyInput, setKeyInput] = useState('');

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const saveKeyToLocal = () => {
    try {
      if (keyInput && typeof localStorage !== 'undefined') {
        localStorage.setItem('OPENROUTER_API_KEY', keyInput);
        setApiKey(keyInput);
        setKeyInput('');
      }
    } catch (e) {
      console.warn('Unable to save API key to localStorage', e);
    }
  };

  const clearLocalKey = () => {
    try {
      if (typeof localStorage !== 'undefined') localStorage.removeItem('OPENROUTER_API_KEY');
    } catch (e) {}
    setApiKey(ENV_OPENROUTER_API_KEY || null);
  };

  // Generate a reasonably-unique id for messages
  const genId = () => `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  // Call OpenRouter API
  const callOpenRouter = useCallback(async (prompt, imageUrl = null) => {
    const key = apiKey || ENV_OPENROUTER_API_KEY;
    if (!key) {
      const errorMessage = {
        id: genId(),
        type: 'assistant',
        text: "OpenRouter API key not configured. Paste it into the AI Assistant or set VITE_OPENROUTER_API_KEY.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    setIsTyping(true);
    try {
      const content = [{ type: 'text', text: prompt }];

      // Add image if available (Vision capability)
      if (imageUrl) {
        content.push({
          type: 'image_url',
          image_url: { url: imageUrl }
        });
      }

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://cognisecure.local', // Required by OpenRouter
          'X-Title': 'CogniSecure Police Dashboard'
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini', // Updated to a currently available OpenRouter model
          messages: [
            {
              role: 'system',
              content: 'You are an advanced AI assistant for law enforcement. You are precise, formal, and focused on public safety. You can analyze images to detect threats, weapons, and suspicious behavior.'
            },
            ...messages.filter(m => m.id !== 0).map(m => ({
              role: m.type === 'user' ? 'user' : 'assistant',
              content: m.text
            })),
            { role: 'user', content: content }
          ]
        })
      });

      if (!response.ok) {
        // Try to read error message from body
        let errText = `AI service error: ${response.status} ${response.statusText}`;
        try {
          const errBody = await response.json();
          if (errBody?.error) errText += ` - ${errBody.error}`;
          else if (errBody?.message) errText += ` - ${errBody.message}`;
        } catch (e) {
          // ignore JSON parse errors
        }
        const errorMessage = {
          id: genId(),
          type: 'assistant',
          text: errText,
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        throw new Error(errText);
      }

      const data = await response.json();
      const aiText = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.content ?? null;
      if (aiText) {
        const aiMessage = {
          id: genId(),
          type: 'assistant',
          text: aiText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const errorMessage = {
          id: genId(),
          type: 'assistant',
          text: 'No response from AI (empty choices).',
          timestamp: new Date(),
          isError: true
        };
        setMessages(prev => [...prev, errorMessage]);
        throw new Error('No response from AI');
      }

    } catch (error) {
      console.error('AI API Error:', error);
      const errorMessage = {
        id: genId(),
        type: 'assistant',
        text: "Connection Error: Unable to reach AI services. Please check your internet connection.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, apiKey]);

  const handleContextAction = useCallback(async (ctx) => {
    if (processingRef.current) return; // Prevent duplicate processing

    const { action, data } = ctx;
    let prompt = '';

    if (action === 'generate_fir') {
      prompt = `Draft a First Information Report (FIR) for this incident.
      Details:
      - Type: ${data.type}
      - Location: ${data.location}
      - Time: ${data.timestamp}
      - Description: ${data.description}

      Please analyze the visual evidence if provided and include technical details.`;
    } else if (action === 'summarize') {
      prompt = `Provide a concise summary of this incident for the shift briefing. Focus on key events and immediate actions required.`;
    }

    if (prompt) {
      processingRef.current = true;
      setIsProcessingAction(true);

      // Add user message representing the action
      const userMsg = {
        id: genId(),
        type: 'user',
        text: action === 'generate_fir' ? 'Draft FIR for this incident' : 'Summarize this incident',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMsg]);

      try {
        // Trigger AI call
        // Use snapshotUrl for vision analysis as video URLs (mp4) are not supported by image_url
        const imageUrl = data.snapshotUrl || (data.mediaUrl && data.mediaUrl.match(/\.(jpeg|jpg|gif|png)$/) ? data.mediaUrl : null);
        await callOpenRouter(prompt, imageUrl);
      } finally {
        processingRef.current = false;
        setIsProcessingAction(false);
      }
    }
  }, [callOpenRouter, isProcessingAction]);

  // Handle external context triggers (e.g., "Make a FIR")
  useEffect(() => {
    if (context && context.action && isVisible) {
      // Dedupe by context._id or by a simple signature so same action doesn't run multiple times
      const ctxId = context._id ?? JSON.stringify({ action: context.action, dataId: context.data?.id });
      if (lastHandledContextRef.current === ctxId) return;
      lastHandledContextRef.current = ctxId;

      handleContextAction(context);

      // Clear context after processing to prevent duplicate triggers in parent
      if (onContextProcessed) {
        onContextProcessed();
      }
    }
  }, [context, isVisible, handleContextAction, onContextProcessed]);

  // Clear the last handled context when the assistant is closed so the same context can be re-triggered later
  useEffect(() => {
    if (!isVisible) {
      lastHandledContextRef.current = null;
    }
  }, [isVisible]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isVisible, scrollToBottom]);

  // Pre-defined commands for quick access
  const suggestedCommands = [
    'Search recent incidents',
    'Analyze patterns',
    'Show crime statistics',
    'Find similar cases'
  ];

  

  // Handle sending a message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: genId(),
      type: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    await callOpenRouter(input);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleOpen = () => {
    if (onClose && isVisible) {
      // If visible and onClose provided, call it to close
      onClose();
    } else if (controlledIsOpen !== undefined) {
      // Controlled mode: call onOpen if provided to request open
      if (typeof onOpen === 'function' && !isVisible) {
        onOpen();
      }
      // If controlled but no onOpen, do nothing
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className="ai-assistant-toggle"
        onClick={toggleOpen}
        aria-label="Toggle AI Assistant"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {!isVisible && messages.some(m => !m.read && m.type === 'assistant') && (
          <span className="notification-dot"></span>
        )}
      </button>

      {/* Chat Interface Window */}
      {isVisible && (
        <div className="ai-assistant animate-slideInRight">
          {/* Header */}
          <div className="ai-header">
            <div className="ai-header-content">
              <div className="ai-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <h3>AI Assistant</h3>
                <span className="ai-status">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <button onClick={toggleOpen} className="close-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Security Banner */}
          <div className="security-banner">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" />
            </svg>
            <span>Secure Connection • Vision Enabled</span>
          </div>

          {/* API Key entry (development) */}
          {!apiKey && (
            <div className="api-key-input" style={{ padding: '12px var(--space-lg)', borderBottom: '1px solid var(--color-border)', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="password"
                placeholder="Paste OpenRouter API key (stored locally)"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
              />
              <button className="send-btn" onClick={saveKeyToLocal} disabled={!keyInput} style={{ padding: '8px 12px' }}>
                Save
              </button>
              {ENV_OPENROUTER_API_KEY && (
                <button className="send-btn" onClick={() => setApiKey(ENV_OPENROUTER_API_KEY)} style={{ padding: '8px 12px' }}>
                  Use Env
                </button>
              )}
            </div>
          )}

          {/* Messages Area */}
          <div className="ai-messages">
            {messages.map(message => (
              <div key={message.id} className={`message ${message.type}`}>
                {message.type === 'assistant' && (
                  <div className="message-avatar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="2" />
                    </svg>
                  </div>
                )}
                <div className="message-content">
                  <p style={{ whiteSpace: 'pre-wrap' }}>{message.text}</p>
                  <span className="message-time">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="message assistant">
                <div className="message-avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="2" />
                  </svg>
                </div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Commands */}
          <div className="suggested-commands">
            {suggestedCommands.map((command, index) => (
              <button
                key={index}
                className="suggested-command"
                onClick={() => setInput(command)}
              >
                {command}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="ai-input-container">
            <textarea
              className="ai-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="1"
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Component-scoped styles */}
      <style>{`
        .ai-assistant-toggle {
          position: fixed;
          bottom: var(--space-xl);
          right: var(--space-xl);
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--glow-primary), var(--shadow-xl);
          transition: all var(--transition-base);
          z-index: 9999; /* Force high z-index */
        }

        .ai-assistant-toggle:hover {
          transform: scale(1.1);
          box-shadow: 0 0 40px var(--color-primary-glow);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 12px;
          height: 12px;
          background: var(--color-danger);
          border: 2px solid var(--color-bg-primary);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .ai-assistant {
          position: fixed;
          bottom: var(--space-xl);
          right: var(--space-xl);
          width: 420px;
          height: 600px;
          background: var(--color-bg-glass);
          backdrop-filter: blur(20px);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
          z-index: 9999; /* Force high z-index */
          overflow: hidden;
        }

        .ai-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-lg);
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-bottom: 1px solid var(--color-border);
        }

        .ai-header-content {
          display: flex;
          align-items: center;
          gap: var(--space-md);
        }

        .ai-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .ai-header h3 {
          font-size: 1rem;
          margin-bottom: 2px;
        }

        .ai-status {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          background: var(--color-success);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .close-btn {
          width: 32px;
          height: 32px;
          background: var(--color-bg-glass-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
        }

        .close-btn:hover {
          background: var(--color-danger);
          color: white;
          border-color: var(--color-danger);
        }

        .security-banner {
          display: flex;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-sm) var(--space-lg);
          background: rgba(16, 185, 129, 0.1);
          border-bottom: 1px solid var(--color-success);
          color: var(--color-success);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .ai-messages {
          flex: 1;
          overflow-y: auto;
          padding: var(--space-lg);
          display: flex;
          flex-direction: column;
          gap: var(--space-md);
        }

        .message {
          display: flex;
          gap: var(--space-sm);
          animation: fadeIn 0.3s ease-out;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-xs);
          max-width: 70%;
        }

        .message.user .message-content {
          align-items: flex-end;
        }

        .message-content p {
          padding: var(--space-md);
          background: var(--color-bg-glass-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          line-height: 1.5;
          font-size: 0.875rem;
        }

        .message.user .message-content p {
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          color: white;
          border-color: var(--color-primary);
        }

        .message-time {
          font-size: 0.7rem;
          color: var(--color-text-muted);
          padding: 0 var(--space-sm);
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: var(--space-md);
          background: var(--color-bg-glass-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
        }

        .typing-indicator span {
          width: 8px;
          height: 8px;
          background: var(--color-primary);
          border-radius: 50%;
          animation: typing 1.4s ease-in-out infinite;
        }

        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }

        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .suggested-commands {
          display: flex;
          gap: var(--space-sm);
          padding: var(--space-md) var(--space-lg);
          overflow-x: auto;
          border-top: 1px solid var(--color-border);
        }

        .suggested-command {
          padding: var(--space-sm) var(--space-md);
          background: var(--color-bg-glass-light);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          color: var(--color-text-secondary);
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
          font-family: inherit;
        }

        .suggested-command:hover {
          background: var(--color-primary);
          color: white;
          border-color: var(--color-primary);
        }

        .ai-input-container {
          display: flex;
          gap: var(--space-sm);
          padding: var(--space-lg);
          border-top: 1px solid var(--color-border);
          background: var(--color-bg-secondary);
        }

        .ai-input {
          flex: 1;
          padding: var(--space-md);
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-family: inherit;
          font-size: 0.875rem;
          resize: none;
          outline: none;
          transition: all var(--transition-base);
          max-height: 100px;
        }

        .ai-input:focus {
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-primary-glow);
        }

        .send-btn {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          border: none;
          border-radius: var(--radius-md);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-base);
          flex-shrink: 0;
        }

        .send-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: var(--glow-primary);
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .ai-assistant {
            width: calc(100vw - var(--space-xl) * 2);
            height: 500px;
          }
        }
      `}</style>
    </>
  );
}
