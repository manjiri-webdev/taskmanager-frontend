import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import '../App.css';

function Dashboard({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
        <Topbar />
        <div className="main-content">
          {children}
        </div>
    </div>
  );
}

export default Dashboard;
