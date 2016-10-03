const parse = require('../dist/parser').default;
const chai = require('chai');

const menuSchema = require('../schema/menu.json');

chai.use(require('chai-json-schema'));

const expect = chai.expect;

function expectCorrectFormat(url, lang) {
  return parse(url, lang)
  .then(menus => {
    expect(menus[0]).to.be.jsonSchema(menuSchema);
    //console.log(menus[0].courses[0].title);
  });
}

describe('Parser', function() {

  describe('parses Unicafe menu', function() {
    it('in Finnish', () =>
      expectCorrectFormat('http://messi.hyyravintolat.fi/publicapi/restaurant/4', 'fi')
    );

    it('in English', () =>
      expectCorrectFormat('http://messi.hyyravintolat.fi/publicapi/restaurant/4', 'en')
    );
  });

  describe('parses Täffä menu', function() {
    it('in Finnish', () =>
      expectCorrectFormat('http://api.teknolog.fi/taffa/fi/html/week/', 'fi')
    );

    it('in English', () =>
      expectCorrectFormat('http://api.teknolog.fi/taffa/fi/html/week/', 'en')
    );
  });

  describe('parses Sodexo menu', function() {
    it('in Finnish', () =>
      expectCorrectFormat('http://www.sodexo.fi/ruokalistat/output/weekly_json/142/%year%/%month%/%day%/fi', 'fi')
    );

    it('in English', () =>
      expectCorrectFormat('http://www.sodexo.fi/ruokalistat/output/weekly_json/142/%year%/%month%/%day%/fi', 'en')
    );
  });

  describe('parses Amica menu', function() {
    it('in Finnish', () =>
      expectCorrectFormat('http://www.amica.fi/modules/json/json/Index?costNumber=3579&language=fi&firstDay=%year%-%month%-%day%', 'fi')
    );

    it('in English', () =>
      expectCorrectFormat('http://www.amica.fi/modules/json/json/Index?costNumber=3579&language=fi&firstDay=%year%-%month%-%day%', 'en')
    );
  });

  describe('parses Hämis menu', function() {
    it('in Finnish', () =>
      expectCorrectFormat('http://www.hys.net/ruokalista.xml', 'fi')
    );
  });

  it('throws error when not provided with language', function() {
    try {
      expectCorrectFormat('');
    } catch(e) {
      expect(e).to.be.an('error');
    }
  });
});
