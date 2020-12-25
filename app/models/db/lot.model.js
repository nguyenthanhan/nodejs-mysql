'use strict';
module.exports = (sequelize, Sequelize) => {
  const Lots = sequelize.define(
    'Lot',
    {
      lotId: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      qttLotInWarehouse: {
        type: Sequelize.INTEGER(20),
        defaultValue: 0,
      },
      qttProductInStore: {
        type: Sequelize.INTEGER(20),
        defaultValue: 0,
      },
      importId: {
        type: Sequelize.BIGINT(20),
      },
      expires: {
        type: Sequelize.DATE,
      },
      unit_name: {
        type: Sequelize.STRING(20),
      },
      conversionRate: {
        type: Sequelize.INTEGER(20),
      },
      import_price_unit: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
      },
      import_price_product: {
        type: Sequelize.BIGINT(20),
        allowNull: false,
      },
    },
    {
      paranoid: true,
      freezeTableName: true,
    }
  );

  return Lots;
};
