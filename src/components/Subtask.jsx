import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Search } from "lucide-react";
import TaskLogin from "./TaskLogin";

function formatDuration(seconds) {
    if (!seconds || seconds <= 0) return "0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(" ");
}

const STATUS_CLASS = {
    "Not Started": "not-started",
    "In Progress": "in-progress",
    "Completed": "completed",
};

const FILTERS = ["All", "Not Started", "In Progress", "Completed"];

function Subtask() {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const [expandedRow, setExpandedRow] = useState(null);
    const [showTaskLogin, setShowTaskLogin] = useState(false);
    const [subtasks, setSubtasks] = useState([]);
    const [task, setTask] = useState(null);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [liveTotal, setLiveTotal] = useState(0);

    useEffect(() => {
        const fetchSubTasks = async () => {
            try {
                const url =
                    filter === "All"
                        ? `http://localhost:8000/tasks/subtasks/${taskId}`
                        : `http://localhost:8000/tasks/subtasks/${taskId}?status=${encodeURIComponent(filter)}`;

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                const data = await response.json();
                if (response.ok) {
                    setTask(data.task);
                    setSubtasks(data.sub_tasks);
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error(error);
                alert("Server Error");
            }
        };

        fetchSubTasks();
    }, [taskId, filter]);


    const handleDeleteSubtask = async (id) => {
        try {
            const response = await fetch(`http://localhost:8000/tasks/delete-subtask/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                setSubtasks((prev) => prev.filter((s) => s.id !== id));
                alert("Subtask deleted successfully");
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Server Error");
        }
    };


    const handleUpdate = async (id, newStatus) => {
        try {
            const response = await fetch(`http://localhost:8000/tasks/subtask-status/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            const data = await response.json();

            if (response.ok) {
                setSubtasks((prev) =>
                    prev.map((s) =>
                        s.id === id ? { ...s, sub_task_status: newStatus } : s
                    )
                );
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error(error);
            alert("Server Error");
        }
    };


    const filteredSubtasks = subtasks.filter((s) =>
        s.sub_task_name.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const interval = setInterval(() => {
            let sum = 0;
            filteredSubtasks.forEach((s) => {
                if (s.sub_task_status === "In progress" && s.start_time) {
                    const start = new Date(s.start_time);
                    const now = new Date();
                    const elapsed = Math.floor((now - start) / 60000);
                    sum += elapsed;
                } else {
                    sum += s.total_time || 0;
                }
            });
            setLiveTotal(sum);
        }, 1000);

        return () => clearInterval(interval);
    }, [filteredSubtasks]);

    return (
        <div className="subtask-layout">
            <div className="task-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        ←
                    </button>
                    <h2 className="task-title">My Subtasks</h2>
                </div>

                <div className="task-filters">
                    {["All", "Completed", "In progress", "Not Started"].map((f) => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? "active" : ""}`}
                            onClick={() => setFilter(f)}
                        >
                            {f}
                        </button>
                    ))}
                </div>

            </div>

            <div className="subtask-content">
                <div className="task-table-section">
                    <div className="table-toolbar">
                        <button className="today-btn">
                            <Calendar size={14} /> Today
                        </button>
                        <div className="search-box">
                            <Search size={14} className="search-icon" />
                            <input
                                className="search-input"
                                placeholder="Search Subtasks"
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
                                        className={`status-pill ${task.task_status
                                            ?.replace(" ", "")
                                            .toLowerCase()}`}
                                    >
                                        {task.task_status}
                                    </span>
                                </span>
                                <span className="task-total">Total: {liveTotal} min</span>
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
                                            onClick={() => setExpandedRow(expandedRow === sub.id ? null : sub.id)
                                            }
                                        >
                                            <td>
                                                <input type="checkbox" />
                                            </td>
                                            <td>{sub.sub_task_name}</td>
                                            <td>{sub.start_time || "—"}</td>
                                            <td>{sub.end_time || "—"}</td>
                                            <td>{sub.total_time || 0} min</td>
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
                                                        <button
                                                            className="edit-btn"
                                                            onClick={() => setShowTaskLogin(true)}
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="delete-btn"
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

                {showTaskLogin && <TaskLogin onClose={() => setShowTaskLogin(false)} />}
            </div>
        </div>
    );
}

export default Subtask;


































