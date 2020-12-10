const EXPIRES_TIME_OF_TOKEN = 86400; // 24 hours

const Table = {
  PRODUCT: "Sản phẩm",
  BILL: "Hoá đơn",
  CATEGORY: "Loại hàng",
  EXPORT: "Xuất hàng",
  IMPORT: "Nhập hàng",
  LOT: "Lô hàng",
  MANAGER: "Quản lý",
  PRODUCT: "Sản phẩm",
  SHELF: "Kệ hàng",
  SUPPLIER: "Nhà cung cấp",
};

const ActionOnTable = {
  ADD: "Thêm",
  DELETE: "Xoá",
  EDIT: "Sửa",
};

module.exports = {
  EXPIRES_TIME_OF_TOKEN,
  Table,
  ActionOnTable,
};
