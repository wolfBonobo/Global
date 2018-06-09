'use strict'
const mysql = require('mysql');
let con;
module.exports = {

	connectToServer: function (sqlUrl) {
		con = mysql.createConnection(sqlUrl);
		con.connect(function (err) {
			if (err) throw err;
			console.log("Connected to MySQL!");
		});
	},
	query: function (sql) {
		return new Promise(function (resolve, reject) {
			con.query(sql, function (err, rows, fields) {
				var resulset = [];
				if (err) throw err;
				rows.forEach(function (row, index) {
					let obj = new Map();
					fields.forEach(function (col, i) {
						var colname = col.name
						obj.set(colname, row[colname]);
					});
					resulset.push(obj);
				});
				resolve(resulset);
			});
		})

	},
}