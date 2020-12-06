"use strict";
module.exports = (sequelize, Sequelize) => {
  const Lots = sequelize.define(
    "Lot",
    {
      proID: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(80),
        primaryKey: true,
      },
      quantity: {
        type: Sequelize.STRING(80),
      },
      Exp: {
        type: Sequelize.DATE,
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
