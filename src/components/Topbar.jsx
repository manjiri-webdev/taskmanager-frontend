import avatar from '../assets/avatar.png';
import '../task.css';

function Topbar() {
  const today = new Date().toLocaleDateString("en-CA")
  return (
    <div className="topbar">
      <div className="topbar-left">
        <h1 className="topbar-title">Task Management</h1>
        <p className="topbar-subtitle">Last Update : {today}    </p>
      </div>

      <div className="topbar-right">
        <div className="user-info">
          <h2 className="user-name">Divya</h2>
          <p className="user-role">UI/UX Designer</p>
        </div>
        <img
          src={avatar}
          alt="User profile"
          className="user-avatar"
        />
      </div>
    </div>
  );
}

export default Topbar;
