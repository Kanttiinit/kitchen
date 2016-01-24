const fetch = require('node-fetch');
const moment = require('moment');
const util = require('util');
const findParser = require('./Parsers');

const get = url => {
	// find a suitable parser
	const parser = findParser(url);
	if (parser)
		return parser(url);

	return new Promise((resolve, reject) => reject('there is no parser for ' + url));
};

if (!module.parent)
	get(process.argv[2]).then(r => console.log(util.inspect(r, null, null))).catch(err => console.error(err));

module.exports = get;
