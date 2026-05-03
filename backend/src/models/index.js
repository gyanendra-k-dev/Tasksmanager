const sequelize = require('../config/database');
const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');

// Associations
Project.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.hasMany(Project, { foreignKey: 'createdBy' });

Task.belongsTo(Project, { foreignKey: 'projectId', onDelete: 'CASCADE' });
Project.hasMany(Task, { foreignKey: 'projectId' });

Task.belongsTo(User, { as: 'assignee', foreignKey: 'assigneeId' });
User.hasMany(Task, { as: 'assignedTasks', foreignKey: 'assigneeId' });

Task.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

module.exports = { sequelize, User, Project, Task };
