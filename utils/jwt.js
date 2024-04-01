const jwt = require("jsonwebtoken"); // 引入验证jsonwebtoken模块
const { expressjwt } = require("express-jwt"); // 引入express-jwt模块
const { PRIVATE_KEY } = require("./constant"); // 引入自定义的jwt密钥

const jwtAuth = expressjwt({
  // 设置密钥
  secret: PRIVATE_KEY,
  // 设置为true表示校验，false表示不校验
  credentialsRequired: true,
  algorithms: ["HS256"],
  // 自定义获取token的函数
  getToken: (req) => {
    if (req.headers.token) {
      return req.headers.token;
    }
  },
  // 设置jwt认证白名单，比如/api/login登录接口不需要拦截
}).unless({
  path: ["/api/v1/register", "/api/v1/sign"],
});

// jwt-token解析
function decode(token) {
  return jwt.verify(token, PRIVATE_KEY);
}

module.exports = {
  jwtAuth,
  decode,
};
