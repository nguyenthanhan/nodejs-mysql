'use strict';
module.exports = (sequelize, Sequelize) => {
  const Logs = sequelize.define(
    'Logs',
    {
      id: {
        type: Sequelize.BIGINT(20),
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      MngID: {
        type: Sequelize.BIGINT(20),
      },
      action: {
        type: Sequelize.ENUM('Thêm', 'Sửa', 'Xoá', 'Đăng nhập'),
      },
      tableOfAction: {
        type: Sequelize.ENUM(
          'Hoá đơn',
          'Loại hàng',
          'Xuất hàng',
          'Nhập hàng',
          'Lô hàng',
          'Quản lý',
          'Sản phẩm',
          'Kệ hàng',
          'Nhà cung cấp',
          'Giảm giá'
        ),
      },
      nameInRow: {
        type: Sequelize.STRING(80),
      },
      affectedRowID: {
        type: Sequelize.BIGINT(20),
      },
    },
    {
      updatedAt: false,
      freezeTableName: true,
    }
  );

  return Logs;
};
