const moment = require('moment');
const jsdom = require('jsdom').jsdom;
const fetch = require('node-fetch');

const propertyRegex = /\b([A-Z]{1,2})\b/g;
const weeks = [moment(), moment().add({weeks: 1})].map(d => d.startOf('week').add({days: 1}));

const formatUrl = (url, date) => {
	date = date || moment();
	return url
		.replace('%year%', date.format('YYYY'))
		.replace('%month%', date.format('MM'))
		.replace('%day%', date.format('DD'));
}

const json = url => fetch(url).then(r => r.json());
const text = url => fetch(url).then(r => r.text());

const parsers = [
	{
		pattern: /www.sodexo.fi/,
		parser(url) {
			var days = [];
			const parseWithDate = date =>
				json(formatUrl(url, date))
				.then(feed => {
					var i = 0;
					for (var day in feed.menus) {
						days.push({
							date: moment(date).add({days: i}).toDate(),
							courses: feed.menus[day].map(course => {
								return {
									title: course.title_fi,
									properties: course.properties ? course.properties.split(", ") : []
								};
							})
						});
						i++;
					}
				});
			return Promise.all(weeks.map(parseWithDate)).then(() => days);
		}
	},
	{
		pattern: /api.teknolog.fi/,
		parser(url) {
			return text(url)
			.then(html => {
				// parse html
				const document = jsdom(html, {features: {QuerySelector: true}});

				// iterate through all <p> elements
				return [].slice.call(document.querySelectorAll('p')).map(p => {
					// return courses for the day
					return {
						date: moment(p.textContent.split(/\s/).pop(), 'DD.MM.YYYY').toDate(),
						courses: [].slice.call(p.nextElementSibling.querySelectorAll('li')).map(course => {
							const properties = course.textContent.match(/([A-Z]{1,2}\s?)+$/);
							// return course
							return {
								title: course.textContent.replace(/([A-Z]{1,2}\s?)+$/, '').trim(),
								properties: properties ? properties[0].match(propertyRegex) : []
							};
						}).filter(course => course.title) // filter out empty-titled courses
					};
				});
			});
		}
	},
	{
		pattern: /www.amica.fi/,
		parser(url) {
			const parseWithDate = date =>
				json(formatUrl(url, date))
				.then(json => {
					return json.MenusForDays.map(day => {
						return {
							date: moment(day.Date).toDate(),
							courses: day.SetMenus
							.map(x => x.Components.map(y => (x.Name ? (x.Name + ': ') : '') + y))
							.reduce((a, x) => a.concat(x), [])
							.map(course => {
								const regex = /\s\(.+\)$/;
								const properties = course.match(regex);
								return {
									title: course.replace(regex, ''),
									properties: properties ? properties[0].match(propertyRegex) : []
								};
							})
						};
					}).filter(day => day.courses.length);
				});
			return Promise.all(weeks.map(parseWithDate)).then(l => l.reduce((a, m) => a.concat(m), []));
		}
	}
];

const findParser = url => {
	const parser = parsers.find(p => url.match(p.pattern));
	if (parser)
		return parser.parser;
}

module.exports = findParser;
