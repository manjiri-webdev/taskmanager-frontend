import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import '../task.css';

export default function CreateTask({ onAddTask, onClose }) {
  const [form, setForm] = useState({
    name: '',
    assigned_to: '',
    priority: 'low',
    due_date: '',
    estimated: '',
    "sub_tasks": [
      { 'name': '' },
    ]
  });

  const [subtasks, setSubtasks] = useState([{ id: Date.now(), name: '' }]);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSubtask = () => {
    setSubtasks((prev) => [...prev, { id: Date.now(), name: '' }]);
  };

  const handleSubtaskChange = (id, value) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, name: value } : s))
    );
  };

  const removeSubtask = (id) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('Task name is required.');
      return;
    }

    const filledSubtasks = subtasks.filter((s) => s.name.trim() !== '');

    try {
      const response = await fetch("http://localhost:8000/tasks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          name: form.name,
          assigned_to: form.assigned_to,
          priority: form.priority,
          due_date: form.due_date,
          estimated: form.estimated,
          sub_tasks: filledSubtasks.map(s => ({ name: s.name }))
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert("Task created successfully");
        onAddTask(data.task);
        onClose();
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  return (
    <div className="ct-overlay">
      <div className="ct-modal">

        <div className="ct-header">
          <h2 className="ct-title">Create New Task</h2>
          <button className="ct-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="ct-field-list">

          <div className="ct-field">
            <label className="ct-label"> Task Name <span>*</span> </label>
            <input
              className={`ct-input ${error ? 'error' : ''}`}
              name="name"
              placeholder="Enter task name"
              value={form.name}
              onChange={(e) => { handleChange(e); setError(''); }}
            />
            {error && <span className="ct-error-msg">{error}</span>}
          </div>

          <div className="ct-field">
            <label className="ct-label">Assigned To</label>
            <input
              className="ct-input"
              name="assigned_to"
              placeholder="Enter name or team"
              value={form.assigned_to}
              onChange={handleChange}
            />
          </div>

          <div className="ct-field">
            <label className="ct-label">Priority</label>
            <div className="ct-radio-group">
              <label
                className={`ct-radio-option ${form.priority === 'low' ? 'active-low' : ''
                  }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="low"
                  checked={form.priority === 'low'}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                🔵 Low
              </label>

              <label
                className={`ct-radio-option ${form.priority === 'high' ? 'active-high' : ''
                  }`}
              >
                <input
                  type="radio"
                  name="priority"
                  value="high"
                  checked={form.priority === 'high'}
                  onChange={handleChange}
                  style={{ display: 'none' }}
                />
                🔴 High
              </label>
            </div>
          </div>

          <div className="ct-row">
            <div className="ct-field">
              <label className="ct-label">Due Date</label>
              <input
                className="ct-input"
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
              />
            </div>

            <div className="ct-field">
              <label className="ct-label">Estimated Time</label>
              <input
                className="ct-input"
                name="estimated"
                placeholder="e.g. 6 "
                value={form.estimated}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="ct-field">
            <div className="ct-subtask-header">
              <label className="ct-label">Subtasks</label>
              <button className="ct-add-subtask-btn" onClick={addSubtask}>
                <Plus size={13} /> Add Subtask
              </button>
            </div>

            <div className="ct-subtask-list">
              {subtasks.map((subtask, index) => (
                <div className="ct-subtask-row" key={subtask.id}>
                  <span className="ct-subtask-index">{index + 1}.</span>
                  <input
                    className="ct-input ct-subtask-input"
                    placeholder={`Subtask ${index + 1} name`}
                    value={subtask.name}
                    onChange={(e) =>
                      handleSubtaskChange(subtask.id, e.target.value)
                    }
                  />

                  {subtasks.length > 1 && (
                    <button
                      className="ct-remove-subtask-btn"
                      onClick={() => removeSubtask(subtask.id)}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        <div className="ct-footer">
          <button className="ct-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="ct-add-btn" onClick={handleSubmit}>
            Add Task
          </button>
        </div>

      </div>
    </div>
  );
}