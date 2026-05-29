import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Search } from "lucide-react";
import TaskLogin from "./TaskLogin";

function Subtask() {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [subtasks, setSubtasks] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [expandedRow, setExpandedRow] = useState(null);
    const PANEL_KEY = "taskLoginPanel";

    //refersh pa panel open raha
    const [showTaskLogin, setShowTaskLogin] = useState(() => {
        const saved = localStorage.getItem(PANEL_KEY);
        return saved ? true : false;
    });

    const [selectedSubTaskId, setSelectedSubTaskId] = useState(() => {
        const saved = localStorage.getItem(PANEL_KEY);
        return saved ? JSON.parse(saved).subTaskId : null;
    });

    useEffect(() => {
        if (showTaskLogin && selectedSubTaskId) {
            localStorage.setItem(PANEL_KEY, JSON.stringify({ subTaskId: selectedSubTaskId }));
        } else {
            localStorage.removeItem(PANEL_KEY);
        }
    }, [showTaskLogin, selectedSubTaskId]);

    const openPanel = (subTaskId) => {
        setSelectedSubTaskId(subTaskId);
        setShowTaskLogin(true);
    };

    const closePanel = () => {
        setShowTaskLogin(false);
        setSelectedSubTaskId(null);
    };

    // get subtask 
    const fetchSubtask = async (e) => {
        try {
            const url = statusFilter === "All"
                ? `http://localhost:8000/tasks/subtasks/${taskId}`
                : `http://localhost:8000/tasks/subtasks/${taskId}?status=${encodeURIComponent(statusFilter)}`;

            const res = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await res.json();
            if (res.ok) {
                setTask(data.task);
                setSubtasks(data.sub_tasks);
            } else if (res.status === 404) {
                setSubtasks([]);
            }
            else {
                alert(data.message);
            }
        }
        catch (error) {
            console.log(error);
            alert("server error");
        }
    };

    useEffect(() => {
        fetchSubtask();

        const interval = setInterval(fetchSubtask, 1000);
        return () => clearInterval(interval);
    }, [taskId, statusFilter]);

    // filters subtask by search
    const filteredSubtasks = (subtasks || []).filter((s) =>
        s.sub_task_name.toLowerCase().includes(search.toLowerCase())
    );

    // delete subtask
    const handleDeleteSubtask = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/tasks/delete-subtask/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await res.json();

            if (res.ok) {
                setSubtasks((prev) => prev.filter((s) => s.id !== id));
                alert(data.message);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.log(error);
            alert("server error");
        }
    }

    //update subtask
    const handleUpdate = async (id, newStatus) => {
        try {
            const res = await fetch(`http://localhost:8000/tasks/subtask-status/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await res.json();
            if (res.ok) {
                setSubtasks((prev) =>
                    prev.map((s) =>
                        s.id === id ? { ...s, sub_task_status: newStatus } : s
                    )
                );
                alert(data.message);
            } else {
                alert(data.message || "Failed to update status");
            }
        }
        catch (error) {
            console.log(error);
            alert("server error");
        }
    }

    //date formater
    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        const date = new Date(dateString);
        return date.toLocaleString("en-CA", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    // format seconds into hh:mm:ss
    const formatDuration = (seconds) => {
        if (!seconds || seconds <= 0) return "00h 00m 00s";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
    };

    return (
        <div className="subtask-layout">
            <div className="task-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}> ← </button>
                    <h2 className="task-title">My Subtasks</h2>
                </div>

                <div className="task-filters">
                    {["All", "Completed", "In Progress", "Not Started"].map((f) => (
                        <button
                            key={f}
                            className={`filter-btn ${statusFilter === f ? "active" : ""}`}
                            onClick={() => setStatusFilter(f)}
                        > {f} </button>
                    ))}
                </div>
            </div>

            <div className="subtask-content">
                <div className="task-table-section">
                    <div className="table-toolbar">
                        <button className="today-btn"> <Calendar size={14} /> Today </button>
                        <div className="search-box">
                            <Search size={14} className="search-icon" />
                            <input className="search-input" placeholder="Search Subtasks"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* table */}
                    <div className="subtask-list">
                        {task && (
                            <h3 className="main-task-header">
                                <span className="main-task-title">
                                    {task.task_name}
                                    <span
                                        className={`status-pill ${task.task_status?.replace(" ", "").toLowerCase()}`}
                                    >
                                        {task.task_status}
                                    </span>
                                </span>
                                <span className="task-total">Total: {formatDuration(task.task_total_time)}</span>
                            </h3>
                        )}

                        <table className="subtask-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input type="checkbox" className="subtask-checkbox" />
                                    </th>
                                    <th>Sub Tasks</th>
                                    <th>Start Time</th>
                                    <th>End Time</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSubtasks.map((sub) => (
                                    <React.Fragment key={sub.id}>
                                        <tr
                                            key={sub.id}
                                            onClick={() => setExpandedRow(expandedRow === sub.id ? null : sub.id)}
                                        >
                                            <td><input type="checkbox" /></td>
                                            <td>{sub.sub_task_name}</td>
                                            <td>{formatDateTime(sub.start_time)}</td>
                                            <td>{formatDateTime(sub.end_time)}</td>
                                            <td>{formatDuration(sub.total_time)}</td>
                                            <td>
                                                <select
                                                    className={`status-dropdown ${sub.sub_task_status.replace(" ", "").toLowerCase()}`}
                                                    value={sub.sub_task_status}
                                                    onChange={(e) => handleUpdate(sub.id, e.target.value)}
                                                >
                                                    <option value="Not Started">Not Started</option>
                                                    <option value="In Progress">In Progress</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </td>
                                        </tr>

                                        {expandedRow === sub.id && (
                                            <tr className="action-row">
                                                <td colSpan="6">
                                                    <div className="action-buttons">
                                                        <button className="edit-btn"
                                                            onClick={() => { openPanel(sub.id) }}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button className="delete-btn"
                                                            onClick={() => handleDeleteSubtask(sub.id)}
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {showTaskLogin && selectedSubTaskId && (
                    <TaskLogin
                        subTaskId={selectedSubTaskId}
                        onClose={closePanel}
                        onLogSaved={fetchSubtask}
                    />
                )}

            </div>
        </div>
    );
}

export default Subtask;


































