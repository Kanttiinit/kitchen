const express = require('express');
const crypto = require('crypto');
const bufferEq = require('buffer-equal-constant-time');

module.exports = express.Router()
.use(express.static('admin'))
.get('/admin', (req, res) => {
	res.sendFile('../admin/index.html');
})
.get('/login', (req, res) => {
	res.json({loggedIn: req.session.loggedIn || false});
})
.get('/password/:password', (req, res) => {
	res.send(crypto.createHash('sha256').update(req.params.password).digest('base64'));
})
.post('/login', (req, res) => {
	var passwordHash = new Buffer(crypto.createHash('sha256').update(req.body.password).digest('base64'));
	var savedHash = new Buffer(String(process.env.PASSWORD));
	if ( bufferEq(passwordHash, savedHash) ) {
		req.session.loggedIn = true;
		res.json({loggedIn: true});
	} else {
		res.json({loggedIn: false});
	}
})
.post('/logout', (req, res) => {
	req.session.loggedIn = false;
	res.json({loggedIn: false});
});
