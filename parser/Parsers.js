const moment = require('moment');
const jsdom = require('jsdom').jsdom;
const fetch = require('node-fetch');

const propertyRegex = /\b([A-Z]{1,2})\b/g;

const parsers = [
	{
		pattern: /www.sodexo.fi/,
		parser(response) {
			return response.json()
			.then(feed => {
				var days = [];
				var date = moment().startOf('week');
				for (var day in feed.menus) {
					date.add({days: 1});
					days.push({
						date: moment(date).toDate(),
						courses: feed.menus[day].map(course => {
							return {
								title: course.title_fi,
								properties: course.properties ? course.properties.split(", ") : []
							};
						})
					});
				}
				return days;
			});
		}
	},
	{
		pattern: /api.teknolog.fi/,
		parser(response) {
			return response.text()
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
		parser(response) {
			return response.json()
			.then(json => {
				return json.MenusForDays.map(day => {
					return {
						date: moment(day.Date),
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
		}
	}
];

const parse = url => {
	const parser = parsers.find(p => url.match(p.pattern));
	if (parser)
		return parser.parser;
}

module.exports = parse;
