const parse = require('../dist/menu-parser').default;
const { validateMenu } = require('./validateSchema');

async function expectCorrectFormat(url, lang) {
  const menus = await parse(url, lang);
  const validationResult = validateMenu(menus[0]);
  expect(validationResult).toBe(true);
  console.log(menus[0].courses[0].title);
}

const urls = [
  'http://www.hys.net/ruokalista.xml'
];

describe('Parsers', () => {
  describe('restaurant', () => {
    urls.forEach(url => {
      describe('parser for ' + url.split('/')[2], function() {
        test('parses menus in Finnish', () => expectCorrectFormat(url, 'fi'));

        test('parses menus in English', () => expectCorrectFormat(url, 'en'));
      });
    });
  });

  describe('in general', () => {
    test('throws error when not provided with language', function() {
      try {
        expectCorrectFormat('');
      } catch (e) {
        expect(e).to.be.an('error');
      }
    });
  });
});
