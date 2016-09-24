import * as utils from '../utils';
import moment from 'moment';

export default {
	pattern: /www.sodexo.fi/,
	parse(url, lang) {
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
								title: lang === 'fi' ? course.title_fi : course.title_en,
								properties: course.properties ? course.properties.split(", ") : []
							};
						})
					});
				}
			});
		return Promise.all(utils.getWeeks().map(parseWithDate)).then(() => days);
	}
};
