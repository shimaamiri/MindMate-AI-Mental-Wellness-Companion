import React, { useState, useEffect } from 'react';

const DEFAULT_CATEGORIES = {
  Body: [
    { id: 'b1', text: 'Drink 8 glasses of water', completed: false },
    { id: 'b2', text: 'Stretch for 5 minutes', completed: false },
    { id: 'b3', text: 'Go for a short outdoor walk', completed: false },
    { id: 'b4', text: 'Eat a nourishing meal', completed: false }
  ],
  Mind: [
    { id: 'm1', text: 'Unplug from social media for 1 hour', completed: false },
    { id: 'm2', text: 'Sit in silence or meditate for 5 minutes', completed: false },
    { id: 'm3', text: 'Write down 3 positive thoughts', completed: false },
    { id: 'm4', text: 'Learn something new or read a book chapter', completed: false }
  ],
  Social: [
    { id: 's1', text: 'Text a friend to say hello', completed: false },
    { id: 's2', text: 'Share a laugh with someone', completed: false },
    { id: 's3', text: 'Express gratitude to someone', completed: false },
    { id: 's4', text: 'Set a healthy personal boundary today', completed: false }
  ],
  Soul: [
    { id: 'so1', text: 'Listen to a favorite comforting song', completed: false },
    { id: 'so2', text: 'Spend 10 minutes doing a creative hobby', completed: false },
    { id: 'so3', text: 'Practice self-compassion for a mistake', completed: false },
    { id: 'so4', text: 'Observe a beautiful aspect of nature', completed: false }
  ]
};

export default function SelfCarePlan() {
  const [plan, setPlan] = useState(DEFAULT_CATEGORIES);
  const [customText, setCustomText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Body');

  useEffect(() => {
    const saved = localStorage.getItem('mindmate_selfcare_plan');
    if (saved) {
      try {
        setPlan(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading self care plan", e);
      }
    }
  }, []);

  const savePlan = (updatedPlan) => {
    setPlan(updatedPlan);
    localStorage.setItem('mindmate_selfcare_plan', JSON.stringify(updatedPlan));
  };

  const handleToggle = (category, id) => {
    const updatedCategoryList = plan[category].map(task => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    const updatedPlan = {
      ...plan,
      [category]: updatedCategoryList
    };

    savePlan(updatedPlan);
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;

    const newTask = {
      id: 'custom_' + Date.now(),
      text: customText.trim(),
      completed: false
    };

    const updatedPlan = {
      ...plan,
      [selectedCategory]: [...plan[selectedCategory], newTask]
    };

    savePlan(updatedPlan);
    setCustomText('');
  };

  const handleDeleteTask = (category, id) => {
    const updatedCategoryList = plan[category].filter(task => task.id !== id);
    const updatedPlan = {
      ...plan,
      [category]: updatedCategoryList
    };
    savePlan(updatedPlan);
  };

  const handleReset = () => {
    if (window.confirm("Would you like to reset all tasks to incomplete and clear custom items?")) {
      savePlan(DEFAULT_CATEGORIES);
    }
  };

  // Calculate totals and percentages
  let totalTasks = 0;
  let completedTasks = 0;

  Object.keys(plan).forEach(cat => {
    totalTasks += plan[cat].length;
    completedTasks += plan[cat].filter(t => t.completed).length;
  });

  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="selfcare-container">
      <div className="card-header">
        <h2>Self-Care Plan</h2>
        <p className="subtitle">Nurture your well-being. Tick off tasks to track your daily progress.</p>
      </div>

      <div className="card-body">
        {/* Progress bar */}
        <div className="progress-section">
          <div className="progress-info">
            <span>Overall Daily Progress</span>
            <span className="percentage-text">{percentage}% ({completedTasks}/{totalTasks} completed)</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${percentage}%` }} />
          </div>
        </div>

        {/* Custom Task Form */}
        <form onSubmit={handleAddTask} className="add-task-form">
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="Add a custom self-care goal..."
            className="input-task-text"
            maxLength="60"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="select-task-category"
          >
            {Object.keys(plan).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-secondary">Add</button>
        </form>

        {/* Categories checklist */}
        <div className="selfcare-grid">
          {Object.keys(plan).map(category => (
            <div key={category} className="selfcare-card">
              <h3 className="category-title">{category}</h3>
              <ul className="task-list">
                {plan[category].length === 0 ? (
                  <li className="empty-task-state">No goals. Add one above!</li>
                ) : (
                  plan[category].map(task => (
                    <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                      <label className="checkbox-container">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => handleToggle(category, task.id)}
                        />
                        <span className="checkmark" />
                        <span className="task-text">{task.text}</span>
                      </label>
                      <button
                        onClick={() => handleDeleteTask(category, task.id)}
                        className="btn-delete-task"
                        title="Delete task"
                      >
                        ×
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>

        <div className="selfcare-footer-actions">
          <button onClick={handleReset} className="btn-text danger">Reset Checklist</button>
        </div>
      </div>
    </div>
  );
}
