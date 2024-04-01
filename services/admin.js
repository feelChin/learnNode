const { SUCCESS } = require("../utils/send");
const { decode } = require("../utils/jwt");
const db = require("../db");
const uuid = require("../utils/uuid");
const dayjs = require("dayjs");
const md5 = require("../utils/md5");
const { escape } = require("mysql");
const { queryUserAuthMenu } = require("../components");

const queryRoute = (req, res, next) => {
	let { user_id } = decode(req.headers.token);

	const sql = async () => {
		try {
			const { ISADMIN, MENUAUTH } = await queryUserAuthMenu(
				user_id,
				null,
				null
			);

			const fildResult = await db.query("learn", `select * from admin_router`);

			const findList = fildResult.reduce((prev, item) => {
				if (item.is_admin) {
					if (ISADMIN) {
						prev.push(item.name);
					}
				} else {
					prev.push(item.name);
				}

				return prev;
			}, []);

			return SUCCESS(res, "查询成功", {
				router: findList,
				menus: MENUAUTH,
			});
		} catch (err) {
			next(err);
		}
	};

	sql();
};

const queryAllMenu = (req, res, next) => {
	const sql = async () => {
		try {
			const fildResult = await db.query("learn", `select * from admin_menu`);

			const result = fildResult.map(({ id, parent_name, name }) => {
				return {
					id,
					name,
					title: parent_name,
				};
			});

			return SUCCESS(res, "查询成功", result);
		} catch (err) {
			next(err);
		}
	};

	sql();
};

const queryAdminList = (req, res, next) => {
	let {
		page,
		page_size,
		keyword = "",
		start_time = "",
		end_time = "",
	} = req.body;

	if (!req.body || !page || !page_size) {
		next("字段缺失");
		return;
	}

	page = Number(page);
	page_size = Number(page_size);

	const start_index = (page - 1) * page_size;

	const renderIfWhere = () => {
		let isWhere = false;
		let text = "";

		if (keyword) {
			keyword = escape(`%${keyword}%`);

			text += `name LIKE ${keyword} OR  account LIKE ${keyword}`;
			isWhere = true;
		}

		if (start_time && end_time) {
			start_time = escape(start_time);
			end_time = escape(end_time);

			text += `${
				isWhere ? "and" : ""
			} last_login_time >= ${start_time} and last_login_time <= ${end_time}`;

			isWhere = true;
		}

		return isWhere ? `where ${text}` : "";
	};

	const where = renderIfWhere();

	const sql = async () => {
		try {
			const [fildCount] = await db.query(
				"learn",
				`select count(*) from user_info ${where}`
			);

			const fildResult = await db.query(
				"learn",
				`select * from user_info ${where} limit ${start_index},${page_size}`
			);

			const findList = fildResult.map(
				({ last_login_time, status, admin, name, account }) => {
					return {
						name,
						account,
						admin,
						status,
						last_login_time: dayjs(last_login_time).format(
							"YYYY-MM-DD HH:mm:ss"
						),
					};
				}
			);

			return SUCCESS(res, "查询成功", findList, {
				total: fildCount["count(*)"],
			});
		} catch {
			next("查询失败");
		}
	};

	sql();
};

const registerAdmin = (req, res, next) => {
	let { name, account, password, is_admin = 0, menu_auth = [] } = req.body;

	let { user_id } = decode(req.headers.token);

	if (!req.body || !name || !account || !password) {
		next("字段缺失");
		return;
	}

	if (password.length < 6) {
		next("密码长度必须至少为6个字符");
		return;
	}

	if (!Array.isArray(menu_auth)) {
		next("menu_auth不是array");
		return;
	}

	if (typeof is_admin !== "number") {
		next("is_admin不是number");
		return;
	}

	let retryCount = 0;

	name = escape(name);
	account = escape(account);
	password = md5(password);
	password = escape(password);
	is_admin = escape(is_admin);
	menu_auth = escape(menu_auth);
	user_id = escape(user_id);

	const sql = async () => {
		try {
			await queryUserAuthMenu(user_id, 10000);

			const findUser = await db.query(
				"learn",
				`select id, account from user_info where account=${account}`
			);

			if (!!findUser.length) {
				next("用户已存在");
				return;
			}

			const user_uuid = uuid();
			const now = db.escape(dayjs().format("YYYY-MM-DD HH:mm:ss"));

			await db.query(
				"learn",
				`INSERT INTO user_info(id,user_id,name,account,password,admin,menus,status,last_login_time,create_time) VALUES(0,${user_uuid},${name},${account},${password},${is_admin},${
					menu_auth ? `"[${menu_auth}]"` : '"[]"'
				},${1},${now},${now})`
			);

			SUCCESS(res, "注册成功");
		} catch (err) {
			if (err.errno == 1062 && retryCount < 3) {
				retryCount += 1;
				sql();
				return;
			}

			next(err);
		}
	};

	sql();
};

const disableAdmin = (req, res, next) => {
	let { id, status } = req.body;

	let { user_id } = decode(req.headers.token);

	if (!req.body || !id) {
		next("字段缺失");
		return;
	}

	if (typeof id !== "number") {
		next("不是number");
		return;
	}

	if (typeof status !== "number") {
		next("不是number");
		return;
	}

	user_id = escape(user_id);
	id = escape(id);
	status = escape(status);

	const sql = async () => {
		try {
			await queryUserAuthMenu(user_id, 10001);

			await db.query(
				"learn",
				`update  user_info  SET status = ${
					status ? 1 : 0
				} where user_id = ${id}`
			);

			SUCCESS(res, "修改成功");
		} catch (err) {
			next(err);
		}
	};

	sql();
};

const updateAdmin = (req, res, next) => {
	let { id, is_admin, menu_auth } = req.body;

	let { user_id } = decode(req.headers.token);

	if (!req.body || !id) {
		next("字段缺失");
		return;
	}

	if (typeof id !== "number") {
		next("id不是number");
		return;
	}

	if (!Array.isArray(menu_auth)) {
		next("menu_auth不是array");
		return;
	}

	if (typeof is_admin !== "number") {
		next("is_admin不是number");
		return;
	}

	let nowTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

	nowTime = escape(nowTime);
	menu_auth = escape(menu_auth);
	user_id = escape(user_id);

	const sql = async () => {
		try {
			await queryUserAuthMenu(user_id, 10002);

			await db.query(
				"learn",
				`update  user_info  SET menus = "[${menu_auth}]" , admin = "${
					is_admin ? 1 : 0
				}" , update_time = ${nowTime}  where user_id = ${id}`
			);

			SUCCESS(res, "修改成功");
		} catch (err) {
			next(err);
		}
	};

	sql();
};

module.exports = {
	queryRoute,
	queryAllMenu,
	queryAdminList,
	registerAdmin,
	disableAdmin,
	updateAdmin,
};
