const express = require("express");
var requireDirectory = require("require-directory"); // 引入 导出文件夹
const { jwtAuth } = require("../utils/jwt"); // 引入jwt认证函数
const router = express.Router(); // 注册路由
const dayjs = require("dayjs");
const path = require("path");
const fs = require("fs");

router.use(jwtAuth); // 注入认证模块

requireDirectory(module, `${process.cwd()}/routes`, {
	exclude: /index\.js$/, // 排除当前文件路由
	visit: (v) => {
		router.use("/api/v1", v);
	},
});

// 自定义统一异常处理中间件，需要放在代码最后
router.use((err, req, res, next) => {
	let err_object = {};

	if (err && err.name === "UnauthorizedError") {
		err_object = {
			code: 401,
			msg: "token已失效，请重新登录",
			data: null,
		};

		res.json(err_object);
	} else {
		err_object = {
			code: 400,
			msg: err,
		};

		res.json(err_object);

		console.log(err);
	}

	const { method, url, body } = req;

	fs.appendFileSync(
		path.resolve(__dirname, "../req.log"),
		`${method} : ${url} : ${JSON.stringify(body)} : ${dayjs().format(
			"YYYY-MM-DD HH:mm:ss"
		)} : ${JSON.stringify(err_object)} \n`
	);
});

module.exports = router;
