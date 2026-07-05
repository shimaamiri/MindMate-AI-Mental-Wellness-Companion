import React, { useState, useEffect } from 'react';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: '#ffebc2', suggestion: 'Awesome! Share your positivity with a friend, or write down what made you happy in your journal.' },
  { emoji: '😌', label: 'Calm', color: '#e2f4c5', suggestion: 'A perfect time for some quiet reading, gentle stretches, or planning your week ahead.' },
  { emoji: '🥱', label: 'Tired', color: '#e8f0fe', suggestion: 'Give yourself permission to rest. Try going to bed 30 minutes early or taking a short screen-free break.' },
  { emoji: '😰', label: 'Anxious', color: '#ffebee', suggestion: 'Take a deep breath. Try the 4-7-8 breathing exercise under the Grounding section to slow down your heart rate.' },
  { emoji: '😢', label: 'Sad', color: '#f3e5f5', suggestion: 'It is okay to not be okay. Wrap yourself in a warm blanket, listen to your favorite song, or talk to someone you trust.' }
];

export default function MoodCheckIn() {
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState([]);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('mindmate_mood_logs');
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading mood logs", e);
      }
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    if (!selectedMood) {
      setFeedbackMsg('Please select a mood emoji first.');
      return;
    }

    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      mood: selectedMood.label,
      emoji: selectedMood.emoji,
      color: selectedMood.color,
      note: note.trim()
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('mindmate_mood_logs', JSON.stringify(updatedLogs));

    setFeedbackMsg(`Mood logged! Suggestion: ${selectedMood.suggestion}`);
    setNote('');
    // Keep mood selected so they can read the suggestion, but clear after a timeout if needed, or keep it.
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your mood history?")) {
      setLogs([]);
      localStorage.removeItem('mindmate_mood_logs');
      setFeedbackMsg('Mood history cleared.');
    }
  };

  return (
    <div className="mood-container">
      <div className="card-header">
        <h2>Mood Check-In</h2>
        <p className="subtitle">How are you feeling in this moment?</p>
      </div>

      <div className="card-body">
        <form onSubmit={handleSave}>
          <div className="mood-selector">
            {MOODS.map((m) => (
              <button
                key={m.label}
                type="button"
                className={`mood-emoji-btn ${selectedMood?.label === m.label ? 'active' : ''}`}
                style={{ '--mood-color': m.color }}
                onClick={() => {
                  setSelectedMood(m);
                  setFeedbackMsg('');
                }}
              >
                <span className="emoji">{m.emoji}</span>
                <span className="label">{m.label}</span>
              </button>
            ))}
          </div>

          {selectedMood && (
            <div className="mood-suggestion-card" style={{ backgroundColor: selectedMood.color }}>
              <strong>Companion Suggestion:</strong> {selectedMood.suggestion}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="mood-note">Optional notes (what is contributing to this feeling?):</label>
            <textarea
              id="mood-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Writing it down can help release it..."
              rows="3"
            />
          </div>

          <button type="submit" className="btn btn-primary">Log My Mood</button>
        </form>

        {feedbackMsg && (
          <div className={`feedback-alert ${feedbackMsg.includes('logged') ? 'success' : 'info'}`}>
            {feedbackMsg}
          </div>
        )}

        <hr className="divider" />

        <div className="mood-history">
          <div className="history-header">
            <h3>Mood History</h3>
            {logs.length > 0 && (
              <button onClick={handleClearHistory} className="btn-text danger">Clear All</button>
            )}
          </div>

          {logs.length === 0 ? (
            <p className="empty-state">No mood history yet. Log your first mood above!</p>
          ) : (
            <div className="logs-list">
              {logs.map((log) => (
                <div key={log.id} className="log-item" style={{ borderLeftColor: log.color }}>
                  <div className="log-meta">
                    <span className="log-emoji-badge" style={{ backgroundColor: log.color }}>{log.emoji}</span>
                    <span className="log-mood-name">{log.mood}</span>
                    <span className="log-date">{log.date}</span>
                  </div>
                  {log.note && <p className="log-note">"{log.note}"</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
