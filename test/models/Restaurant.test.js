const utils = require('../utils');

describe('Restaurant model', () => {
  beforeEach(async () => {
    await utils.syncDB();
  });

  afterAll(async () => {
    await utils.closeDB();
  });

  describe('validating opening hours', () => {
    it('throws when opening hours array is other than 7 items in length', () =>
      expect(
        utils.createRestaurant(1, {
          openingHours: [
            [1030, 1500],
            [1030, 1500],
            [1030, 1500],
            [1030, 1500],
            [1030, 1400]
          ]
        })
      ).rejects.toThrow('Opening hours array needs to have a length of 7.'));

    it('throws when an opening hour is not a number', () =>
      expect(
        utils.createRestaurant(1, {
          openingHours: [
            [1030, 1500],
            [1030, 1500],
            [1030, '15:00'],
            [1030, 1500],
            [1030, 1400],
            null,
            null
          ]
        })
      ).rejects.toThrow('Open and close times need to be numbers.'));

    it('throws when an opening hour can not be parsed', () =>
      expect(
        utils.createRestaurant(1, {
          openingHours: [
            [1030, 1500],
            [1030, 2661],
            [1030, 1500],
            [1030, 1500],
            [1030, 1400],
            null,
            null
          ]
        })
      ).rejects.toThrow('One or both of the following are not valid opening hours: 1030, 2661'));

    it('throws when a closing time is after an opening time', () =>
      expect(
        utils.createRestaurant(1, {
          openingHours: [
            [1030, 1500],
            [1400, 1000],
            [1030, 1500],
            [1030, 1500],
            [1030, 1400],
            null,
            null
          ]
        })
      ).rejects.toThrow('Opening time cannot be after closing time: 1400, 1000'));

    it('works when everything is in order', () =>
      expect(
        utils.createRestaurant(1, {
          openingHours: [
            [1030, 1500],
            [1030, 1500],
            [1030, 1500],
            [1030, 1500],
            [1030, 1400],
            null,
            null
          ]
        })
      ).resolves.toBeTruthy());
  });
});
