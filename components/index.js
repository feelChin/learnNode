const db = require("../db");

const queryUserAuthMenu = async (user_id, AUTHCODE, JUDGEADMIN = true) => {
	const [findAuth] = await db.query(
		"learn",
		`select menus,admin from user_info where user_id = ${user_id}`
	);

	const ISADMIN = Boolean(findAuth.admin);
	const MENUAUTH = JSON.parse(findAuth.menus);

	if (JUDGEADMIN && !ISADMIN) {
		throw "你没有管理员权限";
	}

	if (AUTHCODE && !MENUAUTH.includes(AUTHCODE)) {
		throw "你没有按钮权限";
	}

	return {
		ISADMIN,
		MENUAUTH,
	};
};

module.exports = {
	queryUserAuthMenu,
};
