import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';
  const colors = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed'];
  const colorFor = (str) => { let h = 0; for (let c of (str||'')) h = (h<<5)-h+c.charCodeAt(0); return colors[Math.abs(h)%colors.length]; };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="logo">Task<span>flow</span></div>

        <nav>
          <div className="nav-section">
            <NavLink to="/dashboard" className={({isActive}) => `nav-item${isActive?' active':''}`}>
              <span className="nav-icon">◈</span> Dashboard
            </NavLink>
            <NavLink to="/projects" className={({isActive}) => `nav-item${isActive?' active':''}`}>
              <span className="nav-icon">▦</span> Projects
            </NavLink>
            <NavLink to="/tasks" className={({isActive}) => `nav-item${isActive?' active':''}`}>
              <span className="nav-icon">✓</span> My Tasks
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/team" className={({isActive}) => `nav-item${isActive?' active':''}`}>
                <span className="nav-icon">⬡</span> Team
              </NavLink>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info flex gap-8">
            <div className="avatar" style={{background: colorFor(user?.id), width:32, height:32, fontSize:12}}>
              {initials(user?.name)}
            </div>
            <div>
              <div className="user-name">{user?.name}</div>
              <span className={`badge badge-${user?.role}`}>{user?.role}</span>
            </div>
          </div>
          <button className="btn btn-ghost w-full" onClick={handleLogout} style={{justifyContent:'flex-start'}}>
            ↩ Sign out
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
