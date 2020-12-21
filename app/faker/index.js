'use strict';
const lang = require('../lang');
var bcrypt = require('bcrypt');
const constants = require('../constants');

const admin = async () => {
  const hashPassword = await bcrypt.hash('password', constants.SALT_ROUNDS);
  return {
    FName: 'Admin',
    LName: '',
    accountName: 'admin',
    password: hashPassword,
    Address: '102 Thái Hà, Đống Đa',
    managerType: 'prime',
    BDay: '1980-01-01T00:01:00.000Z',
    email: 'dtitab109@leavr.com',
    telephoneNumber: '(84-4) 5373367',
  };
};

const shelves = [
  {
    name: 'Kệ-1',
    type: 'small',
    state: 'available',
    location: 'warehouse',
  },
  {
    name: 'Kệ-2',
    type: 'small',
    state: 'available',
    location: 'store',
  },
];

const categories = [
  {
    name: 'Đồ uống',
  },
  {
    name: 'Đồ ăn nhanh',
  },
  {
    name: 'Đồ ăn lạnh',
  },
  {
    name: 'Thực phẩm khô',
  },
  {
    name: 'Thực phẩm đóng hộp',
  },
  {
    name: 'Gia vị',
  },
  {
    name: 'Lương thực',
  },
  {
    name: 'Lương thực',
  },
  {
    name: 'Rau củ',
  },
  {
    name: 'Khăn giấy, giấy vệ sinh, tã em bé',
  },
  { name: 'Hóa mỹ phẩm' },
  { name: 'Văn phòng phẩm' },
  { name: 'Đồ sinh hoạt cá nhân' },
  { name: 'Thẻ cào điện thoại' },
];

const suppliers = [
  {
    name: 'Mâu Hoàn Thục',
    Address: '0875 Phố Chử, Xã 6, Huyện Linh Đới Thái Bình',
    Tax_ID: 48883106,
    Email: 'Cara61@yahoo.com',
    telephoneNumber: '781-236-9194',
  },
];

const categoriesShelves = [
  { shelfId: 1, categoryId: 1 },
  { shelfId: 1, categoryId: 2 },
  { shelfId: 1, categoryId: 3 },
  { shelfId: 1, categoryId: 4 },
  { shelfId: 1, categoryId: 5 },
  { shelfId: 1, categoryId: 6 },
  { shelfId: 1, categoryId: 7 },
  { shelfId: 1, categoryId: 8 },
  { shelfId: 1, categoryId: 9 },
  { shelfId: 1, categoryId: 10 },
  { shelfId: 1, categoryId: 11 },
  { shelfId: 1, categoryId: 12 },
  { shelfId: 1, categoryId: 13 },
  { shelfId: 1, categoryId: 14 },
  { shelfId: 2, categoryId: 1 },
  { shelfId: 2, categoryId: 2 },
  { shelfId: 2, categoryId: 3 },
  { shelfId: 2, categoryId: 4 },
  { shelfId: 2, categoryId: 5 },
  { shelfId: 2, categoryId: 6 },
  { shelfId: 2, categoryId: 7 },
  { shelfId: 2, categoryId: 8 },
  { shelfId: 2, categoryId: 9 },
  { shelfId: 2, categoryId: 10 },
  { shelfId: 2, categoryId: 11 },
  { shelfId: 2, categoryId: 12 },
  { shelfId: 2, categoryId: 13 },
  { shelfId: 2, categoryId: 14 },
];

module.exports = {
  admin,
  suppliers,
  shelves,
  categories,
  categoriesShelves,
};
