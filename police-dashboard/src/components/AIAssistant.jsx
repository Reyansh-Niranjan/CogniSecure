import { useState, useRef, useEffect } from 'react';

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'assistant',
            text: 'Hello! I\'m your AI assistant. I can help you analyze incidents, search through logs, and provide insights. How can I assist you today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const suggestedCommands = [
        'Search recent incidents',
        'Analyze patterns',
        'Show crime statistics',
        'Find similar cases'
    ];

    const handleSend = () => {
        if (!input.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            type: 'user',
            text: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiResponses = [
                'I found 3 incidents matching your query in the past 24 hours. Would you like me to display them?',
                'Based on historical data, this appears to be consistent with typical patterns for this area during evening hours.',
                'I\'ve analyzed the footage. The subject appears to match the description from incident #12847. Cross-referencing now...',
                'Access to that information requires additional clearance. I\'ve logged your request for supervisor review.',
            ];

            const aiMessage = {
                id: messages.length + 2,
                type: 'assistant',
                text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
                timestamp: new Date(),
                restricted: Math.random() > 0.7
            };

            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <button
                className="ai-assistant-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle AI Assistant"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeWidth="2" strokeLinecap="round" />
                </svg>
                {!isOpen && messages.some(m => !m.read && m.type === 'assistant') && (
                    <span className="notification-dot"></span>
                )}
            </button>

            {isOpen && (
                <div className="ai-assistant animate-slideInRight">
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
                        <button onClick={() => setIsOpen(false)} className="close-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M6 18L18 6M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    <div className="security-banner">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" />
                        </svg>
                        <span>Security Restrictions Active</span>
                    </div>

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
                                    <p>{message.text}</p>
                                    {message.restricted && (
                                        <span className="badge badge-warning">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeWidth="2" />
                                            </svg>
                                            Restricted Access
                                        </span>
                                    )}
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

                    <div className="ai-input-container">
                        <textarea
                            className="ai-input"
                            placeholder="Ask me anything about the incidents..."
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
          z-index: var(--z-modal);
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
          z-index: var(--z-modal);
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
          background: rgba(245, 158, 11, 0.1);
          border-bottom: 1px solid var(--color-warning);
          color: var(--color-warning);
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
