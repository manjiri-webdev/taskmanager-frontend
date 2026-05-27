import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Signup() {

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        "http://localhost:8000/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", },
          body: JSON.stringify({
            username,
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Signup Successful");
        localStorage.setItem("token", data.token);
        navigate("/login");
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log(error);
      alert("Server Error");
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">
        <h2 className="auth-title">Welcome!</h2>
        <p className="auth-subtitle">
          Sign up to start managing tasks
        </p>

        <form className="auth-form" onSubmit={handleSignup}>

          <div className="form-section">
            <label className="form-label">
              Username
            </label>
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              Email
            </label>
            <input
              className="auth-input"
              type="email"
              placeholder="abc@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-section">
            <label className="form-label">
              Password
            </label>
            <input
              className="auth-input"
              type="password"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="create-task-btn"
            style={{ width: '100%' }}
          >
            Sign Up
          </button>

          <p className="auth-link-text">
            Already have an account?

            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>

        </form>
      </div>
    </div>
  )
}

export default Signup