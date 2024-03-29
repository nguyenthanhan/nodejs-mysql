'use strict';
const lang = require('../lang');
var bcrypt = require('bcrypt');
const constants = require('../constants');
let faker = require('faker');

faker.locale = 'vi';

const lastName = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ'];
const middleName = ['Đăng', 'Quốc', 'Phúc', 'Đức', 'Ngọc', 'Phong', 'Văn', 'Vĩnh'];
const firstName = ['Quyền', 'Phục', 'Tuấn', 'Toàn', 'Hải', 'Hoàng', 'Tường', 'Duy'];

const randomFullName = () => {
  return `${faker.random.arrayElement(lastName)} ${faker.random.arrayElement(middleName)} ${faker.random.arrayElement(
    firstName
  )}`;
};

const randomLastName = () => {
  return `${faker.random.arrayElement(lastName)}`;
};

const randomName = () => {
  return `${faker.random.arrayElement(middleName)} ${faker.random.arrayElement(firstName)}`;
};

const admin = async () => {
  const hashPassword = await bcrypt.hash('password', constants.SALT_ROUNDS);
  return {
    FName: randomName(),
    LName: randomLastName(),
    accountName: 'admin',
    password: hashPassword,
    Address: '102 Thái Hà, Đống Đa',
    managerType: 'prime',
    BDay: '1980-01-01T00:01:00.000Z',
    email: 'heimer.nguyen@gmail.com',
    telephoneNumber: '(84-4) 5373367',
    avt_url: `${faker.image.imageUrl(300, 300)}`,
    salary: 12000000,
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
    img_url: `${faker.image.imageUrl(300, 300)}`,
  },
  {
    name: 'Đồ ăn nhanh',
    img_url: `${faker.image.imageUrl(300, 300)}`,
  },
  {
    name: 'Đồ ăn lạnh',
    img_url: `${faker.image.imageUrl(300, 300)}`,
  },
  {
    name: 'Thực phẩm khô',
    img_url: `${faker.image.imageUrl(300, 300)}`,
  },
  {
    name: 'Thực phẩm đóng hộp',
    img_url: `${faker.image.imageUrl(300, 300)}`,
  },
  {
    name: 'Gia vị',
    img_url: `${faker.image.imageUrl(300, 300)}`,
  },
  {
    name: 'Lương thực',
    img_url: `${faker.image.imageUrl(300, 300)}`,
  },
  {
    name: 'Rau củ',
    img_url: `${faker.image.imageUrl(300, 300)}`,
  },
  {
    name: 'Khăn giấy, giấy vệ sinh, tã em bé',
    img_url: `${faker.image.imageUrl(300, 300)}`,
  },
  { name: 'Hóa mỹ phẩm', img_url: `${faker.image.imageUrl(300, 300)}` },
  { name: 'Văn phòng phẩm', img_url: `${faker.image.imageUrl(300, 300)}` },
  { name: 'Đồ sinh hoạt cá nhân', img_url: `${faker.image.imageUrl(300, 300)}` },
  { name: 'Thẻ cào điện thoại', img_url: `${faker.image.imageUrl(300, 300)}` },
];

