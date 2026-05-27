import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import CustomCursor from '../components/CustomCursor';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 cursor-none">
      <CustomCursor />
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-serif mb-8 text-center tracking-widest uppercase">Admin Access</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
            <div>
                <input 
                    type="text" 
                    placeholder="Username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 py-2 text-center text-white focus:border-white focus:outline-none transition-colors"
                />
            </div>
            <div>
                <input 
                    type="password" 
                    placeholder="Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent border-b border-white/20 py-2 text-center text-white focus:border-white focus:outline-none transition-colors"
                />
            </div>

            {error && <p className="text-red-500 text-xs text-center uppercase tracking-widest">{error}</p>}

            <button type="submit" className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-[0.2em] hover:bg-gray-200 transition-colors">
                Enter System
            </button>
        </form>
      </div>
    </div>
  );
}
