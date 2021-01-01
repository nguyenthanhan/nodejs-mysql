'use strict';
const common = require('../utils/common');
const db = require('../models/db');
const lang = require('../lang');
const { discount: Discount, productOnDiscount: ProductOnDiscount, product: Product, category: Category } = db;
const moment = require('moment');
const Op = db.Sequelize.Op;
const _ = require('lodash');
const LogController = require('./log.controller');
const { Table, ActionOnTable } = require('../constants');

// Create and Save a new Discount
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (!req.body.rate || !req.body.title || !req.body.start_date || !req.body.end_date) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  if (!moment(req.body.end_date).isAfter(req.body.start_date)) {
    next({
      status: 400,
      message: 'Ngày bắt đầu và kết thúc không đúng!',
    });
    return;
  }

  if (parseInt(req.body.rate) < 0 && parseInt(req.body.rate) >= 100) {
    next({
      status: 400,
      message: 'NHập sai phần trăm giảm giá',
    });
    return;
  }

  try {
    // Create a Discount
    const discount = {
      rate: req.body.rate,
      title: req.body.title,
      description: req.body.description,
      start_date: moment(req.body.start_date),
      end_date: moment(req.body.end_date),
    };

    // Save discount in the database
    const _createDiscount = await Discount.create(discount, { raw: true });
    const createDiscount = _createDiscount.get({ plain: true });

    if (createDiscount && createDiscount.discountId) {
      // let applyProductsInCategories = [];

      //check if have applyCategories
      // if (req.body.applyCategories && _.isArray(req.body.applyCategories)) {
      // const arrayIds = req.body.applyCategories.map(applyCategory => applyCategory.categoryId);

      // const categories = await Category.findAll({
      //   where: { CID: { [Op.or]: arrayIds } },
      //   include: [
      //     {
      //       model: Product,
      //       as: 'products',
      //       attributes: ['PID'],
      //     },
      //   ],
      // });
      // console.log('categories', categories);
      // const categoriesJSON = categories.map(el => el.get({ plain: true }));

      // categoriesJSON.forEach(category => {
      //   const applyCategories = req.body.applyCategories.find(
      //     applyCategory => applyCategory.categoryId === category.CID
      //   );
      //   const separateProducts = category.products.map(product => {
      //     return {
      //       productId: product.PID,
      //       requirementQuantity: applyCategories.requirementQuantity,
      //     };
      //   });
      //   applyProductsInCategories = [...applyProductsInCategories, ...separateProducts];
      // });

      // applyProductsInCategories = applyProductsInCategories.map(applyProductsInCategory => {
      //   const index = _.findIndex(req.body.applyProducts, ['productId', applyProductsInCategory.productId]);
      //   if (index >= 0) {
      //     return req.body.applyProducts[index];
      //   }
      //   return applyProductsInCategory;
      // });
      //   console.log('applyProductsInCategories', applyProductsInCategories);
      // } else {
      //   applyProductsInCategories = req.body.applyProducts;
      //   console.log('applyProductsInCategories else ', applyProductsInCategories);
      // }

      // const discountsWithProduct = await createDiscountsWithProduct(
      //   applyProductsInCategories,
      //   createDiscount.discountId
      // );

      // console.log('newDiscountsWithProduct', discountsWithProduct);

      let applyDiscountToProductCount = 0;
      if (_.isArray(req.body.productIds)) {
        const applyDiscount = await Promise.all(
          req.body.productIds.map(async productId => {
            const result = await Product.update(
              { discountId: createDiscount.discountId },
              {
                where: {
                  PID: parseInt(productId),
                },
              }
            );
            return parseInt(result);
          })
        );
        applyDiscountToProductCount = applyDiscount.reduce((sum, bool) => (bool ? sum + 1 : sum), 0);
      }

      res.send(common.returnAPIData({ ...createDiscount, applyDiscountToProductCount }, 'Tạo mã giảm giá thành công'));

      LogController.createLog({
        MngID: req.userId,
        action: ActionOnTable.ADD,
        tableOfAction: Table.DISCOUNT,
        affectedRowID: createDiscount.discountId,
        nameInRow: createDiscount.title,
      });
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'post',
      name: 'giảm giá',
      id: 0,
    });
    return;
  }
};

