const EXPIRES_TIME_OF_TOKEN = 86400; // 24 hours
const SALT_ROUNDS = 10;
const { html } = require('./htmlTemplate');

const Table = {
  PRODUCT: 'Sản phẩm',
  BILL: 'Hoá đơn',
  CATEGORY: 'Loại hàng',
  EXPORT: 'Xuất hàng',
  IMPORT: 'Nhập hàng',
  LOT: 'Lô hàng',
  MANAGER: 'Quản lý',
  SHELF: 'Kệ hàng',
  SUPPLIER: 'Nhà cung cấp',
  DISCOUNT: 'Giảm giá',
};

const ActionOnTable = {
  ADD: 'Thêm',
  DELETE: 'Xoá',
  EDIT: 'Sửa',
  LOGIN: 'Đăng nhập',
};

module.exports = {
  EXPIRES_TIME_OF_TOKEN,
  Table,
  ActionOnTable,
  SALT_ROUNDS,
  htmlTemplate: html,
};
