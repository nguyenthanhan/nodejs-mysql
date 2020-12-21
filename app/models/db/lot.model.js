"use strict";
module.exports = (sequelize, Sequelize) => {
  const Lots = sequelize.define(
    "Lot",
    {
      lotId: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      qttLotProductInWarehouse: {
        type: Sequelize.INTEGER(20),
      },
      importId: {
        type: Sequelize.BIGINT(20),
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    }
  );

  return Lots;
};
