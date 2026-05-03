import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '';
const isOverdue = (d, status) => d && status !== 'completed' && new Date(d) < new Date();

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/tasks')])
      .then(([p, t]) => { setProjects(p.data); setTasks(t.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  const completed = tasks.filter(t=>t.status==='completed').length;
  const overdue = tasks.filter(t=>isOverdue(t.dueDate,t.status)).length;
  const inProgress = tasks.filter(t=>t.status==='in-progress').length;

  const statusLabel = {todo:'To Do','in-progress':'In Progress',completed:'Completed',delayed:'Delayed'};
  const statusBadge = {todo:'badge-todo','in-progress':'badge-in-progress',completed:'badge-done',delayed:'badge-warning'};

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
      </div>

      <div className="grid-4 mb-1h">
        {[
          {label:'Projects',value:projects.length},
          {label:'Total Tasks',value:tasks.length},
          {label:'In Progress',value:inProgress},
          {label:'Overdue',value:overdue,danger:overdue>0},
        ].map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-label" style={s.danger?{color:'#a32d2d'}:{}}>{s.label}</div>
            <div className="stat-value" style={s.danger?{color:'#dc2626'}:{}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="flex-between mb-1"><h2 style={{fontSize:16,fontWeight:600}}>Recent Tasks</h2></div>
          {tasks.slice(0,6).map(t => (
            <div className="task-row" key={t.id}>
              <div style={{flex:1}}>
                <div className={`task-title ${t.status==='completed'?'done':''}`}>{t.title}</div>
                <div className="task-meta">{t.Project?.name} {isOverdue(t.dueDate,t.status)&&<span className="text-danger">· Overdue</span>}</div>
              </div>
              <span className={`badge ${statusBadge[t.status]||'badge-todo'}`}>{statusLabel[t.status]||t.status}</span>
            </div>
          ))}
          {!tasks.length && <div className="empty-state"><div>No tasks yet</div></div>}
        </div>

        <div className="card">
          <div className="flex-between mb-1"><h2 style={{fontSize:16,fontWeight:600}}>Projects Progress</h2></div>
          {projects.map(p => {
            const pts = p.Tasks || [];
            const pDone = pts.filter(t=>t.status==='completed').length;
            const pct = pts.length ? Math.round(pDone/pts.length*100) : 0;
            return (
              <div key={p.id} style={{marginBottom:'1rem',cursor:'pointer'}} onClick={()=>navigate(`/projects/${p.id}`)}>
                <div className="flex-between" style={{marginBottom:6}}>
                  <span style={{fontSize:14,fontWeight:500}}>{p.name}</span>
                  <span className="text-secondary text-sm">{pct}%</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
                <div className="text-secondary text-sm" style={{marginTop:4}}>{pDone}/{pts.length} tasks · Due {fmtDate(p.dueDate)}</div>
              </div>
            );
          })}
          {!projects.length && <div className="empty-state"><div>No projects yet</div></div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
