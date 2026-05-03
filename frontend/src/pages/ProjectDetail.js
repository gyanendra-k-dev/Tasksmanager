import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Modal from '../components/Modal';

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '';
const isOverdue = (d, status) => d && status!=='completed' && new Date(d) < new Date();
const initials = (name) => (name||'').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)||'?';
const COLORS = ['#4f46e5','#0891b2','#059669','#d97706','#dc2626','#7c3aed'];
const colorFor = (str) => { let h=0; for(let c of (str||'')) h=(h<<5)-h+c.charCodeAt(0); return COLORS[Math.abs(h)%COLORS.length]; };

const statusLabel = {todo:'To Do','in-progress':'In Progress',completed:'Completed',delayed:'Delayed'};
const statusBadge = {todo:'badge-todo','in-progress':'badge-in-progress',completed:'badge-done',delayed:'badge-warning'};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [taskModal, setTaskModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title:'', description:'', assigneeId:'', priority:'medium', dueDate:'' });

  const load = useCallback(() => {
    Promise.all([api.get(`/projects/${id}`), api.get('/users')])
      .then(([p, u]) => { setProject(p.data); setUsers(u.data); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm(f => ({...f, [k]: v}));

  const handleCreateTask = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      await api.post('/tasks', { ...form, projectId: id });
      setTaskModal(false); setForm({title:'',description:'',assigneeId:'',priority:'medium',dueDate:''}); load();
    } catch(err) { setError(err.response?.data?.error||'Failed to create task'); }
    finally { setSaving(false); }
  };

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}`, { status });
    load();
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`); load();
  };

  if (loading) return <div className="loading-screen"><div className="spinner"/></div>;
  if (!project) return <div>Project not found</div>;

  const tasks = project.Tasks || [];
  const completed = tasks.filter(t=>t.status==='completed').length;
  const inProg = tasks.filter(t=>t.status==='in-progress').length;
  const od = tasks.filter(t=>isOverdue(t.dueDate,t.status)).length;
  const pct = tasks.length ? Math.round(completed/tasks.length*100) : 0;

  return (
    <div>
      <div className="back-link" onClick={()=>navigate('/projects')}>← Back to Projects</div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{project.name}</h1>
          <div className="text-secondary text-sm" style={{marginTop:4}}>{project.description} · Due {fmtDate(project.dueDate)}</div>
        </div>
        {user?.role==='admin' && <button className="btn btn-primary" onClick={()=>setTaskModal(true)}>+ Add Task</button>}
      </div>

      <div className="grid-4 mb-1h">
        <div className="stat-card"><div className="stat-label">Total Tasks</div><div className="stat-value">{tasks.length}</div></div>
        <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value">{inProg}</div></div>
        <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value">{completed}</div></div>
        <div className="stat-card"><div className="stat-label" style={od?{color:'#a32d2d'}:{}}>Overdue</div><div className="stat-value" style={od?{color:'#dc2626'}:{}}>{od}</div></div>
      </div>

      <div className="card" style={{marginBottom:'1rem'}}>
        <div className="flex-between" style={{marginBottom:8}}>
          <span className="text-sm" style={{fontWeight:500}}>Progress</span>
          <span className="text-secondary text-sm">{pct}% complete</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${pct}%`}}/></div>
      </div>

      <div className="card">
        <h2 style={{fontSize:16,fontWeight:600,marginBottom:'1rem'}}>Tasks ({tasks.length})</h2>
        {!tasks.length ? (
          <div className="empty-state">
            <div>No tasks yet</div>
            {user?.role==='admin'&&<button className="btn btn-primary" style={{marginTop:8}} onClick={()=>setTaskModal(true)}>Add first task</button>}
          </div>
        ) : tasks.map(t => {
          const assignee = t.assignee;
          const od2 = isOverdue(t.dueDate, t.status);
          const canEdit = user?.role==='admin' || t.assigneeId===user?.id;
          return (
            <div className="task-row" key={t.id}>
              <div className={`priority-bar priority-${t.priority}`}/>
              <div style={{flex:1}}>
                <div className={`task-title ${t.status==='completed'?'done':''}`}>{t.title}</div>
                <div className="task-meta">
                  {od2&&<span className="text-danger">Overdue · </span>}
                  {t.description||'No description'} · Due {fmtDate(t.dueDate)}
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
                {user?.role==='admin' && (
                  <button className="btn btn-sm btn-danger" onClick={()=>deleteTask(t.id)}>✕</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={taskModal} onClose={()=>setTaskModal(false)} title="Add Task">
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleCreateTask}>
          <div className="form-group"><label>Task Title *</label><input type="text" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Design mockups" required/></div>
          <div className="form-group"><label>Description</label><textarea rows={2} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Optional details"/></div>
          <div className="form-group">
            <label>Assign To</label>
            <select value={form.assigneeId} onChange={e=>set('assigneeId',e.target.value)}>
              <option value="">Unassigned</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e=>set('priority',e.target.value)}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
              </select>
            </div>
            <div className="form-group"><label>Due Date</label><input type="date" value={form.dueDate} onChange={e=>set('dueDate',e.target.value)}/></div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn" onClick={()=>setTaskModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?'Adding...':'Add Task'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProjectDetail;
