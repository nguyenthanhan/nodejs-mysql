"use strict";
module.exports = (sequelize, Sequelize) => {
  const Logs = sequelize.define(
    "Logs",
    {
      id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
      },
      MngID: {
        type: Sequelize.BIGINT(20),
      },
      action: {
        type: Sequelize.ENUM("add", "edit", "delete"),
      },
      tableOfAction: {
        type: Sequelize.ENUM(
          "bill",
          "category",
          "export",
          "import",
          "lot",
          "manager",
          "product",
          "shelf",
          "supplier"
        ),
      },
      idOfAffectedObject: {
        type: Sequelize.BIGINT(20),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    },
    {
      timestamps: false,
      freezeTableName: true,
    }
  );

  return Logs;
};
