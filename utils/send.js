const { CODE_ERROR, CODE_SUCCESS } = require("./constant");
const dayjs = require("dayjs");
const path = require("path");
const fs = require("fs");

const ERROR = (res, msg) => {
  const { originalUrl, body } = res.req;

  fs.appendFileSync(
    path.resolve(__dirname, "../req.log"),
    ` ${originalUrl} : ${res.req.rawHeaders[1]} : ${JSON.stringify(
      body
    )} : ${dayjs().format(
      "YYYY-MM-DD HH:mm:ss"
    )}\n : {code: ${CODE_ERROR}, msg: ${msg || "error"}
    }`
  );

  return res.json({ code: CODE_ERROR, msg: msg || "error" });
};

const SUCCESS = (res, msg, list, param) => {
  return res.json({
    code: CODE_SUCCESS,
    msg: msg || "success",
    data: list,
    ...param,
  });
};

module.exports = {
  SUCCESS,
  ERROR,
};
