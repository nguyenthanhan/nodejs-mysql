'use strict';
module.exports = (sequelize, Sequelize) => {
  const Import = sequelize.define(
    'Import',
    {
      ImID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      request_import_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      import_date: {
        type: Sequelize.DATE,
      },
      state: {
        type: Sequelize.ENUM('request', 'executed', 'close'),
        defaultValue: 'request',
      },
      urgent_level: {
        type: Sequelize.ENUM('normal', 'priority'),
        defaultValue: 'normal',
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

  return Import;
};
