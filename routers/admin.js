const express = require('express');
const crypto = require('crypto');

module.exports = express.Router()
.get('/login', (req, res) => {
	res.json({loggedIn: req.session.loggedIn || false});
})
.get('/password/:password', (req, res) => {
	res.send(crypto.createHash('sha256').update(req.params.password).digest('base64'));
})
.post('/login', (req, res) => {
	if (crypto.createHash('sha256').update(req.body.password).digest('base64') === process.env.PASSWORD) {
		req.session.loggedIn = true;
		res.json({loggedIn: true});
	}
	else
		res.json({loggedIn: false});
})
.post('/logout', (req, res) => {
	req.session.loggedIn = false;
});
