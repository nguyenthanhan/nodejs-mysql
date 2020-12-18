"use strict";
const common = require("../utils/common");
const db = require("../models/db");
const lang = require("../lang");
const {
  discount: Discount,
  productOnDiscount: ProductOnDiscount,
  product: Product,
  category: Category,
} = db;
const moment = require("moment");
const Op = db.Sequelize.Op;
const _ = require("lodash");

// Create and Save a new Discount
exports.create = async (req, res, next) => {
  console.log(req.body);
  // Validate request
  if (
    !req.body.rate ||
    !req.body.title ||
    !req.body.start_date ||
    !req.body.end_date ||
    !req.body.discountCode
  ) {
    next({
      status: 400,
      message: lang.general.error._400,
    });
    return;
  }

  if (!moment(req.body.end_date).isAfter(req.body.start_date)) {
    next({
      status: 400,
      message: "Ngày bắt đầu và kết thúc không đúng!",
    });
    return;
  }

  if (parseInt(req.body.rate) < 0 && parseInt(req.body.rate) >= 100) {
    next({
      status: 400,
      message: "NHập sai phần trăm giảm giá",
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
      discount_code: req.body.discountCode,
    };

    // Save discount in the database
    const createDiscount = await Discount.create(discount, { raw: true });
    console.log("createDiscount", createDiscount);

    if (createDiscount && createDiscount.discountId) {
      let applyProductsInCategories = [];

      //check if have applyCategories
      if (req.body.applyCategories && _.isArray(req.body.applyCategories)) {
        const arrayIds = req.body.applyCategories.map(
          (applyCategory) => applyCategory.categoryId
        );

        const categories = await Category.findAll({
          where: { CID: { [Op.or]: arrayIds } },
          include: [
            {
              model: Product,
              as: "products",
              attributes: ["PID"],
            },
          ],
        });
        console.log("categories", categories);
        const categoriesJSON = categories.map((el) => el.get({ plain: true }));

        categoriesJSON.forEach((category) => {
          const applyCategories = req.body.applyCategories.find(
            (applyCategory) => applyCategory.categoryId === category.CID
          );
          const separateProducts = category.products.map((product) => {
            return {
              productId: product.PID,
              requirementQuantity: applyCategories.requirementQuantity,
            };
          });
          applyProductsInCategories = [
            ...applyProductsInCategories,
            ...separateProducts,
          ];
        });

        applyProductsInCategories = applyProductsInCategories.map(
          (applyProductsInCategory) => {
            const index = _.findIndex(req.body.applyProducts, [
              "productId",
              applyProductsInCategory.productId,
            ]);
            if (index >= 0) {
              return req.body.applyProducts[index];
            }
            return applyProductsInCategory;
          }
        );
        console.log("applyProductsInCategories", applyProductsInCategories);
      } else {
        applyProductsInCategories = req.body.applyProducts;
        console.log(
          "applyProductsInCategories else ",
          applyProductsInCategories
        );
      }

      const newDiscountsWithProduct = await createDiscountsWithProduct(
        applyProductsInCategories,
        createDiscount.discountId
      );
      console.log("newDiscountsWithProduct", newDiscountsWithProduct);

      if (newDiscountsWithProduct) {
        res.send(common.returnAPIData({}, "Tạo mã giảm giá thành công"));
      }
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: "post",
      name: "giảm giá",
      id: 0,
    });
    return;
  }
};

const asyncCreateItemProductOnDiscount = (discountProduct, discountId) => {
  return ProductOnDiscount.create({
    productId: discountProduct.productId,
    requirementQuantity: discountProduct.requirementQuantity,
    discountId: discountId,
  });
};

const createDiscountsWithProduct = async (discountProducts, discountId) => {
  return Promise.all(
    discountProducts.map((discountProduct) =>
      asyncCreateItemProductOnDiscount(discountProduct, discountId)
    )
  );
};

exports.findAll = async (req, res, next) => {
  const discount_code = req.query.nameKeyword;
  const condition = discount_code
    ? { discount_code: { [Op.like]: `%${discount_code}%` } }
    : null;

  Discount.findAll({
    where: condition,
    include: [
      {
        model: Product,
        as: "products",
        attributes: ["PID", "name"],
      },
    ],
  })
    .then((data) => {
      const message = data.length === 0 ? "Không có mã giảm giá nào!" : "";
      res.send(common.returnAPIData(data, message));
      //TODO Auto delete
    })
    .catch((err) => {
      next({
        status: 400,
        message: err.message,
        method: "get",
        name: "phân loại hàng",
        id: 0,
      });
      return;
    });
};

