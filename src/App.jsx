import React, { useState, useEffect, useRef } from 'react';
import MoodCheckIn from './components/MoodCheckIn';
import JournalWithMe from './components/JournalWithMe';
import SelfCarePlan from './components/SelfCarePlan';
import GroundingExercise from './components/GroundingExercise';
import { generateAIResponse } from './services/chatService';

// Helper to format inline Markdown (bold, links, raw URLs)
function formatInlineText(text) {
  if (!text) return "";
  
  // Regex to capture bold markdown (**text**), markdown links ([text](url)), and raw http/https links
  const regex = /(\*\*.*?\*\*|\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s\)]+)/g;
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    // Bold parsing
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    
    // Markdown link parsing
    if (part.startsWith('[') && part.includes('](')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const linkText = match[1];
        const linkUrl = match[2];
        return (
          <a 
            key={index} 
            href={linkUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: '600' }}
          >
            {linkText}
          </a>
        );
      }
    }
    
    // Raw URL parsing
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a 
          key={index} 
          href={part} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: 'var(--primary)', textDecoration: 'underline', fontWeight: '600' }}
        >
          {part}
        </a>
      );
    }
    
    return part;
  });
}

// Helper to split message into paragraphs and lists
function parseMarkdownToReact(text) {
  if (!text) return null;

  // Split into paragraph blocks
  const blocks = text.split(/\n\n+/);

  return blocks.map((block, blockIdx) => {
    const lines = block.split('\n');
    
    // Check if the lines in this block form a list (starting with * or -)
    const isList = lines.length > 0 && lines.every(line => {
      const trimmed = line.trim();
      return trimmed === '' || trimmed.startsWith('*') || trimmed.startsWith('-');
    });

    if (isList) {
      return (
        <ul key={blockIdx}>
          {lines
            .filter(line => line.trim() !== '')
            .map((line, lineIdx) => {
              const cleanLine = line.trim().replace(/^[\*\-]\s+/, '');
              return (
                <li key={lineIdx}>
                  {formatInlineText(cleanLine)}
                </li>
              );
            })}
        </ul>
      );
    }

    return (
      <p key={blockIdx}>
        {formatInlineText(block)}
      </p>
    );
  });
}

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [greeting, setGreeting] = useState('Welcome');
  
  // Keep chat history in parent state to persist across screen switches
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm MindMate, your AI wellness companion. I'm here to offer a calm, supportive space to talk, journal, plan self-care, or practice grounding. How are you feeling today?",
      sender: 'ai'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef(null);

  // Dynamic time-of-day greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Scroll to bottom of chat whenever messages list updates or typing state changes
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, currentView, isTyping]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user'
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsTyping(true);

    try {
      // Call async AI generator passing the new message and existing chat log
      const aiResponse = await generateAIResponse(text, chatMessages);
      const aiMsg = {
        id: Date.now() + 1,
        text: aiResponse.text,
        sender: 'ai',
        suggestion: aiResponse.suggestion
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Error communicating with AI engine:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestionText) => {
    handleSendMessage(suggestionText);
  };

  // Navigating to specific view from suggestion link (e.g. from chat)
  const handleFollowSuggestion = (view) => {
    setCurrentView(view);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="app-sidebar">
        <div>
          <a href="#" className="logo-section" onClick={() => setCurrentView('dashboard')}>
            <span className="logo-icon">🌱</span>
            <div>
              <h1>MindMate</h1>
              <span className="tagline">Your Wellness Companion</span>
            </div>
          </a>
          
          <nav className="nav-links">
            <button 
              className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => setCurrentView('dashboard')}
            >
              <span className="nav-icon">🏡</span> Home
            </button>
            <button 
              className={`nav-item ${currentView === 'chat' ? 'active' : ''}`}
              onClick={() => setCurrentView('chat')}
            >
              <span className="nav-icon">💬</span> Chat Companion
            </button>
            <button 
              className={`nav-item ${currentView === 'mood' ? 'active' : ''}`}
              onClick={() => setCurrentView('mood')}
            >
              <span className="nav-icon">😊</span> Mood Check-In
            </button>
            <button 
              className={`nav-item ${currentView === 'journal' ? 'active' : ''}`}
              onClick={() => setCurrentView('journal')}
            >
              <span className="nav-icon">✍️</span> Journal With Me
            </button>
            <button 
              className={`nav-item ${currentView === 'selfcare' ? 'active' : ''}`}
              onClick={() => setCurrentView('selfcare')}
            >
              <span className="nav-icon">✅</span> Self-Care Plan
            </button>
            <button 
              className={`nav-item ${currentView === 'grounding' ? 'active' : ''}`}
              onClick={() => setCurrentView('grounding')}
            >
              <span className="nav-icon">🧘</span> Grounding Exercise
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="app-content">
        <div className="main-stage">
          
          {/* View Routing */}
          {currentView === 'dashboard' && (
            <div className="dashboard-view">
              <div className="welcome-header">
                <h2>{greeting}, friend.</h2>
                <p>How would you like to nurture your mind today?</p>
              </div>

              {/* Action Cards Grid */}
              <div className="dashboard-grid">
                <div className="action-card mood" onClick={() => setCurrentView('mood')}>
                  <div className="card-icon-large">😊</div>
                  <h3>Mood Check-In</h3>
                  <p>Log your current mood, record a personal note, and get immediate, positive wellness tips tailored for you.</p>
                  <span className="card-action-link">Check In →</span>
                </div>

                <div className="action-card journal" onClick={() => setCurrentView('journal')}>
                  <div className="card-icon-large">✍️</div>
                  <h3>Journal With Me</h3>
                  <p>Release your thoughts into a private notepad with optional calming prompts and receive gentle companion reflections.</p>
                  <span className="card-action-link">Start Writing →</span>
                </div>

                <div className="action-card selfcare" onClick={() => setCurrentView('selfcare')}>
                  <div className="card-icon-large">✅</div>
                  <h3>Self-Care Plan</h3>
                  <p>Create and tick off daily self-care goals grouped across Body, Mind, Social, and Soul, tracking your progress percentage.</p>
                  <span className="card-action-link">View My Plan →</span>
                </div>

                <div className="action-card grounding" onClick={() => setCurrentView('grounding')}>
                  <div className="card-icon-large">🧘</div>
                  <h3>Grounding Exercise</h3>
                  <p>Feeling overwhelmed? Restore calm with our interactive 4-7-8 breathing timer or a 5-4-3-2-1 sensory grounding builder.</p>
                  <span className="card-action-link">Find Calm →</span>
                </div>
              </div>

              {/* Quick Chat Banner */}
              <div className="quick-chat-banner">
                <div className="chat-banner-text">
                  <h4>Want a listening ear?</h4>
                  <p>MindMate is here to listen and validate your feelings in a safe, warm, and zero-judgment space.</p>
                </div>
                <button className="btn btn-primary" onClick={() => setCurrentView('chat')}>
                  💬 Chat Now
                </button>
              </div>
            </div>
          )}

          {currentView === 'chat' && (
            <div className="chat-view">
              <div className="chat-container">
                <div className="chat-header">
                  <div className="companion-avatar">🌱</div>
                  <div className="chat-title-info">
                    <h3>MindMate Companion</h3>
                    <div className="chat-status">Online & Listening</div>
                  </div>
                </div>

                <div className="chat-messages">
                  {chatMessages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`message-bubble ${msg.sender === 'ai' ? 'ai' : 'user'}`}
                    >
                      {parseMarkdownToReact(msg.text)}

                      {/* Display a navigation helper link if the companion suggests a tool */}
                      {msg.sender === 'ai' && msg.suggestion && (
                        <div style={{ marginTop: '0.75rem' }}>
                          <button 
                            className="btn btn-secondary" 
                            onClick={() => handleFollowSuggestion(msg.suggestion)}
                            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                          >
                            Open {msg.suggestion === 'grounding' ? 'Grounding Tool' :
                                  msg.suggestion === 'journal' ? 'Journal Workspace' :
                                  msg.suggestion === 'selfcare' ? 'Self-Care Checklist' :
                                  msg.suggestion === 'mood' ? 'Mood Log' : 'Wellness Feature'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  {isTyping && (
                    <div className="message-bubble ai typing" style={{ alignSelf: 'flex-start' }}>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  )}
                  <div ref={chatBottomRef} />
                </div>

                {/* Pre-written quick chat suggestions */}
                <div className="chat-suggestions-wrapper">
                  <button 
                    className="suggestion-pill"
                    onClick={() => handleSuggestionClick("I'm feeling very anxious right now")}
                  >
                    😰 I feel anxious
                  </button>
                  <button 
                    className="suggestion-pill"
                    onClick={() => handleSuggestionClick("I've had a really stressful day")}
                  >
                    🥱 Had a rough day
                  </button>
                  <button 
                    className="suggestion-pill"
                    onClick={() => handleSuggestionClick("Give me a quick self-care tip")}
                  >
                    💡 Self-care tip
                  </button>
                  <button 
                    className="suggestion-pill"
                    onClick={() => handleSuggestionClick("Who created you and what can you do?")}
                  >
                    ℹ️ What can you do?
                  </button>
                </div>

                {/* Message input */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
                  className="chat-input-form"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message... (e.g. 'I feel down' or 'Tell me a story')"
                    className="chat-input-field"
                    maxLength="500"
                  />
                  <button type="submit" className="chat-send-btn" title="Send message">
                    ➤
                  </button>
                </form>
              </div>
            </div>
          )}

          {currentView === 'mood' && <MoodCheckIn />}
          {currentView === 'journal' && <JournalWithMe />}
          {currentView === 'selfcare' && <SelfCarePlan />}
          {currentView === 'grounding' && <GroundingExercise />}

        </div>

        {/* Safety Disclaimer Bottom Footer */}
        <footer className="app-footer">
          <p className="disclaimer-text">
            MindMate is not a substitute for professional mental health care. If you are in immediate danger, contact emergency services or a trusted person right away.
          </p>
        </footer>
      </main>
    </div>
  );
}
