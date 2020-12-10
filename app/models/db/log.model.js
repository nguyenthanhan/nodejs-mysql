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
        type: Sequelize.ENUM("Thêm", "Sửa", "Xoá"),
      },
      tableOfAction: {
        type: Sequelize.ENUM(
          "Hoá đơn",
          "Loại hàng",
          "Xuất hàng",
          "Nhập hàng",
          "Lô hàng",
          "Quản lý",
          "Sản phẩm",
          "Kệ hàng",
          "Nhà cung cấp"
        ),
      },
      nameInRow: {
        type: Sequelize.STRING(80),
      },
      affectedRowID: {
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
