const { SUCCESS } = require("../utils/send");
const db = require("../db");
const dayjs = require("dayjs");
const { escape } = require("mysql");

const queryList = (req, res, next) => {
	let { page, page_size, keyword = "", brand_id = 0, group_id = 0 } = req.query;

	if (!req.query || !page || !page_size) {
		next("字段缺失");
		return;
	}

	page = Number(page);
	page_size = Number(page_size);
	brand_id = Number(brand_id);
	group_id = Number(group_id);
	keyword = escape(`%${keyword}%`);

	const start_index = (page - 1) * page_size;

	const sql = async () => {
		const where = `from base_article where title LIKE ${keyword} and group_id=${group_id} ${
			brand_id && ` and brand_id=${brand_id}`
		}`;

		try {
			const [fildCount] = await db.query(
				"learn",
				`select count(*) ${where}
        `
			);

			const fildResult = await db.query(
				"learn",
				`select * ${where} limit ${start_index},${page_size}`
			);

			const findList = fildResult.map(({ id, brand_id, group_id, title }) => {
				return {
					id,
					brand_id,
					group_id,
					title,
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
	let { id = 0, group_id = 0, brand_id, title, content } = req.body;

	let nowTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

	if (!req.body || !brand_id || !title || !content) {
		next("字段缺失");
		return;
	}

	id = Number(id);
	brand_id = Number(brand_id);
	group_id = Number(group_id);
	title = escape(title);
	content = escape(content);
	nowTime = escape(nowTime);

	const sql = async () => {
		try {
			if (id) {
				await db.query(
					"learn",
					`update  base_article  SET group_id = ${group_id}, title = ${title} , content = ${content} , update_time = ${nowTime} where id = ${id}`
				);
			} else {
				await db.query(
					"learn",
					`INSERT INTO base_article(id,brand_id,group_id,title,content,create_time,update_time) VALUES(0,${brand_id},${group_id},${title},${content},${nowTime},${nowTime})`
				);
			}

			return SUCCESS(res, "保存成功");
		} catch (err) {
			next("保存失败");
		}
	};

	sql();
};

const queryGroupList = (req, res, next) => {
	const sql = async () => {
		try {
			const fildResult = await db.query(
				"learn",
				`select * from base_article_group`
			);

			const findList = fildResult.map(({ id, name }) => {
				return {
					id,
					name,
				};
			});

			return SUCCESS(res, "查询成功", findList);
		} catch {
			next("查询失败");
		}
	};

	sql();
};

const saveGroupList = (req, res, next) => {
	let { name } = req.body;

	let nowTime = dayjs().format("YYYY-MM-DD HH:mm:ss");

	if (!req.body || !name) {
		next("字段缺失");
		return;
	}

	name = escape(name);
	nowTime = escape(nowTime);

	const sql = async () => {
		try {
			const findIt = await db.query(
				"learn",
				`select * from base_article_group where name = ${name}`
			);

			if (!!findIt.length) {
				next("组名字不能重复");
				return;
			}

			await db.query(
				"learn",
				`INSERT INTO base_article_group (id,name,create_time,update_time) VALUES(0,${name},${nowTime},${nowTime})`
			);

			return SUCCESS(res, "保存成功");
		} catch {
			next("保存失败");
		}
	};

	sql();
};

const queryDetail = (req, res, next) => {
	let { id } = req.query;

	if (!req.query || !id) {
		next("字段缺失");
		return;
	}

	id = Number(id);

	const sql = async () => {
		try {
			const fildResult = await db.query(
				"learn",
				`select * from base_article  where id = ${id}`
			);

			const [item] = fildResult.map(({ id, title, content }) => {
				return {
					id,
					title,
					content,
				};
			});

			return SUCCESS(res, "查询成功", item);
		} catch {
			next("查询失败");
		}
	};

	sql();
};

const deleteDetail = (req, res, next) => {
	let { id } = req.query;

	if (!req.query || !id) {
		next("字段缺失");
		return;
	}

	id = Number(id);

	const sql = async () => {
		try {
			await db.query("learn", `DELETE FROM base_article  where id = ${id}`);

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
	queryGroupList,
	saveGroupList,
	queryDetail,
	deleteDetail,
};
