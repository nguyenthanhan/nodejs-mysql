'use strict';
module.exports = (sequelize, Sequelize) => {
  const Export = sequelize.define(
    'Export',
    {
      ExID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      export_number: {
        type: Sequelize.STRING(40),
      },
      state: {
        type: Sequelize.ENUM('request', 'executed', 'close'),
      },
      urgent_level: {
        type: Sequelize.ENUM('normal', 'priority'),
      },
      export_action_date: {
        type: Sequelize.DATEONLY,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    }
  );

  return Export;
};
