import * as utils from '../utils';
import moment from 'moment';
const jsdom = require('jsdom').jsdom;

const transformProperties = props => props.map(p => p === 'K' ? 'MU' : p);

const formatUrl = (url, lang) => url.replace('/fi/', '/' + lang + '/');

export default {
	pattern: /api.teknolog.fi/,
	parse(url, lang) {
		return utils.text(formatUrl(url, lang))
		.then(html => {
			// parse html
			const document = jsdom(html, {features: {QuerySelector: true}});

			// iterate through all <p> elements
			return [].slice.call(document.querySelectorAll('p')).map(p => {
				const date = moment(p.textContent.split(/\s/).pop(), 'DD.MM.YYYY');
				// return courses for the day
				return {
					day: date.format('YYYY-MM-DD'),
					courses: [].slice.call(p.nextElementSibling.querySelectorAll('li')).map(course => {
						const properties = course.textContent.match(/([A-Z]{1,2}\s?)+$/);
						// return course
						return {
							title: course.textContent.replace(/([A-Z]{1,2}\s?)+$/, '').trim(),
							properties: properties ? transformProperties(properties[0].match(utils.propertyRegex)) : []
						};
					}).filter(course => course.title) // filter out empty-titled courses
				};
			});
		});
	}
};
