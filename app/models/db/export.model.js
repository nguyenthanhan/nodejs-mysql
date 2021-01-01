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
      state: {
        type: Sequelize.ENUM('request', 'executed', 'close'),
      },
      urgent_level: {
        type: Sequelize.ENUM('normal', 'priority'),
      },
      export_date: {
        type: Sequelize.DATE,
      },
      request_export_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      bonus: {
        type: Sequelize.TEXT,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    }
  );

  return Export;
};
