import { useNavigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, Edit2, Trash2, Users, ArrowLeftRight } from 'lucide-react';
import CreateTask from './CreateTask';
import '../task.css';

const STATE_COLORS = {
    'In Progress': { bg: '#FFF3CD', color: '#D97706', label: 'InProgress' },
    'Not Started': { bg: '#FFE4E6', color: '#EF4444', label: 'Not Started' },
    'Completed':   { bg: '#DCFCE7', color: '#16A34A', label: 'Completed'  },
};

const FILTERS = ['All', 'Completed', 'In progress', 'Not started'];

const FILTER_TO_STATUS = {
    'All': null,
    'Completed': 'Completed',
    'In progress': 'In Progress',
    'Not started': 'Not Started',
};

function StateBadge({ status }) {
    const s = STATE_COLORS[status] || STATE_COLORS['Not Started'];
    return (
        <span style={{
            background: s.bg,
            color: s.color,
            fontSize: 12,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
            display: 'inline-block',
        }}>
            {s.label}
        </span>
    );
}

function ProgressBar({ value, status }) {
    const color =
        status === 'Completed'   ? '#16A34A' :
        status === 'Not Started' ? '#D1D5DB' : '#EF4444';
        status === 'In Progress' ? '#D97706' : '#D1D5DB';
    const pct = value ?? 0;

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 120 }}>
            <div style={{ flex: 1, height: 5, background: '#E5E7EB', borderRadius: 99, position: 'relative' }}>
                <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: color,
                    borderRadius: 99,
                    position: 'relative',
                }}>

                </div>
            </div>
        </div>
    );
}

function FlagIcon({ priority }) {
    const isHigh = priority === 'high';
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill={isHigh ? '#EF4444' : 'none'} xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2v12M3 2h8l-2 3.5L11 9H3" stroke={isHigh ? '#EF4444' : '#3B82F6'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
    );
}

