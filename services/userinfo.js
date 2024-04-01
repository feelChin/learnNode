const md5 = require("../utils/md5");
const jwt = require("jsonwebtoken");
const { PRIVATE_KEY, JWT_EXPIRED } = require("../utils/constant");
const { SUCCESS } = require("../utils/send");
const { decode } = require("../utils/jwt");
const db = require("../db");
const dayjs = require("dayjs");
const { queryUserAuthMenu } = require("../components");

const sign = (req, res, next) => {
	let { account, password } = req.body;

	account = db.escape(account);
	password = md5(password);
	password = db.escape(password);

	const now = db.escape(dayjs().format("YYYY-MM-DD HH:mm:ss"));

	const sql = async () => {
		try {
			const findUser = await db.query(
				"learn",
				`select * from user_info where account=${account} and password=${password}`
			);

			if (!!findUser.length) {
				const { user_id, status } = findUser[0];

				if (!status) {
					next("您已被禁用");
					return;
				}

				const token = jwt.sign(
					{
						user_id,
					},
					PRIVATE_KEY,
					{
						expiresIn: JWT_EXPIRED,
					}
				);

				await db.query(
					"learn",
					`update user_info set last_login_time=${now} where user_id=${user_id}`
				);

				return SUCCESS(res, "登录成功", token);
			} else {
				next("用户名或密码错误");
			}
		} catch (err) {
			next("用户名或密码错误");
		}
	};

	sql();
};

const queryUserInfo = (req, res) => {
	let { user_id } = decode(req.headers.token);

	user_id = db.escape(user_id);

	const sql = async () => {
		try {
			const findUser = await db.query(
				"learn",
				`select * from user_info where user_id=${user_id}`
			);

			if (!!findUser.length) {
				const { user_id, name, account } = findUser[0];

				let user_info = {
					id: user_id,
					user_name: name,
					user_account: account,
				};

				const token = jwt.sign(
					{
						user_id,
					},
					PRIVATE_KEY,
					{
						expiresIn: JWT_EXPIRED,
					}
				);

				return SUCCESS(res, "查询成功", {
					...user_info,
					token,
				});
			}
		} catch (err) {
			next("查询失败");
		}
	};

	sql();
};

const updateUserInfo = (req, res, next) => {
	let { name, password } = req.body;
	let { user_id } = decode(req.headers.token);

	if (!req.body || !name || !password) {
		next("字段缺失");
	}

	user_id = db.escape(user_id);
	name = db.escape(name);
	password = md5(password);
	password = db.escape(password);

	const sql = async () => {
		try {
			await queryUserAuthMenu(user_id, 10003, false);

			await db.query(
				"learn",
				`update user_info set name=${name},password=${password},update_time="${dayjs().format(
					"YYYY-MM-DD HH:mm:ss"
				)}" where user_id=${user_id}`
			);

			return SUCCESS(res, "保存成功");
		} catch (err) {
			next(err);
		}
	};

	sql();
};

module.exports = {
	queryUserInfo,
	updateUserInfo,
	sign,
};
