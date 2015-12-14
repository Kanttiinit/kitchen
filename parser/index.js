const fetch = require('node-fetch');
const moment = require('moment');
const util = require('util');
const findParser = require('./Parsers');

const process = url => {
	const date = moment();

	// format url by replacing date placeholders with actual values
	url = url
		.replace('%year%', date.format('YYYY'))
		.replace('%month%', date.format('MM'))
		.replace('%day%', date.format('DD'));

	// find a suitable parser
	const parser = findParser(url);
	if (parser)
		return fetch(url).then(response => parser(response));

	return new Promise((resolve, reject) => reject('there is no parser for ' + url));
};

// http://www.sodexo.fi/ruokalistat/output/weekly_json/142/%year%/%month%/%day%/fi
// http://www.amica.fi/modules/json/json/Index?costNumber=0191&language=en&firstDay=%year%-%month%-%day%
// http://api.teknolog.fi/taffa/fi/html/week/

module.exports = process;