// const createDiscountsWithProduct = async (discountProducts, discountId) => {
//   const newDiscountProducts = discountProducts.map(discountProduct => {
//     return {
//       productId: discountProduct.productId,
//       requirementQuantity: discountProduct.requirementQuantity,
//       discountId: discountId,
//     };
//   });
//   return ProductOnDiscount.bulkCreate(newDiscountProducts);
// };

exports.findAll = async (req, res, next) => {
  try {
    const title = req.query.nameKeyword;
    const condition = title ? { title: { [Op.like]: `%${title}%` } } : null;

    const _data = await Discount.findAll({
      where: condition,
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['PID'],
        },
      ],
    });
    const data = _data.map(el => el.get({ plain: true }));
    const message = data.length === 0 ? 'Không có mã giảm giá nào!' : '';
    const newData = data.map(eachData => ({
      ...eachData,
      productIds: eachData.products ? eachData.products.map(object => parseInt(object.PID)) : undefined,
      products: undefined,
    }));
    console.log(newData);

    res.send(common.returnAPIData(newData, message));
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'get',
      name: 'phân ngành hàng',
      id: 0,
    });
    return;
  }
};

exports.findOne = async (req, res, next) => {
  const id = req.params.id;

  try {
    const _data = await Discount.findByPk(id, {
      attributes: { exclude: ['deletedAt'] },
      include: [
        {
          model: Product,
          as: 'products',
          attributes: ['PID'],
        },
      ],
    });

    if (_data) {
      const data = _data.get({ plain: true });

      const newData = {
        ...data,
        productIds: data.products ? data.products.map(object => parseInt(object.PID)) : undefined,
        products: undefined,
      };

      res.send(common.returnAPIData(newData));
    } else {
      next({
        status: 400,
        message: 'Không tìm thấy mã giảm giá này',
      });
      return;
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'get',
      name: 'phân ngành hàng',
      id: req.params.id,
    });
    return;
  }
};

