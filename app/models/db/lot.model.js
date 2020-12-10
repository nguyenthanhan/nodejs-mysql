"use strict";
module.exports = (sequelize, Sequelize) => {
  const Lots = sequelize.define(
    "Lot",
    {
      proID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      name: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: "",
      },
      quantity: {
        type: Sequelize.STRING(80),
        allowNull: false,
      },
      Exp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        updatedAt: Sequelize.NOW,
      },
    },
    {
      timestamps: true,
      freezeTableName: true,
    }
  );

  return Lots;
};