exports.update = async (req, res, next) => {
  try {
    // Create a Discount
    const discount = {
      rate: parseInt(req.body.rate),
      title: req.body.title,
      description: req.body.description,
      start_date: moment(req.body.start_date),
      end_date: moment(req.body.end_date),
      discount_code: req.body.discountCode,
      updatedAt: moment(),
    };

    const discountId = req.params.id;

    // Update discount in the database
    const numbersUpdateOnDiscountTable = await Discount.update(discount, {
      where: { discountId: discountId },
      raw: true,
    });

    if (parseInt(numbersUpdateOnDiscountTable, 10) !== 0) {
      let applyProductsInCategories = [];

      //check if have applyCategories
      if (req.body.applyCategories && _.isArray(req.body.applyCategories)) {
        const arrayIds = req.body.applyCategories.map(
          (applyCategory) => applyCategory.categoryId
        );

        const categories = await Category.findAll({
          where: { CID: { [Op.or]: arrayIds } },
          include: [
            {
              model: Product,
              as: "products",
              attributes: ["PID"],
            },
          ],
        });
        const categoriesJSON = categories.map((el) => el.get({ plain: true }));

        categoriesJSON.forEach((category) => {
          const applyCategories = req.body.applyCategories.find(
            (applyCategory) => applyCategory.categoryId === category.CID
          );
          const separateProducts = category.products.map((product) => {
            return {
              productId: product.PID,
              requirementQuantity: applyCategories.requirementQuantity,
            };
          });
          applyProductsInCategories = [
            ...applyProductsInCategories,
            ...separateProducts,
          ];
        });

        applyProductsInCategories = applyProductsInCategories.map(
          (applyProductsInCategory) => {
            const index = _.findIndex(req.body.applyProducts, [
              "productId",
              applyProductsInCategory.productId,
            ]);
            if (index >= 0) {
              return req.body.applyProducts[index];
            }
            return applyProductsInCategory;
          }
        );
      } else {
        applyProductsInCategories = req.body.applyProducts;
      }

      const updateDiscountsWithProduct = await updateDiscountsWithProducts(
        applyProductsInCategories,
        discountId
      );
      console.log("updateDiscountsWithProduct", updateDiscountsWithProduct);
      let numberRowUpdated = 0;
      let numberRowNotUpdate = 0;
      console.log(typeof updateDiscountsWithProduct);

      updateDiscountsWithProduct.forEach((updateDiscounts) => {
        if (parseInt(updateDiscounts, 10) === 1) {
          numberRowUpdated = numberRowUpdated + 1;
        } else {
          numberRowNotUpdate = numberRowNotUpdate + 1;
        }
      });

      res.send(
        common.returnAPIData(
          { numberRowUpdated, numberRowNotUpdate },
          `Cập nhật mã sản phẩm giảm giá thành công`
        )
      );
    } else {
      next({
        status: 400,
        message: `Không thể cập nhật sản phẩm giảm giá này. Phân loại hàng không thể tìm thấy!`,
      });
      return;
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: "put",
      name: "sản phẩm giảm giá",
      id: req.params.id,
    });
    return;
  }
};

const asyncUpdateItemProductOnDiscount = async (
  discountProduct,
  discountId
) => {
  return ProductOnDiscount.update(
    {
      ...discountProduct,
      updatedAt: moment(),
    },
    {
      where: { discountId: discountId, productId: discountProduct.productId },
      silent: true,
    }
  );
};

const updateDiscountsWithProducts = async (discountProducts, discountId) => {
  return Promise.all(
    discountProducts.map((discountProduct) =>
      asyncUpdateItemProductOnDiscount(discountProduct, discountId)
    )
  );
};

exports.delete = async (req, res, next) => {
  try {
    const { arrayIds = [] } = req.body;

    const deleteProductOnDiscount = await ProductOnDiscount.destroy({
      where: { discountId: { [Op.or]: arrayIds } },
    });

    if (deleteProductOnDiscount) {
      const deletedCount = await Discount.destroy({
        where: { discountId: { [Op.or]: arrayIds } },
      });

      res.send(
        common.returnAPIData(
          { deletedCount: deletedCount },
          `${numberDelete} mã giảm giá đã bị xoá!`
        )
      );
    } else {
      common.returnAPIData({}, `Không có phiếu nhập bị xoá!`);
    }
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: "delete",
      name: "phân loại hàng",
      id: 0,
    });
    return;
  }
};

exports.deleteExpiresDiscount = async (arrayIds) => {
  try {
    const discounts = await Discount.findAll();
    console.log(discounts);
  } catch (error) {
    next({
      status: 400,
      message: error.message,
      method: "delete",
      name: "giảm giá",
      id: 0,
    });
    return;
  }
};
