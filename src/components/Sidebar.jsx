import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { LayoutDashboard, ListChecks } from "lucide-react";
import '../task.css';

function Sidebar() {
    return (
        <nav className='sidebar'>
            <div>
                <img src={logo} alt="Logo" />
            </div>
            <Link to="/dashboard" className="nav-link">
                <LayoutDashboard className="nav-icon" />
                <span>Dashboard</span>
            </Link>

            <Link to="/myTask" className="nav-link">
                <ListChecks className="nav-icon" />
                <span>My Task</span>
            </Link>
        </nav>
    )
}

export default Sidebar;