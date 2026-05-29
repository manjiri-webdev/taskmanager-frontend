import React, { useEffect, useState } from "react";
import { X, Play, Square, PenLine, Save, Clock, Calendar } from 'lucide-react';

function TaskLogin({ subTaskId, onClose, onLogSaved }) {
  const [manualMode, setManualMode] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState([]);
  const [subtask, setSubtask] = useState({});
  const [todayTotal, setTodayTotal] = useState(0);
  const TIMER_KEY = "taskTimer";

  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;

  const [timer, setTimer] = useState(() => {
    const saved = localStorage.getItem(TIMER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.subTaskId === subTaskId && parsed.start) {
        return { running: true, start: new Date(parsed.start) };
      }
    }
    return { running: false, start: null };
  });

  useEffect(() => {
    if (timer.running && timer.start) {
      localStorage.setItem(
        TIMER_KEY,
        JSON.stringify({
          subTaskId,
          start: timer.start.toISOString(),
        })
      );
    } else {
      localStorage.removeItem(TIMER_KEY);
    }
  }, [timer, subTaskId]);

  const fetchLogs = async () => {
    try {
      const res = await fetch(`http://localhost:8000/logs/subtask/${subTaskId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
      });

      const data = await res.json();
      if (res.ok) {
        setLogs(data.logs);
        setSubtask(data.subtask);
        setTodayTotal(data.today_total_time);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  useEffect(() => {
    setLogs([]);
    setSubtask(null);
    setTodayTotal(0);
    setManualMode(false);
    setStartTime("");
    setEndTime("");
    fetchLogs();
  }, [subTaskId]);

  //start and stop timer
  const handleStartStop = async () => {
    if (!timer.running) {
      setElapsed(0);
      setTimer({ running: true, start: new Date() });
      setManualMode(false);
    } else {
      const start = timer.start;
      const end = new Date();

      try {
        const res = await fetch(`http://localhost:8000/logs/create/${subTaskId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ start_time: start, end_time: end }),
        });

        const data = await res.json();
        if (res.ok) {
          alert("Log saved successfully");
          setLogs(prev => [data.log, ...prev]);
          await fetchLogs();
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.error(error);
        alert("Server Error");
      }
      setTimer({ running: false, start: null });
      setElapsed(0);
    }
  }

  useEffect(() => {
    if (!timer.running || !timer.start) {
      setElapsed(0);
      return;
    }
    setElapsed(Math.floor((Date.now() - new Date(timer.start).getTime()) / 1000));

    const iv = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(timer.start).getTime()) / 1000));
    }, 1000);
    return () => clearInterval(iv);
  }, [timer.running, timer.start]);

  //save manual log
  const handleSaveManual = async () => {
    setSaving(true);

    if (!startTime || !endTime) {
      alert("Please fill in both start and end times.");
      return;
    }

    const today = new Date().toLocaleDateString("en-CA");
    const start = new Date(`${today}T${startTime}`);
    const end = new Date(`${today}T${endTime}`);

    if (end <= start) {
      alert("End time must be after start time.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/logs/create/${subTaskId}`, {
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

      const data = await res.json();
      if (res.ok) {
        alert("Manual log saved");
        setLogs(prev => [data.log, ...prev]);
        setStartTime("");
        setEndTime("");
        setManualMode(false);
        await fetchLogs();
      } else {
        alert(data.message || "Failed to save log");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
    setSaving(false);
  };


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
          <div className="selector-display">{subtask?.task_name || "-"}</div>
        </div>
        <div className="selector-group">
          <label>Sub task</label>
          <div className="selector-display">{subtask?.sub_task_name || "-"}</div>
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
        <button
          className={`btn-start ${timer.running ? 'btn-stop' : ''}`}
          onClick={handleStartStop}
        >
          {timer.running ? <><Square size={14} /> Stop</> : <><Play size={14} /> Start Working</>}

        </button>

        {manualMode ? (
          <button
            className="btn-save" onClick={handleSaveManual} disabled={saving}
          >
            <Save size={14} /> {saving ? 'Saving...' : 'Save Timings'}
          </button>
        ) : (
          <button className="btn-manual" onClick={() => setManualMode(!manualMode)}>
            <PenLine size={14} /> Enter Manually
          </button>
        )}
      </div>

      <div className="recent-section">
        <p className="recent-label">Recent Logs</p>
        <div className="recent-list">
          {logs.map((log) => (
            <div key={log.id} className="recent-item">

              <span className="recent-name">{subtask.sub_task_name}</span>

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
