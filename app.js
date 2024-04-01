const bodyParser = require("body-parser"); // 引入body-parser模块
const express = require("express"); // 引入express模块
const cors = require("cors"); // 引入cors模块
const routes = require("./routes"); //导入自定义路由文件，创建模块化路由
const dayjs = require("dayjs");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(bodyParser.json({ limit: "1mb" })); // 解析json数据格式  大小最多1M
app.use(bodyParser.urlencoded({ extended: true })); // 解析form表单提交的数据application/x-www-form-urlencoded
app.use(cors()); // 注入cors模块解决跨域

app.use((req, res, next) => {
	const { url, method, ip } = req;

	fs.appendFileSync(
		path.resolve(__dirname, "./req.log"),
		`${method} : ${url}: ${ip} : ${dayjs().format("YYYY-MM-DD HH:mm:ss")}\n`
	);

	next();
});

app.use(routes);

app.listen(4500, () => {
	// 监听4500端口
	console.log("服务已启动 http://localhost:4500");
});
