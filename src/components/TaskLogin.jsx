import React, { useState, useEffect } from "react";
import { X, Play, Square, PenLine, Save, Clock, Calendar } from 'lucide-react';

function TaskLogin({ subTaskId, onClose }) {
  const [manualMode, setManualMode] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [timer, setTimer] = useState({ running: false, start: null });
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState([]);
  const [subtask, setSubtask] = useState(null);
  const [todayTotal, setTodayTotal] = useState(0);


  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/subtasks/${subTaskId}/logs`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        const data = await response.json();
        if (response.ok) {
          setSubtask(data.subtask);
          setLogs(data.logs);
          setTodayTotal(data.today_total_time);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert("Server Error");
      }
    };
    fetchLogs();
  }, [subTaskId]);


  const handleStartStop = async () => {
    if (!timer.running) {
    
      setTimer({ running: true, start: new Date() });
    } else {
      const end = new Date();
      const start = timer.start;
      try {
        const response = await fetch(`http://localhost:8000/api/subtasks/${subTaskId}/logs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({
            start_time: start,
            end_time: end
          })
        });
        const data = await response.json();
        if (response.ok) {
          alert("Log saved successfully");
          setLogs(prev => [data.log, ...prev]);
          setTodayTotal(prev => prev + data.log.duration);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert("Server Error");
      }
      setTimer({ running: false, start: null });
    }
  };

  const handleSaveManual = async () => {
    setSaving(true);
    try {
      const start = new Date(`2026-05-27T${startTime}`);
      const end = new Date(`2026-05-27T${endTime}`);
      const response = await fetch(`http://localhost:8000/api/subtasks/${subTaskId}/logs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          start_time: start,
          end_time: end
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert("Manual log saved");
        setLogs(prev => [data.log, ...prev]);
        setTodayTotal(prev => prev + data.log.duration);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
    setSaving(false);
    setManualMode(false);
  };

  
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    let interval;
    if (timer.running && timer.start) {
      interval = setInterval(() => {
        const now = new Date();
        setElapsed(Math.floor((now - new Date(timer.start)) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  return (
    <div className="task-panel">
      <div className="panel-header">
        <div className="panel-title-row">
          <Clock size={16} className="panel-icon" />
          <span className="panel-title">Task Login</span>
          <span className="panel-date">
            <Calendar size={13} /> {new Date().toLocaleDateString()}
          </span>
        </div>
        <button className="close-btn" onClick={onClose}><X size={16} /></button>
      </div>

      <div className="panel-selectors">
        <div className="selector-group">
          <label>Task</label>
          <div className="selector-display">{subtask?.task_name || "—"}</div>
        </div>
        <div className="selector-group">
          <label>Sub task</label>
          <div className="selector-display">{subtask?.sub_task_name || "—"}</div>
        </div>
      </div>

      {manualMode ? (
        <div className="manual-inputs">
          <div className="time-input-group">
            <label>Start Time</label>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div className="time-input-group">
            <label>End Time</label>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
        </div>
      ) : (
        <div className="timer-display">
          <span className="timer-digit">{String(h).padStart(2, '0')}</span>h
          <span className="timer-digit">{String(m).padStart(2, '0')}</span>m
          <span className="timer-digit">{String(s).padStart(2, '0')}</span>s
        </div>
      )}

      <p className="timer-sub">Total time today: {todayTotal} sec</p>

      <div className="panel-actions">
        <button className={`btn-start ${timer.running ? 'btn-stop' : ''}`} onClick={handleStartStop}>
          {timer.running ? <><Square size={14} /> Stop</> : <><Play size={14} /> Start Working</>}
        </button>
        {manualMode ? (
          <button className="btn-save" onClick={handleSaveManual} disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Timings'}
          </button>
        ) : (
          <button className="btn-manual" onClick={() => setManualMode(true)}>
            <PenLine size={14} /> Enter Manually
          </button>
        )}
      </div>

      <div className="recent-section">
        <p className="recent-label">Recent Logs</p>
        <div className="recent-list">
          {logs.map((log) => (
            <div key={log.id} className="recent-item">
              <span className="recent-name">{subtask?.sub_task_name}</span>
              <span className="recent-time">{Math.floor(log.duration / 60)}m {log.duration % 60}s</span>
              <button className="recent-edit"><PenLine size={13} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TaskLogin;
