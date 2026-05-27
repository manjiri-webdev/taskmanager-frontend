import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Subtask from "./components/Subtask";
import Dashboard from "./components/Dashboard";
import MyTask from "./components/MyTask";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <Dashboard>
              <MyTask />
            </Dashboard>
          }
        />

        <Route
          path="/myTask"
          element={
            <Dashboard>
              <MyTask />
            </Dashboard>
          }
        />

        <Route
          path="/myTask/:taskId"
          element={
            <Dashboard>
              <Subtask />
            </Dashboard>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
