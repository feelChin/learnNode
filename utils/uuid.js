const { customAlphabet } = require("nanoid");

const uuid = () => {
  return customAlphabet("0123456789", 11)();
};

module.exports = uuid;
