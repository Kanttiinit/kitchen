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

// http://www.sodexo.fi/ruokalistat/output/weekly_json/142/%year%/%month%/%day%/fi
// http://www.amica.fi/modules/json/json/Index?costNumber=0191&language=en&firstDay=%year%-%month%-%day%
// http://api.teknolog.fi/taffa/fi/html/week/

if (!module.parent)
	get(process.argv[2]).then(r => console.log(r)).catch(err => console.error(err));

module.exports = get;
