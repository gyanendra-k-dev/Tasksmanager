const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  dueDate: { type: DataTypes.DATEONLY },
  status: { type: DataTypes.ENUM('active', 'completed', 'archived', 'in-progress'), defaultValue: 'in-progress', allowNull: false },
  createdBy: { type: DataTypes.UUID, allowNull: false },
});

module.exports = Project;
