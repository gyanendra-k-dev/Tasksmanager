const { Task, User, Project } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const where = {};
    if (req.user.role === 'member') where.assigneeId = req.user.id;
    if (req.query.projectId) where.projectId = req.query.projectId;
    if (req.query.status) where.status = req.query.status;
    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Project, attributes: ['id', 'name'] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const validStatuses = ['todo', 'in-progress', 'completed', 'delayed'];
const validPriorities = ['low', 'medium', 'high'];

exports.create = async (req, res) => {
  try {
    const { title, description, projectId, assigneeId, priority, dueDate } = req.body;
    if (!title || !projectId) return res.status(400).json({ error: 'Title and projectId required' });
    if (!priority || !validPriorities.includes(priority)) return res.status(400).json({ error: 'Priority must be low, medium, or high' });
    const project = await Project.findByPk(projectId);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const task = await Task.create({ title, description, projectId, assigneeId, priority, dueDate, createdBy: req.user.id });
    const full = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Project, attributes: ['id', 'name'] },
      ],
    });
    res.status(201).json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    // Members can only update their own tasks' status
    if (req.user.role === 'member') {
      if (task.assigneeId !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
      const { status } = req.body;
      if (!status || !validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid task status' });
      await task.update({ status });
    } else {
      const { title, description, assigneeId, priority, dueDate, status } = req.body;
      if (priority && !validPriorities.includes(priority)) return res.status(400).json({ error: 'Priority must be low, medium, or high' });
      if (status && !validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid task status' });
      await task.update({ title, description, assigneeId, priority, dueDate, status });
    }
    const full = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] },
        { model: Project, attributes: ['id', 'name'] },
      ],
    });
    res.json(full);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    await task.destroy();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
