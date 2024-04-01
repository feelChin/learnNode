const { SUCCESS } = require("../utils/send");
const { decode } = require("../utils/jwt");
const db = require("../db");
const dayjs = require("dayjs");

const queryList = (req, res, next) => {
	let { page, page_size } = req.body;
	let { user_id } = decode(req.headers.token);

	if (!req.body || !page || !page_size) {
		next("字段缺失");
		return;
	}

	page = Number(page);
	page_size = Number(page_size);
	user_id = db.escape(user_id);

	const start_index = (page - 1) * page_size;

	const sql = async () => {
		try {
			const [fildCount] = await db.query(
				"learn",
				`select count(*) from list where user_id=${user_id}`
			);

			const fildResult = await db.query(
				"learn",
				`select * from list where user_id=${user_id} limit ${start_index},${page_size}`
			);

			const findList = fildResult.map(({ id, create_time, title, text }) => {
				return {
					id,
					title,
					text,
					create_time: dayjs(create_time).format("YYYY-MM-DD HH:mm:ss"),
				};
			});

			return SUCCESS(res, "查询成功", findList, {
				total: fildCount["count(*)"],
			});
		} catch {
			next("查询失败");
		}
	};

	sql();
};

const saveList = (req, res, next) => {
	let { title, text } = req.body;
	let { user_id } = decode(req.headers.token);
	let nowTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

	if (!req.body || !title || !text) {
		next("字段缺失");
		return;
	}

	title = db.escape(title);
	text = db.escape(text);
	user_id = db.escape(user_id);
	nowTime = db.escape(nowTime);

	const sql = async () => {
		try {
			await db.query(
				"learn",
				`INSERT INTO list(id,title,text,user_id,create_time) VALUES(0,${title},${text},${user_id},${nowTime})`
			);

			return SUCCESS(res, "保存成功");
		} catch {
			next("保存失败");
		}
	};

	sql();
};

const deleteList = (req, res, next) => {
	let { id } = req.body;
	let { user_id } = decode(req.headers.token);

	if (!req.body || !id) {
		next("没有文章id");
		return;
	}

	id = db.escape(id);
	user_id = db.escape(user_id);

	const sql = async () => {
		try {
			await db.query(
				"learn",
				`DELETE FROM list WHERE id = ${id} and user_id = ${user_id}`
			);

			return SUCCESS(res, "删除成功");
		} catch {
			next("删除失败");
		}
	};

	sql();
};

module.exports = {
	queryList,
	saveList,
	deleteList,
};
