const fetch = require('node-fetch');
const moment = require('moment');
const util = require('util');
const fs = require('fs');

const parsers = fs.readdirSync(__dirname + '/parsers').map(_ => require('./parsers/' + _));

function findParser(url) {
	// find a suitable parser
	const parser = parsers.find(p => url.match(p.pattern));
	if (parser)
		return parser.parser(url);

	return Promise.reject('there is no parser for ' + url);
};

if (!module.parent)
	findParser(process.argv[2]).then(r => console.log(util.inspect(r, null, null))).catch(err => console.error(err));

module.exports = findParser;