export default function MyTask() {
    const [tasks, setTasks] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [selected, setSelected]  = useState([]);
    const [page, setPage] = useState(1);
    const [openMenu, setOpenMenu] = useState(null);
    const [showCreate, setShowCreate] = useState(false);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/tasks/all", {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();

            if (response.ok) setTasks(data.tasks);
            else alert(data.message);

        } catch (err) {
            console.error(err);
            alert("Server Error");

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const PAGE_SIZE = 10;

    const apiStatus = FILTER_TO_STATUS[filter];
    const filtered = tasks.filter(t => {
        const matchFilter = !apiStatus || t.status === apiStatus;
        const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const toggleSelect = id =>
        setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

    const toggleAll = () =>
        setSelected(selected.length === paginated.length && paginated.length > 0
            ? [] : paginated.map(t => t.id));

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this task?")) return;
        try {
            const response = await fetch(`http://localhost:8000/tasks/delete-task/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            
            const data = await response.json();

            if (response.ok) {
                setTasks(ts => ts.filter(t => t.id !== id));
                setSelected(s => s.filter(x => x !== id));
            } else alert(data.message);

        } catch (err) {
            console.error(err);
            alert("Server Error");
        }
        setOpenMenu(null);
    };

    const handleAddTask = (newTask) => setTasks(prev => [newTask, ...prev]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${mm}/${dd}/${yyyy}`;
    };

    return (
        <div
            className="mytask-container"
            onClick={() => setOpenMenu(null)}
        >

            <div className="mytask-header">
                <div className="mytask-header-left">
                    <h2 className="mytask-title">My Tasks</h2>
                    <div className="mytask-filters">
                        {FILTERS.map(f => (
                            <button
                                key={f}
                                className={`filter-btn ${filter === f ? 'active' : ''}`}
                                onClick={() => { setFilter(f); setPage(1); }}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mytask-header-right">
                    <div className="search-box">
                        <Search size={14} color="#9CA3AF" />
                        <input
                            placeholder="Search Tasks"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                        />
                    </div>
                    <button className="add-task-btn" onClick={() => setShowCreate(true)}>
                        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add New Task
                    </button>
                </div>
            </div>

            {showCreate && (
                <CreateTask onClose={() => setShowCreate(false)} onAddTask={handleAddTask} />
            )}

            <div className="task-table-wrapper">
                {loading ? (
                    <div className="task-empty-state">Loading tasks…</div>
                ) : filtered.length === 0 ? (
                    <div className="task-empty-state">No tasks found.</div>
                ) : (
                    <table className="task-table">
                        <thead>
                            <tr>
                                <th style={{ width: 36, paddingLeft: 16 }}>
                                    <input
                                        type="checkbox"
                                        checked={selected.length === paginated.length && paginated.length > 0}
                                        onChange={toggleAll}
                                        style={{ accentColor: '#007AFF', cursor: 'pointer' }}
                                    />
                                </th>
                                <th>Task</th>
                                <th>Assigned to</th>
                                <th>State</th>
                                <th>Priority</th>
                                <th>Due Date</th>
                                <th>Estimated</th>
                                <th>Progress</th>
                                <th style={{ width: 36 }}></th>
                            </tr>
                        </thead>

                        <tbody>
                            {paginated.map(task => (
                                <tr
                                    key={task.id}
                                    className={selected.includes(task.id) ? 'selected-row' : ''}
                                    onClick={() => setOpenMenu(null)}
                                >
                                    <td style={{ paddingLeft: 16 }}>
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(task.id)}
                                            onChange={() => toggleSelect(task.id)}
                                            style={{ accentColor: '#007AFF', cursor: 'pointer' }}
                                        />
                                    </td>

                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span className="task-name">{task.name}</span>
                                            <span className="subtask-count-chip">
                                                <ArrowLeftRight size={11} strokeWidth={2} />
                                                {task.subtask_count ?? ''}
                                            </span>
                                        </div>
                                    </td>

                                    <td>
                                        <div className="assigned-chip">
                                            <span className="assigned-team">{task.assigned_to || 'Unassigned'}</span>
                                            {task.member_count != null && (
                                                <span className="assigned-members">
                                                    <Users size={11} />
                                                    {task.member_count}
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td><StateBadge status={task.status} /></td>

                                    <td><FlagIcon priority={task.priority} /></td>

                                    <td className="td-muted">{formatDate(task.due_date)}</td>

                                    <td className="td-muted">{task.estimated || '—'}</td>

                                    <td>
                                        <ProgressBar value={task.progress} status={task.status} />
                                    </td>

                                    <td style={{ position: 'relative' }}>
                                        <button
                                            className="more-btn"
                                            onClick={e => {
                                                e.stopPropagation();
                                                setOpenMenu(openMenu === task.id ? null : task.id);
                                            }}
                                        >
                                            <MoreHorizontal size={16} />
                                        </button>

                                        {openMenu === task.id && (
                                            <div
                                                className="dropdown-menu"
                                                onClick={e => e.stopPropagation()}
                                            >
                                                <button onClick={() => { setOpenMenu(null); navigate(`/myTask/${task.id}`); }}>
                                                    <Edit2 size={13} /> View / Edit
                                                </button>
                                                <button onClick={() => handleDelete(task.id)} style={{ color: '#EF4444' }}>
                                                    <Trash2 size={13} /> Delete
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="pagination">
                <button
                    className="page-arrow"
                    disabled={page <= 1}
                    onClick={() => setPage(p => p - 1)}
                >
                    <ChevronLeft size={15} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => (
                    <button
                        key={i + 1}
                        className={`page-num ${page === i + 1 ? 'active-page' : ''}`}
                        onClick={() => setPage(i + 1)}
                    >
                        {i + 1}
                    </button>
                ))}

                <button
                    className="page-arrow"
                    disabled={page >= totalPages}
                    onClick={() => setPage(p => p + 1)}
                >
                    <ChevronRight size={15} />
                </button>
            </div>
        </div>
    );
}