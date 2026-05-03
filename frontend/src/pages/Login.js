import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'member' });

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'login') await login(form.email, form.password);
      else await signup(form.name, form.email, form.password, form.role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'#f8f7f4',padding:'2rem'}}>
      <div style={{width:400}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{fontSize:'28px',fontWeight:600,letterSpacing:'-0.5px'}}>Task<span style={{color:'#4f46e5'}}>flow</span></div>
          <div className="text-secondary text-sm" style={{marginTop:4}}>Project management, simplified</div>
        </div>

        <div className="card">
          <div className="flex gap-8" style={{borderBottom:'1px solid #e8e6e1',paddingBottom:'1rem',marginBottom:'1.25rem'}}>
            {['login','signup'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); }}
                className="btn" style={{flex:1,justifyContent:'center',background:tab===t?'#f4f3f0':'transparent',border:'none',fontWeight:tab===t?600:400}}>
                {t === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {tab === 'signup' && (
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e=>set('name',e.target.value)} required/>
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} required/>
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} required/>
            </div>
            {tab === 'signup' && (
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e=>set('role',e.target.value)}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}
            <button type="submit" className="btn btn-primary w-full" style={{justifyContent:'center',marginTop:8}} disabled={loading}>
              {loading ? 'Please wait...' : tab === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
