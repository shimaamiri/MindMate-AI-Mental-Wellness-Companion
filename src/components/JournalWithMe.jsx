import React, { useState, useEffect } from 'react';

const PROMPTS = [
  "What is one small thing that brought you joy today?",
  "Write about a challenge you overcame recently, no matter how small it seems.",
  "List three things you are grateful for right now and explain why.",
  "What does self-compassion mean to you? How can you show it to yourself today?",
  "Describe a place where you feel completely safe and peaceful. What does it look, sound, and feel like?",
  "Write down a kind, forgiving message to your current self.",
  "If your current stress or worry was an object, what would it look like? What would you like to say to it?",
  "What is something you need to let go of today to feel lighter?"
];

export default function JournalWithMe() {
  const [currentPrompt, setCurrentPrompt] = useState(PROMPTS[0]);
  const [entryText, setEntryText] = useState('');
  const [savedEntries, setSavedEntries] = useState([]);
  const [reflection, setReflection] = useState('');
  const [activeTab, setActiveTab] = useState('write'); // 'write' or 'history'

  useEffect(() => {
    const saved = localStorage.getItem('mindmate_journal_entries');
    if (saved) {
      try {
        setSavedEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading journal entries", e);
      }
    }
  }, []);

  const getRandomPrompt = () => {
    let newPrompt = currentPrompt;
    while (newPrompt === currentPrompt) {
      newPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
    }
    setCurrentPrompt(newPrompt);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!entryText.trim()) {
      alert("Please write something before saving.");
      return;
    }

    // Generate AI Reflection
    const text = entryText.toLowerCase();
    let dynamicReflection = "";

    const positiveMatches = ['happy', 'glad', 'joy', 'grateful', 'proud', 'smile', 'love', 'good', 'peace'];
    const negativeMatches = ['sad', 'hurt', 'fail', 'stress', 'anxious', 'scared', 'worry', 'cry', 'tired', 'hate', 'alone'];

    const hasPositive = positiveMatches.some(w => text.includes(w));
    const hasNegative = negativeMatches.some(w => text.includes(w));

    if (hasPositive && hasNegative) {
      dynamicReflection = "I appreciate you sharing both the light and heavy parts of your day. Embracing the complexity of having both positive moments and struggles is a beautiful sign of emotional growth. Keep holding space for all parts of yourself.";
    } else if (hasPositive) {
      dynamicReflection = "Thank you for sharing this beautiful energy! It is so wonderful that you took time to focus on these positive experiences. Relishing these moments strengthens our mental resilience and invites more joy into our lives. I'm celebrating this with you!";
    } else if (hasNegative) {
      dynamicReflection = "I hear the pain and weight in your writing. Thank you for trusting this space with these difficult thoughts. Letting it out on paper is a powerful release. Please remember to be incredibly gentle with yourself today—you are doing the best you can, and that is more than enough.";
    } else {
      dynamicReflection = "Thank you for taking the time to check in with yourself and put your thoughts into words. Journaling is a wonderful way to untangle our minds. I hope this reflection brings you a sense of calm and clarity as you move through your day.";
    }

    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      prompt: currentPrompt,
      text: entryText.trim(),
      reflection: dynamicReflection
    };

    const updated = [newEntry, ...savedEntries];
    setSavedEntries(updated);
    localStorage.setItem('mindmate_journal_entries', JSON.stringify(updated));

    setReflection(dynamicReflection);
    setEntryText('');
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      const updated = savedEntries.filter(e => e.id !== id);
      setSavedEntries(updated);
      localStorage.setItem('mindmate_journal_entries', JSON.stringify(updated));
    }
  };

  return (
    <div className="journal-container">
      <div className="card-header">
        <h2>Journal With Me</h2>
        <p className="subtitle">Express yourself freely. Your words are private and safe here.</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`}
          onClick={() => { setActiveTab('write'); setReflection(''); }}
        >
          New Entry
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Past Entries ({savedEntries.length})
        </button>
      </div>

      <div className="card-body">
        {activeTab === 'write' ? (
          <div className="write-section">
            <div className="prompt-box">
              <div className="prompt-header">
                <strong>Writing Prompt:</strong>
                <button onClick={getRandomPrompt} className="btn-text">New Prompt</button>
              </div>
              <p className="prompt-text">"{currentPrompt}"</p>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <textarea
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  placeholder="Start writing here... (Take your time, there is no rush)"
                  rows="10"
                  className="journal-textarea"
                />
              </div>
              <button type="submit" className="btn btn-primary">Save Entry & Reflect</button>
            </form>

            {reflection && (
              <div className="reflection-card">
                <h4>✨ Companion Reflection</h4>
                <p>{reflection}</p>
                <div className="reflection-footer">
                  <small>MindMate reflected on your entry with warmth and compassion.</small>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="history-section">
            {savedEntries.length === 0 ? (
              <p className="empty-state">No saved entries yet. Start writing your first journal entry above!</p>
            ) : (
              <div className="journal-entries-list">
                {savedEntries.map((entry) => (
                  <div key={entry.id} className="journal-card">
                    <div className="journal-card-header">
                      <span className="journal-date">{entry.date}</span>
                      <button onClick={() => handleDelete(entry.id)} className="btn-icon-delete" title="Delete entry">🗑️</button>
                    </div>
                    <div className="journal-card-content">
                      <p className="journal-prompt-ref"><strong>Prompt:</strong> "{entry.prompt}"</p>
                      <p className="journal-text-body">{entry.text}</p>
                    </div>
                    {entry.reflection && (
                      <div className="journal-reflection-subbox">
                        <h5>✨ Reflection:</h5>
                        <p>{entry.reflection}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
