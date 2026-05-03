const { Project, Task, User } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        { model: Task, include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }] },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
        {
          model: Task,
          include: [
            { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
            { model: User, as: 'creator', attributes: ['id', 'name'] },
          ],
        },
      ],
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, dueDate, status } = req.body;
    if (!name) return res.status(400).json({ error: 'Project name required' });
    const validStatus = status || 'in-progress';
    const project = await Project.create({ name, description, dueDate, status: validStatus, createdBy: req.user.id });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    const { name, description, dueDate, status } = req.body;
    await project.update({ name, description, dueDate, status });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    await project.destroy();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
