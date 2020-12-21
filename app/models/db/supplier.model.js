'use strict';
module.exports = (sequelize, Sequelize) => {
  const Supplier = sequelize.define(
    'Supplier',
    {
      SupID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: '',
      },
      Address: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: '',
      },
      Tax_ID: {
        type: Sequelize.INTEGER(20),
        allowNull: false,
        defaultValue: 0,
      },
      telephoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: '',
      },
      Email: {
        type: Sequelize.STRING(40),
        allowNull: false,
        defaultValue: '',
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    }
  );

  return Supplier;
};
