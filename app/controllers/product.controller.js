"use strict"
const common = require('../utils/common');
const db = require("../models");
const lang = require('../lang');
const Product = db.products;
const Op = db.Sequelize.Op;

// Create and Save a new product
exports.create = (req, res) => {
  // Validate request
  if (!req.body.title) {
    res.status(400).send(
      common.returnAPIData(400, false, 'Content can not be empty!', {})
      );
    return;
  }

  // Create a product
  const product = {
    title: req.body.title,
    description: req.body.description,
    published: req.body.published ? req.body.published : false
  };

  // Save product in the database
  Product.create(product)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send(
        common.returnAPIData(400, false, err.message || "Some error occurred while creating the product.", {})
        );
    });
};

// Retrieve all products from the database.
exports.findAll = (req, res) => {
  const name = req.query.name;
  var condition = name ? { name: { [Op.like]: `%${name}%` } } : null;

  Product.findAll({ where: condition })
    .then(data => {
      res.send(common.returnAPIData(200, true, 'Got all', data));
    })
    .catch(err => {
      res.status(500).send(
        common.returnAPIData(400, false, err.message || lang.products.errorWhenGetAll, {})
       );
    });
};

// Find a single product with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  Product.findByPk(id)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving product with id=" + id
      });
    });
};

// Update a product by the id in the request
exports.update = (req, res) => {
  const id = req.params.id;

  Product.update(req.body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Product was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update product with id=${id}. Maybe product was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating product with id=" + id
      });
    });
};

// Delete a product with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Product.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "product was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete product with id=${id}. Maybe product was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete product with id=" + id
      });
    });
};

// Delete all products from the database.
exports.deleteAll = (req, res) => {
  Product.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} products were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all products."
      });
    });
};

// find all published product
exports.findAllPublished = (req, res) => {
  Product.findAll({ where: { published: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving products."
      });
    });
};