const suppliers = [
  {
    name: randomFullName(),
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
];

const products = [
  {
    name: 'Nước khoáng LaVie',
    description: `Sinh ra từ thiên nhiên\nHoàn thiện ở mạch nước ngầm thuần khiết. \nĐược chặt chắt lọc qua những tầng địa chất \nHấp thụ khoáng chất \nTrở thành nước khoáng thiên nhiên \nVị thiên nhiên trong lành thanh khiết\n\nLà nhãn hiệu nước khoáng số 1 Việt Nam, LaVie là là sự kết hợp tuyệt vời giữa nguồn nước thiên nhiên trong lành với 06 loại khoáng thiên nhiên, có vai trò rất quan trọng cho hoạt động của cơ thể. \n\n* Theo nghiên cứu đo lường bán lẻ  của công ty nghiên cứu Nielsen\n`,
    otherDetail: 'HSD: 12 tháng kể từ ngày sản xuất\n',
    img_url: 'https://lavieviva.vn/wp-content/uploads/2018/09/Nuoc-Lavie-750ml-nap-the-thao-1.png',
    W_max_qtt: 150,
    W_min_qtt: 50,
    S_max_qtt: 50,
    S_min_qtt: 10,
    vat: 10,
    brand: 'La Vie',
    categoryId: 1,
    sell_price: 10000,
    unit_name: 'chai',
    notice_days: 10,
  },

  {
    name: 'Bánh tiêu',
    description: `Bánh tiêu nhà làm\nBổ dưỡng, thơm ngon, hợp với mọi người\n`,
    otherDetail: 'HSD: 2 ngày kể từ ngày sản xuất\n',
    img_url: 'https://cdn.daylambanh.edu.vn/wp-content/uploads/2019/01/banh-tieu-thom-ngon-600x400.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Không có',
    categoryId: 2,
    sell_price: 5000,
    unit_name: 'cái',
    notice_days: 2,
  },
  {
    name: 'Kem',
    description: `Kem nhà làm\nBổ dưỡng, thơm ngon, hợp với mọi người\n`,
    otherDetail: 'HSD: 7 ngày bảo quản lạnh kể từ ngày sản xuất\n',
    img_url: 'https://toplist.vn/images/800px/kem-fanny-491395.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Không có',
    categoryId: 3,
    sell_price: 34000,
    unit_name: 'hộp',
    notice_days: 2,
  },
  {
    name: 'Mít sấy',
    description: `Mít sấy chính gốc Đà Lạt, hàng loại A đặt chuẩn xuất khẩu đẹp mắt và cực ngon.\nTuyển lựa từ những trái cây tươi ngon, hàng loại 1.\nVới công nghệ sấy tiên tiến, luôn giữ được vị trái cây thơm ngon.\nAn toàn vệ sinh thực phẩm\nTrái cây sấy giàu Vitamin , chất xơ cho cơ thể khoẻ mạnh.\n`,
    otherDetail: 'HSD: 3 tháng kể từ ngày sản xuất\n',
    img_url: 'https://tuemanshop.com/wp-content/uploads/2019/05/mitsay-1.jpg',
    W_max_qtt: 25,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Không có',
    categoryId: 4,
    sell_price: 20000,
    unit_name: 'bịch',
    notice_days: 10,
  },
  {
    name: 'Ngũ cốc ăn kiêng Natural Granola',
    description: `#100% nguyên liệu thiên nhiên cao cấp\n#Ít kcal\n#Chỉ chứa ngũ cốc nguyên hạt, không lên men\n#Cung cấp hàm lượng chất xơ cao, tốt cho hệ tiêu hóa\n#Hỗ trợ các vấn đề về sức khỏe như tim mạch, ổn định lượng đường, giảm cholesterol\n #Phù hợp với các chế độ ăn kiêng, ăn chay, eat clean, tập gym.\n`,
    otherDetail: 'HSD: 12 tháng kể từ ngày sản xuất\n',
    img_url: 'https://blog.beemart.vn/wp-content/uploads/2019/05/cach-lam-granola-thuc-duong.jpg',
    W_max_qtt: 150,
    W_min_qtt: 50,
    S_max_qtt: 50,
    S_min_qtt: 10,
    vat: 10,
    brand: 'Không có',
    categoryId: 5,
    sell_price: 10000,
    unit_name: 'hộp',
    notice_days: 10,
  },
  {
    name: 'Đường',
    description: `Cần thiết cho mọi người\n`,
    otherDetail: 'HSD: 3 tháng kể từ ngày sản xuất\n',
    img_url:
      'https://cdn.tgdd.vn/Files/2019/10/24/1211885/duong-tinh-luyen-la-gi-co-nen-su-dung-duong-tinh-luyen-hay-khong-201910241522445701.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Không có',
    categoryId: 6,
    sell_price: 10000,
    unit_name: 'bịch',
    notice_days: 5,
  },
  {
    name: 'Gạo Khang Dân nguyên chất',
    description: `Gạo Khang Dân nguyên chất đạt tiêu chuẩn gạo xuất khẩu. Gạo có đặc tính là nấu cơm rất nở, hạt cơm đậm vị, hương vị tự nhiên, thơm ngon.\nGạo Khang Dân được trồng phổ biến ở các tỉnh như Hải Dương, Hà Tây, Ninh Bình, Bắc giang, Bắc Ninh...\nGạo có tỉ lệ tấm 5%, độ ẩm dưới 15% nên bảo quản được rất lâu.\n`,
    otherDetail: 'HSD: 12 tháng kể từ ngày sản xuất\n',
    img_url: 'https://meta.vn/Data/image/2020/03/31/gao-khang-dan-nguyen-chat-10kg-t.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Khang Dân',
    categoryId: 7,
    sell_price: 50000,
    unit_name: 'bịch',
    notice_days: 20,
  },
  {
    name: 'Rau xà lách',
    description: `Rau sạch tươi ngon`,
    otherDetail: '',
    img_url:
      'https://orfarm.com.vn/images/products/2018/03/07/large/orfarm-xa-lach-lolo-global-gap_1498321462_1520447848.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 5,
    brand: 'Không có',
    categoryId: 8,
    sell_price: 5000,
    unit_name: 'bịch',
    notice_days: 2,
  },
  {
    name: 'Giấy lụa bỏ túi Pulppy',
    description: `Được sản xuất từ 100% bột giấy nguyên chất.\nThiết kế nhỏ gọn, bỏ túi tiện lợi`,
    otherDetail: '',
    img_url:
      'https://product.hstatic.net/1000126467/product/mpact-10-goi-1516786810-28644912-1d6183f337c7463c623a2b7675a23587-zoom.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Pulppy',
    categoryId: 9,
    sell_price: 20000,
    unit_name: 'bịch',
    notice_days: 1,
  },
  {
    name: 'Bột trà xanh',
    description: `Được sản xuất từ những lá trà xanh chất lượng nhất từ các vùng trồng trà xanh nổi tiếng của Việt Nam, Bột Trà Xanh  là lựa chọn hoàn hảo, mang đến cho bạn làn da tươi mới, đẩy lùi nỗi lo về mụn và sẹo mụn.`,
    otherDetail: 'HSD : 1 năm kể từ ngày sản xuất',
    img_url:
      'https://anvat365.s3.amazonaws.com/2019/03/12/16/17/11/2dae9878-f530-491f-aa76-8bb77a3db17a/cach-lam-bot-tra-xanhbia.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Không có',
    categoryId: 10,
    sell_price: 50000,
    unit_name: 'bịch',
    notice_days: 10,
  },
  {
    name: 'Bút Mực Sao Thiên',
    description: `Bút mực sao thiên trở lại với dòng ngòi kim tinh êm trơn,với phần đầu ngòi êm trơn tạo cảm giác viết êm trơn viết nhanh phù hợp cho học sinh viết bài,người lớn viết văn bản nhanh.`,
    otherDetail: '',
    img_url: 'https://media3.scdn.vn/img3/2019/4_12/AboSSJ_simg_de2fe0_500x500_maxb.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Sao Thiên',
    categoryId: 11,
    sell_price: 5000,
    unit_name: 'cây',
    notice_days: 5,
  },
  {
    name: 'Bàn chải đánh răng DOCTOR.B XIAOMI',
    description: `Bàn chải đánh răng  là một sản phẩm bàn chải đánh răng, chăm sóc răng miệng và không phải là một sản phẩm công nghệ cao. Tuy nhiên chiếc bàn chải này lại hội tụ rất nhiều công nghệ cao cấp, giúp bảo vệ và chăm sóc sức khỏe răng miệng của người dùng tốt nhất.`,
    otherDetail: '',
    img_url: 'https://chiemtaimobile.vn/images/thumbnails/500/500/detailed/15/ban-chai-danh-rang-xiaomi__1_.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Xiaomi',
    categoryId: 12,
    sell_price: 25000,
    unit_name: 'cái',
    notice_days: 1,
  },
  {
    name: 'Thẻ điện thoại Viettel, Vina, Mobile 20k',
    description: `Nạp cho điện thoại trả trước`,
    otherDetail: 'Hạn sử dụng ghi trên thẻ',
    img_url: 'https://banthe247.com/upload/files/cac-menh-gia-mua-the-dien-thoai-tai-banthe247.jpg',
    W_max_qtt: 15,
    W_min_qtt: 5,
    S_max_qtt: 10,
    S_min_qtt: 2,
    vat: 10,
    brand: 'Không có',
    categoryId: 13,
    sell_price: 20000,
    unit_name: 'thẻ',
    notice_days: 20,
  },
];

module.exports = {
  products,
  admin,
  suppliers,
  shelves,
  categories,
  categoriesShelves,
};
