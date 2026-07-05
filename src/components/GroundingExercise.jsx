import React, { useState, useEffect, useRef } from 'react';

export default function GroundingExercise() {
  const [activeTab, setActiveTab] = useState('breathing'); // 'breathing' or 'sensory'

  // Breathing state
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Ready'); // 'Inhale', 'Hold', 'Exhale'
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [cycles, setCycles] = useState(0);
  const timerRef = useRef(null);

  // Sensory state
  const [senses, setSenses] = useState({
    see: ['', '', '', '', ''],
    feel: ['', '', '', ''],
    hear: ['', '', ''],
    smell: ['', ''],
    taste: ['']
  });
  const [sensoryCompleted, setSensoryCompleted] = useState(false);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Breathing loop logic
  useEffect(() => {
    if (!breathingActive) {
      setBreathingPhase('Ready');
      setSecondsRemaining(0);
      return;
    }

    const startPhase = (phase) => {
      setBreathingPhase(phase);
      let duration = 4;
      if (phase === 'Hold') duration = 7;
      if (phase === 'Exhale') duration = 8;
      setSecondsRemaining(duration);
    };

    // Initialize first cycle
    startPhase('Inhale');

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Phase transition
          setBreathingPhase((currentPhase) => {
            if (currentPhase === 'Inhale') {
              startPhase('Hold');
              return 'Hold';
            } else if (currentPhase === 'Hold') {
              startPhase('Exhale');
              return 'Exhale';
            } else {
              setCycles((c) => c + 1);
              startPhase('Inhale');
              return 'Inhale';
            }
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [breathingActive]);

  const handleToggleBreathing = () => {
    if (breathingActive) {
      setBreathingActive(false);
      setCycles(0);
    } else {
      setCycles(0);
      setBreathingActive(true);
    }
  };

  // Sensory handlers
  const handleSensoryChange = (category, index, value) => {
    setSenses((prev) => {
      const updatedList = [...prev[category]];
      updatedList[index] = value;
      return {
        ...prev,
        [category]: updatedList
      };
    });
  };

  const handleSensorySubmit = (e) => {
    e.preventDefault();
    // Validate that all fields have some content
    const totalFilled = 
      senses.see.filter(Boolean).length +
      senses.feel.filter(Boolean).length +
      senses.hear.filter(Boolean).length +
      senses.smell.filter(Boolean).length +
      senses.taste.filter(Boolean).length;
    
    if (totalFilled < 15) {
      alert("Please try to fill out all fields. Grounding is most effective when you identify all 15 sensory points!");
      return;
    }

    setSensoryCompleted(true);
  };

  const handleResetSensory = () => {
    setSenses({
      see: ['', '', '', '', ''],
      feel: ['', '', '', ''],
      hear: ['', '', ''],
      smell: ['', ''],
      taste: ['']
    });
    setSensoryCompleted(false);
  };

  return (
    <div className="grounding-container">
      <div className="card-header">
        <h2>Grounding Exercise</h2>
        <p className="subtitle">Anchor yourself in the present moment when feeling overwhelmed.</p>
      </div>

      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'breathing' ? 'active' : ''}`}
          onClick={() => { setActiveTab('breathing'); }}
        >
          4-7-8 Breathing
        </button>
        <button
          className={`tab-btn ${activeTab === 'sensory' ? 'active' : ''}`}
          onClick={() => { setActiveTab('sensory'); }}
        >
          5-4-3-2-1 Sensory
        </button>
      </div>

      <div className="card-body">
        {activeTab === 'breathing' ? (
          <div className="breathing-section">
            <p className="breathing-instructions">
              The 4-7-8 breathing technique is a natural tranquilizer for the nervous system. 
              Inhale quietly through your nose for 4s, hold your breath for 7s, and exhale completely through your mouth for 8s.
            </p>

            <div className="breathing-circle-wrapper">
              <div className={`breathing-circle ${breathingPhase.toLowerCase()} ${breathingActive ? 'active' : ''}`}>
                <div className="breathing-text-inner">
                  <span className="phase-label">{breathingPhase}</span>
                  {breathingActive && <span className="timer-seconds">{secondsRemaining}s</span>}
                </div>
              </div>
            </div>

            <div className="breathing-controls">
              <button onClick={handleToggleBreathing} className={`btn ${breathingActive ? 'btn-danger' : 'btn-primary'}`}>
                {breathingActive ? 'Stop Exercise' : 'Start Breathing'}
              </button>
              {breathingActive && (
                <div className="breathing-counter">
                  Completed Cycles: <strong>{cycles}</strong>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="sensory-section">
            <p className="sensory-instructions">
              Slow down and note the details of your environment. This exercise redirects your focus away from anxious thoughts and back to physical reality.
            </p>

            {!sensoryCompleted ? (
              <form onSubmit={handleSensorySubmit} className="sensory-form">
                <div className="sensory-group">
                  <h4>👀 5 things you can SEE</h4>
                  <div className="sensory-inputs-row">
                    {senses.see.map((val, idx) => (
                      <input
                        key={`see-${idx}`}
                        type="text"
                        value={val}
                        onChange={(e) => handleSensoryChange('see', idx, e.target.value)}
                        placeholder={`Object ${idx + 1}`}
                        required
                      />
                    ))}
                  </div>
                </div>

                <div className="sensory-group">
                  <h4>🖐️ 4 things you can FEEL/TOUCH</h4>
                  <div className="sensory-inputs-row">
                    {senses.feel.map((val, idx) => (
                      <input
                        key={`feel-${idx}`}
                        type="text"
                        value={val}
                        onChange={(e) => handleSensoryChange('feel', idx, e.target.value)}
                        placeholder={`Texture/Sensation ${idx + 1}`}
                        required
                      />
                    ))}
                  </div>
                </div>

                <div className="sensory-group">
                  <h4>👂 3 things you can HEAR</h4>
                  <div className="sensory-inputs-row">
                    {senses.hear.map((val, idx) => (
                      <input
                        key={`hear-${idx}`}
                        type="text"
                        value={val}
                        onChange={(e) => handleSensoryChange('hear', idx, e.target.value)}
                        placeholder={`Sound ${idx + 1}`}
                        required
                      />
                    ))}
                  </div>
                </div>

                <div className="sensory-group">
                  <h4>👃 2 things you can SMELL</h4>
                  <div className="sensory-inputs-row">
                    {senses.smell.map((val, idx) => (
                      <input
                        key={`smell-${idx}`}
                        type="text"
                        value={val}
                        onChange={(e) => handleSensoryChange('smell', idx, e.target.value)}
                        placeholder={`Scent ${idx + 1}`}
                        required
                      />
                    ))}
                  </div>
                </div>

                <div className="sensory-group">
                  <h4>👅 1 thing you can TASTE</h4>
                  <div className="sensory-inputs-row">
                    {senses.taste.map((val, idx) => (
                      <input
                        key={`taste-${idx}`}
                        type="text"
                        value={val}
                        onChange={(e) => handleSensoryChange('taste', idx, e.target.value)}
                        placeholder="Taste in your mouth"
                        required
                      />
                    ))}
                  </div>
                </div>

                <button type="submit" className="btn btn-primary sensory-submit-btn">Complete Grounding</button>
              </form>
            ) : (
              <div className="sensory-completed-card">
                <h3>✨ Sensory Grounding Complete</h3>
                <p>
                  Well done! Focusing on your senses is a wonderful way to bring yourself back to the present moment. 
                  Take a final deep breath, drop your shoulders, and carry this sense of awareness with you.
                </p>
                <button onClick={handleResetSensory} className="btn btn-secondary">Start Over</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
