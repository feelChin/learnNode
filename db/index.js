const mysql = require("mysql");

module.exports = {
	query: (name, sql) => {
		const connection = mysql.createConnection({
			host: "localhost",
			user: "root",
			password: "123456",
			port: "3306",
			database: name,
		});

		return new Promise((resolve, reject) => {
			try {
				connection.query(sql, (err, res) => {
					if (err) {
						reject(err);
					}

					resolve(res);
				});
			} catch (err) {
				reject(err);
			} finally {
				connection.end();
			}
		});
	},
	escape: mysql.escape,
};
