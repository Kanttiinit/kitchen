const utils = require('../utils');

describe('Menu model', () => {
  beforeEach(async () => {
    await utils.syncDB();
  });

  afterAll(async () => {
    await utils.closeDB();
  });

  it('does not allow to add unknown languages', () =>
    expect(
      utils.createMenu(1, {
        courses_i18n: {
          de: []
        }
      })
    ).rejects.toThrow('The only allowed languages are fi and en.'));

  it('allows creating menu for only one language', async () => {
    await utils.createMenu(1, {
      courses_i18n: {
        fi: []
      }
    });

    await utils.createMenu(2, {
      courses_i18n: {
        en: []
      }
    });
  });

  it('allows creating menu for both languages', async () => {
    await utils.createMenu(1, {
      courses_i18n: {
        fi: [],
        en: []
      }
    });
  });
});