exports.update = async (req, res, next) => {
  try {
    // Create a Discount
    const discount = {
      rate: req.body.rate ? parseInt(req.body.rate) : undefined,
      title: req.body.title || undefined,
      description: req.body.description || undefined,
      start_date: moment(req.body.start_date) || undefined,
      end_date: moment(req.body.end_date) || undefined,
      updatedAt: moment(),
    };

    const discountId = req.params.id;

    // Update discount in the database
    const numbersUpdateOnDiscountTable = await Discount.update(discount, {
      where: { discountId: discountId },
      raw: true,
    });

    if (parseInt(numbersUpdateOnDiscountTable) === 1) {
      // let applyProductsInCategories = [];

      // //check if have applyCategories
      // if (req.body.applyCategories && _.isArray(req.body.applyCategories)) {
      //   const arrayIds = req.body.applyCategories.map(applyCategory => applyCategory.categoryId);

      //   const categories = await Category.findAll({
      //     where: { CID: { [Op.or]: arrayIds } },
      //     include: [
      //       {
      //         model: Product,
      //         as: 'products',
      //         attributes: ['PID'],
      //       },
      //     ],
      //   });
      //   const categoriesJSON = categories.map(el => el.get({ plain: true }));

      //   categoriesJSON.forEach(category => {
      //     const applyCategories = req.body.applyCategories.find(
      //       applyCategory => applyCategory.categoryId === category.CID
      //     );
      //     const separateProducts = category.products.map(product => {
      //       return {
      //         productId: product.PID,
      //         requirementQuantity: applyCategories.requirementQuantity,
      //       };
      //     });
      //     applyProductsInCategories = [...applyProductsInCategories, ...separateProducts];
      //   });

      //   applyProductsInCategories = applyProductsInCategories.map(applyProductsInCategory => {
      //     const index = _.findIndex(req.body.applyProducts, ['productId', applyProductsInCategory.productId]);
      //     if (index >= 0) {
      //       return req.body.applyProducts[index];
      //     }
      //     return applyProductsInCategory;
      //   });
      // } else {
      //   applyProductsInCategories = req.body.applyProducts;
      // }

      // const updateDiscountsWithProduct = await updateDiscountsWithProducts(applyProductsInCategories, discountId);
      let deletedCount = 0;
      let addedCount = 0;
      if (_.isArray(req.body.productIds)) {
        const _oldProduct = await Product.findAll({ where: { discountId: discountId } });
        const oldProductId = _oldProduct.map(el => el.get({ plain: true })).map(product => product.PID);
        const newProductIds = _.uniq(req.body.productIds.map(id => parseInt(id)));

        const unionTwoArrays = _.union(oldProductId, newProductIds);
        const wantAddProductIds = _.difference(unionTwoArrays, oldProductId);
        const wantDeleteProductIds = _.difference(unionTwoArrays, newProductIds);

        const _deleteCount = await Product.update(
          { discountId: null },
          { where: { PID: { [Op.or]: wantDeleteProductIds } } }
        );

        const _addCount = await Product.update(
          { discountId: req.params.id },
          { where: { PID: { [Op.or]: wantAddProductIds } } }
        );

        deletedCount = parseInt(_deleteCount);
        addedCount = parseInt(_addCount);
      }

      res.send(common.returnAPIData({ deletedCount, addedCount }, `Cập nhật mã sản phẩm giảm giá thành công`));

      Discount.findByPk(req.params.id, { raw: true }).then(data => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.EDIT,
          tableOfAction: Table.DISCOUNT,
          affectedRowID: data.discountId,
          nameInRow: data.title,
        });
      });
    } else {
      next({
        status: 400,
        message: `Không thể cập nhật sản phẩm giảm giá này. Phân ngành hàng không thể tìm thấy!`,
      });
      return;
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'put',
      name: 'sản phẩm giảm giá',
      id: req.params.id,
    });
    return;
  }
};

// const asyncUpdateItemProductOnDiscount = async (discountProduct, discountId) => {
//   return ProductOnDiscount.update(
//     {
//       ...discountProduct,
//       updatedAt: moment(),
//     },
//     {
//       where: { discountId: discountId, productId: discountProduct.productId },
//       silent: true,
//     }
//   );
// };

// const updateDiscountsWithProducts = async (discountProducts, discountId) => {
//   return Promise.all(
//     discountProducts.map(discountProduct => asyncUpdateItemProductOnDiscount(discountProduct, discountId))
//   );
// };

exports.delete = async (req, res, next) => {
  console.log(req.body);
  try {
    const { arrayIds = [] } = req.body;

    const deletedCount = await Discount.destroy({
      where: { discountId: { [Op.or]: arrayIds } },
    });

    res.send(common.returnAPIData({ deletedCount: deletedCount }, `${deletedCount} mã giảm giá đã bị xoá!`));

    Discount.findAll({
      where: { discountId: { [Op.or]: arrayIds } },
      raw: true,
      paranoid: false,
    }).then(data => {
      data.forEach(item => {
        LogController.createLog({
          MngID: req.userId,
          action: ActionOnTable.DELETE,
          tableOfAction: Table.DISCOUNT,
          affectedRowID: item.discountId,
          nameInRow: item.title,
        });
      });
    });
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: 'delete',
      name: 'phân ngành hàng',
      id: 0,
    });
    return;
  }
};

// exports.deleteExpiresDiscount = async arrayIds => {
//   try {
//     const discounts = await Discount.findAll();
//     console.log(discounts);
//   } catch (error) {
//     next({
//       status: 400,
//       message: error.message,
//       method: 'delete',
//       name: 'giảm giá',
//       id: 0,
//     });
//     return;
//   }
// };
