const parse = require('../dist/parser').default;

const menuSchema = require('../schema/menu.json');

function expectCorrectFormat(url, lang) {
  return parse(url, lang).then(menus => {
    expect(menus[0]).to.be.jsonSchema(menuSchema);
    console.log(menus[0].courses[0].title);
  });
}

const urls = [
  'http://messi.hyyravintolat.fi/publicapi/restaurant/4',
  'http://api.teknolog.fi/taffa/fi/html/week/',
  'http://www.sodexo.fi/ruokalistat/output/weekly_json/142/%year%/%month%/%day%/fi',
  'http://www.amica.fi/modules/json/json/Index?costNumber=3579&language=fi&firstDay=%year%-%month%-%day%',
  'http://www.hys.net/ruokalista.xml',
  'http://www.mau-kas.fi/ravintola.html?listtype=lunch&showall=true'
];

describe.skip('Restaurants', () => {
  urls.forEach(url => {
    describe('Parser for ' + url.split('/')[2], function() {
      it('parses menus in Finnish', () => expectCorrectFormat(url, 'fi'));

      it('parses menus in English', () => expectCorrectFormat(url, 'en'));
    });
  });
});

describe.skip('General', () => {
  it('throws error when not provided with language', function() {
    try {
      expectCorrectFormat('');
    } catch (e) {
      expect(e).to.be.an('error');
    }
  });
});
