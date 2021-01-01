'use strict';
module.exports = (sequelize, Sequelize) => {
  const Managers = sequelize.define(
    'Manager',
    {
      MngID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      FName: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: '',
      },
      LName: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: '',
      },
      accountName: {
        type: Sequelize.STRING(80),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(64),
        allowNull: false,
      },
      Address: {
        type: Sequelize.STRING(80),
        defaultValue: '',
      },
      BDay: {
        type: Sequelize.DATEONLY,
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        defaultValue: 'male',
      },
      salary: {
        type: Sequelize.BIGINT(20),
      },
      email: {
        type: Sequelize.STRING(80),
        validate: { isEmail: true },
      },
      avt_url: {
        type: Sequelize.TEXT,
      },
      date_start_working: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW,
      },
      managerType: {
        type: Sequelize.ENUM('normal', 'prime'),
        defaultValue: 'normal',
      },
      telephoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: '',
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    }
  );

  return Managers;
};
