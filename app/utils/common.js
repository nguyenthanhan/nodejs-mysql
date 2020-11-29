"use strict"

const returnAPIData = (status, success, message, data) => {
  return { status, success, message, data };
};

module.exports = {
  returnAPIData
}