require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({
	extended: false
}); //for websites
const jsonParser = bodyParser.json({
	extended: false
}); //for App

//Models 
const mongo = require('./models/mongo/mongo');
const mysql = require('./models/mysql/mysql');

[
	'PORT',
	'MONGODB_URL',
].forEach((name) => {
	if (!process.env[name]) {
		throw new Error(`Environment variable ${name} is missing`)
	}
})

//conexion con mongo
mongo.connectToServer(process.env.MONGODB_URL);

//conexion con mysql
/* mysql.connectToServer({
	host: process.env.SQLHOST,
	user: process.env.SQLUSER,
	password: process.env.SQLPWD,
	database: ""
}); */


//PRUEBAS  MODEL MYSQL
//-----------------------------------------------------------------
/*mysql.query("select * from country").then(function(resulset){
		resulset.forEach( function(element, index) {
			console.log(element.get('name'));
		});
});*/


let port = process.env.PORT;
const server = app.listen(port, function () {
	const host = server.address().address
	const port = server.address().port

	console.log("Server listening at http://%s:%s", host, port || 3001)
})


app.get('/countries', function (req, res) {
	mongo.find('countries', {
		'region': 'Europe'
	}, {
		projection: {
			id: 1,
			name: 1,
			_id: 0
		}
	}).then(function (json) {
		res.status(200);
		res.set({
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		});
		res.send(JSON.stringify(json));
	}).catch(function (err) {
		console.log(err);
	})
});

app.post('/checkCities', urlencodedParser, function (req, res) {
	var info = req.body;
	mongo.getCities(info).then(function (json) {
		console.log(json);
		res.status(200);
		res.set({
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		});
		res.send(JSON.stringify(json));
	}).catch(function (err) {
		console.log(err);
	})
});

app.post('/getLocation', urlencodedParser, function (req, res) {

	var info = req.body;

	mongo.getLocation(info).then(function (json) {
		console.log(json);
		res.status(200);
		res.set({
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		});
		res.send(JSON.stringify(json));
	}).catch(function (err) {
		console.log(err);
	})
});

app.get('/heat', function (req, res) {
	mongo.find('cities', {}, {
		projection: {
			location: 1,
			_id: 0
		}
	}).then(function (json) {
		console.log(json);
		res.status(200);
		res.set({
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		});
		res.send(JSON.stringify(json));
	}).catch(function (err) {
		console.log(err);
	})

})
//---------------------------------------------------------

//METODOS APP (PENDIENTE) GEOLOCALIZACIÓN Y NOTIFICACIONES PUSH CON FIREBASE
//Devuelve información de la ciudad más cercana a la localización del usuario
app.post('/getcityApp', jsonParser, function (req, res) {
	var info = req.body;
	var longitud = info.coordinates[0];
	var latitud = info.coordinates[1];

	mongo.aggregate('cities', [{
		$geoNear: {
			near: {
				type: "Point",
				coordinates: [longitud, latitud]
			},
			distanceField: "dist.calculated",
			maxDistance: 30000,
			query: {},
			includeLocs: "dist.location",
			num: 1,
			spherical: true
		}
	}]).then(function (json) {
		console.log(json);
		res.status(200);
		res.set({
			'Access-Control-Allow-Origin': '*',
			'Content-Type': 'application/json'
		});
		res.send(JSON.stringify(json[0]));
	}).catch(function (err) {
		console.log(err);
	})
});

//Guarda localizacion de usuarios que aceptan localizacion
app.post('/updateLocation', jsonParser, function (req, res) {
	var info = req.body;
	console.log(info)
	let deviceid = info.deviceid;
	let location = info.location

	mongo.update('users', {
		'deviceid': deviceid
	}, {
		'deviceid': deviceid,
		'location': location
	}, {
		upsert: true
	}).then(function (actualizado) {
		if (actualizado = true) {
			res.status(200);
			res.set({
				'Access-Control-Allow-Origin': '*',
				'Content-Type': 'application/json'
			});
			res.send(JSON.stringify({
				mensaje: 'ok'
			}));
		}
	}).catch(function (err) {
		console.log(err);
	})
});