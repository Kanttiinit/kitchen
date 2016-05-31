const utils = require('../utils');
const moment = require('moment');

module.exports = {
	pattern: /www.sodexo.fi/,
	parser(url) {
		var days = [];
		const parseWithDate = date =>
			utils.json(utils.formatUrl(url, date))
			.then(feed => {
				for (var day in feed.menus) {
					var timestamp = moment(date).day(day);
					days.push({
						day: timestamp.format('YYYY-MM-DD'),
						courses: feed.menus[day].map(course => {
							return {
								title: course.title_fi,
								properties: course.properties ? course.properties.split(", ") : []
							};
						})
					});
				}
			});
		return Promise.all(utils.getWeeks().map(parseWithDate)).then(() => days);
	}
};
