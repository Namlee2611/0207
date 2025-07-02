import { useState } from 'react';
import { setAuthToken } from '../utils/auth';
import axios from '../utils/auth';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5226/api/auth/login', { 
        Username: username, 
        Password: password 
      });
      setAuthToken(res.data.token);
      localStorage.setItem('username', res.data.username || 'Tên Người Dùng');
      localStorage.setItem('role', res.data.role || 'User');
      localStorage.setItem('userId', res.data.id);
      if (res.data.role === 'Admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/user';
      }
      setMessage('Đăng nhập thành công');
    } catch (error) {
      console.error('Login error:', error.response?.data);
      setMessage('Đăng nhập thất bại');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-5 shadow-lg" style={{ maxWidth: '450px', width: '100%' }}>
        <h2 className="text-center mb-4 fs-3">Đăng nhập</h2>
        <div className="mb-4">
          <input 
            type="text" 
            className="form-control form-control-lg" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            placeholder="Tên đăng nhập (email)" 
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <input 
            type="password" 
            className="form-control form-control-lg" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="Mật khẩu" 
            autoComplete="current-password"
          />
        </div>
        <button 
          onClick={handleLogin} 
          className="btn btn-primary btn-lg w-100"
        >
          Đăng nhập
        </button>
        {message && <p className={`mt-4 text-center fs-5 ${message.includes('thành công') ? 'text-success' : 'text-danger'}`}>{message}</p>}
      </div>
    </div>
  );
}

export default Login;