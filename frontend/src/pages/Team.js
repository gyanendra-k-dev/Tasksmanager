import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const initials = (name) => (name||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';
const COLORS = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed'];
const colorFor = (str) => { let h=0; for(let c of (str||'')) h=(h<<5)-h+c.charCodeAt(0); return COLORS[Math.abs(h)%COLORS.length]; };

const Team = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([api.get('/users'), api.get('/tasks')])
      .then(([u, t]) => { setUsers(u.data); setTasks(t.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const updateRole = async (userId, role) => {
    await api.patch(`/users/${userId}/role`, { role }); load();
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Team ({users.length})</h1>
      </div>

      <div className="card">
        {users.map(u => {
          const taskCount = tasks.filter(t=>t.assigneeId===u.id).length;
          const doneCount = tasks.filter(t=>t.assigneeId===u.id&&t.status==='completed').length;
          return (
            <div className="task-row" key={u.id}>
              <div className="avatar" style={{background:colorFor(u.id),width:40,height:40,fontSize:14}}>
                {initials(u.name)}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:500}}>{u.name}</div>
                <div className="text-secondary text-sm">{u.email}</div>
              </div>
              <div className="flex gap-8" style={{flexShrink:0}}>
                <span className="text-secondary text-sm">{doneCount}/{taskCount} tasks done</span>
                {me?.id !== u.id ? (
                  <select value={u.role} onChange={e=>updateRole(u.id,e.target.value)} style={{width:'auto',fontSize:13,padding:'4px 8px'}}>
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  <span className={`badge badge-${u.role}`}>{u.role} (you)</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Team;
