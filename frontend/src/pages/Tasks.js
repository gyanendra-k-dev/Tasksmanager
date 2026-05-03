import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short'}) : '';
const isOverdue = (d, status) => d && status!=='completed' && new Date(d) < new Date();
const initials = (name) => (name||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';
const COLORS = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed'];
const colorFor = (str) => { let h=0; for(let c of (str||'')) h=(h<<5)-h+c.charCodeAt(0); return COLORS[Math.abs(h)%COLORS.length]; };

const Tasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (projectFilter) params.projectId = projectFilter;
    Promise.all([api.get('/tasks', {params}), api.get('/projects')])
      .then(([t, p]) => { setTasks(t.data); setProjects(p.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter, projectFilter]);

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status });
    load();
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}</h1>
        <div className="flex gap-8">
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{width:'auto'}}>
            <option value="">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="delayed">Delayed</option>
            <option value="completed">Completed</option>
          </select>
          <select value={projectFilter} onChange={e=>setProjectFilter(e.target.value)} style={{width:'auto'}}>
            <option value="">All Projects</option>
            {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      <div className="card">
        {!tasks.length ? (
          <div className="empty-state"><div className="empty-icon">✓</div><div>No tasks match your filters</div></div>
        ) : tasks.map(t => {
          const assignee = t.assignee;
          const od = isOverdue(t.dueDate, t.status);
          const canEdit = user?.role==='admin' || t.assigneeId===user?.id;
          return (
            <div className="task-row" key={t.id}>
              <div className={`priority-bar priority-${t.priority}`}/>
              <div style={{flex:1}}>
                <div className={`task-title ${t.status==='completed'?'done':''}`}>{t.title}</div>
                <div className="task-meta">
                  <span>{t.Project?.name}</span>
                  {od && <span className="text-danger"> · Overdue</span>}
                  <span> · Due {fmtDate(t.dueDate)}</span>
                </div>
              </div>
              <div className="flex gap-8" style={{flexShrink:0}}>
                {assignee && (
                  <div className="avatar" style={{background:colorFor(assignee.id)}} title={assignee.name}>
                    {initials(assignee.name)}
                  </div>
                )}
                <span className={`badge badge-${t.priority}`}>{t.priority}</span>
                <select value={t.status} disabled={!canEdit}
                  onChange={e=>updateStatus(t.id,e.target.value)}
                  style={{width:'auto',fontSize:13,padding:'4px 8px'}}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="delayed">Delayed</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;
