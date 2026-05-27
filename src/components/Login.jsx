import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8000/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        alert("login successfull");
        localStorage.setItem("token", data.token);
        navigate("/Dashboard");
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.log(error);
      alert("server error");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Login to Manage Tasks</h2>

        <form className="auth-form" onSubmit={handleLogin} >

          <div className="form-section">
            <label className="form-label">Email</label>
            <input className="auth-input" type="email" placeholder="abc@gmail.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-section">
            <label className="form-label">Password</label>
            <input className="auth-input" type="password" placeholder="••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button className="create-task-btn" type="submit" style={{ width: '100%' }}>Login</button>
          <p className="auth-link-text">Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>

        </form>
      </div>
    </div>
  )
}

export default Login