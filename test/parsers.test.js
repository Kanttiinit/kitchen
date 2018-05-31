const parse = require('../dist/parser').default;
const { validateMenu } = require('./validateSchema');

async function expectCorrectFormat(url, lang) {
  const menus = await parse(url, lang);
  const validationResult = validateMenu(menus[0]);
  expect(validationResult).toBe(true);
  console.log(menus[0].courses[0].title);
}

const urls = [
  'http://messi.hyyravintolat.fi/publicapi/restaurant/4',
  'http://api.teknolog.fi/taffa/fi/html/week/',
  'http://www.sodexo.fi/ruokalistat/output/weekly_json/142/%year%/%month%/%day%/fi',
  'http://www.amica.fi/modules/json/json/Index?costNumber=3579&language=fi&firstDay=%year%-%month%-%day%',
  'http://www.hys.net/ruokalista.xml',
  'http://www.mau-kas.fi/ravintola.html?listtype=lunch&showall=true'
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
