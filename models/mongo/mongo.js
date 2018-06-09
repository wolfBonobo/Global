'use strict'
const MongoClient = require('mongodb').MongoClient;
let collections = ["cities", "countries"];
let connection;
let dbs = new Map();

function getCollection(name) {
	return new Promise(function (resolve, reject) {
		try {
			resolve(connection.collection(name));
		} catch (err) {
			console.log(err);
			reject(err);
		}
	})
}

function connect(mongoUrl) {
	return new Promise(function (resolve, reject) {

		MongoClient.connect(mongoUrl, function (err, db) {
			if (err) {
				reject(err);
			} else {
				console.log('Connected to MongoDB');
				resolve(db);
			}
		})
	})
}

module.exports = {
	connectToServer: function (mongoUrl) {
		return new Promise(function (resolve, reject) {
			connect(mongoUrl).then(function (db) {
				connection = db.db("global");
				collections.forEach(function (element) {
					getCollection(element).then(function (collection) {
						dbs.set(element, collection);
					})
				});
			})
			resolve();
		})
	},
	find: function (collectionName, filter, projection) {
		return new Promise(function (resolve, reject) {
			const collection = dbs.get(collectionName);
			try {
				collection.find(filter, projection, function (err, cursor) {
					if (err) {
						reject(err);
					} else {
						cursor.toArray(function (err, arr) {
							resolve(arr);
						})
					}
				})
			} catch (err) {
				reject(err);
			}
		})
	},

	insert: function (collectionName, element) {
		return new Promise(function (resolve, reject) {
			const collection = dbs.get(collectionName);
			try {
				collection.insert(element, function (err) {
					if (err) {
						reject(err);
					} else {
						resolve(true);
					}
				})
			} catch (err) {
				reject(err);
			}
		})
	},

	update: function (collectionName, query, changes, options = {}) {
		return new Promise(function (resolve, reject) {
			const collection = dbs.get(collectionName);
			try {
				collection.update(query, changes, options, function (err, result) {
					if (err) {
						reject(err);
					} else {
						resolve(true);
					}
				})
			} catch (err) {
				reject(err);
			}
		})
	},
	aggregate: function (collectionName, query) {
		return new Promise(function (resolve, reject) {
			const collection = dbs.get(collectionName);
			collection.aggregate(query).toArray(function (err, documents) {
				if (err) {
					reject(err);
				} else {
					resolve(documents);
				}
			})
		})
	},
	getLocation: function (info) {
		return new Promise(function (resolve, reject) {
			try {
				console.log(info.city);
				dbs.get('cities').find({
					"name": info.city
				}, {
					projection: {
						name: 1,
						location: 1,
						_id: 0
					}
				}, function (err, cursor) {
					cursor.limit(1).toArray(function (err, arr) {
						console.log('query ok');
						resolve(arr);
					})
				})
			} catch (err) {
				reject(err);
			}
		})
	},
	getCities: function (info) {
		return new Promise(function (resolve, reject) {
			try {
				console.log(info.city);
				dbs.get('cities').find({
					"country": info.country,
					"name": {
						'$regex': info.city,
						$options: "i"
					}
				}, {
					projection: {
						alpha2Code: 1,
						name: 1,
						_id: 0
					}
				}, function (err, cursor) {
					cursor.limit(10).toArray(function (err, arr) {
						console.log('query ok');
						resolve(arr);
					})
				})
			} catch (err) {
				reject(err);
			}
		})
	},
	near: function (collection, info) {
		let lng = parseFloat(info.lng);
		let lat = parseFloat(info.lat);
		let radio = parseFloat(info.radius);
		return new Promise(function (resolve, reject) {
			try {
				dbs.get(collection).find({
					location: {
						$near: {
							$geometry: {
								type: "Point",
								coordinates: [lng, lat]
							},
							$minDistance: 0,
							$maxDistance: radio
						}
					}
				}, function (err, cursor) {
					cursor.toArray(function (err, arr) {
						console.log('query ok');
						resolve(arr);
					})
				})
			} catch (err) {
				reject(err);
			}
		})
	}
} //module export