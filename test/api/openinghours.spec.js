const chai = require('chai');
const { OpeningHours, sequelize } = require('../../dist/models');
const { createRestaurant, createOpeningHour, destroy } = require('../utils');

chai.use(require('chai-as-promised'));
const { expect } = chai;

describe.only('Opening hours', () => {
  let restaurants = [];
  before(async () => {
    await sequelize.drop();
    await sequelize.sync({ force: true });
    restaurants.push(await createRestaurant(1));
    restaurants.push(await createRestaurant(2));
  });

  after(async () => {
    await destroy(...restaurants);
  });

  describe('preference', () => {
    it('prefers manual entries', async () => {
      const a = await createOpeningHour({ manualEntry: true, opens: '10:00' }),
        b = await createOpeningHour({ manualEntry: false, opens: '12:00' });
      const hours = await OpeningHours.forRestaurant(1);
      expect(hours[0].opens).to.equals('10:00');
      await destroy(a, b);
    });

    it('prefers entries added at a later date', async () => {
      const a = await createOpeningHour({ opens: '10:00' }, -3, 1),
        b = await createOpeningHour({ opens: '12:00' }, -1, 1);
      const hours = await OpeningHours.forRestaurant(1);
      expect(hours[0].opens).to.equals('12:00');
      await destroy(a, b);
    });

    it('prefers manually added entry even though there is a newer one', async () => {
      const a = await createOpeningHour(
          { opens: '10:00', manualEntry: true },
          -3,
          1
        ),
        b = await createOpeningHour(
          { opens: '12:00', manualEntry: false },
          -1,
          1
        );
      const hours = await OpeningHours.forRestaurant(1);
      expect(hours[0].opens).to.equals('10:00');
      await destroy(a, b);
    });
  });

  it('does not return an entry which has expired', async () => {
    const a = await createOpeningHour({}, -5, -1);
    const hours = await OpeningHours.forRestaurant(1);
    expect(hours.length).to.equals(0);
    await destroy(a);
  });

  it('does not return an entry which is coming up', async () => {
    const a = await createOpeningHour({}, 1, 5);
    const hours = await OpeningHours.forRestaurant(1);
    expect(hours.length).to.equal(0);
    await destroy(a);
  });

  it('returns an entry which starts today', async () => {
    const a = await createOpeningHour({}, 0, 5);
    const hours = await OpeningHours.forRestaurant(1);
    expect(hours.length).to.equal(1);
    await destroy(a);
  });

  it('returns an entry which ends today', async () => {
    const a = await createOpeningHour({}, -5, 0);
    const hours = await OpeningHours.forRestaurant(1);
    expect(hours.length).to.equal(1);
    await destroy(a);
  });

  it('returns an entry which only lasts a day', async () => {
    const a = await createOpeningHour({}, 0, 0);
    const hours = await OpeningHours.forRestaurant(1);
    expect(hours.length).to.equal(1);
    await destroy(a);
  });

  describe('validation', () => {
    it('does not require opening and closing times when marked as closed', async () => {
      (await createOpeningHour({
        closed: true,
        opens: undefined,
        closes: undefined
      })).destroy();
    });

    it('throws an error when there is no opening time when not marked as closed', () => {
      return expect(
        createOpeningHour({
          closed: false,
          opens: undefined
        })
      ).to.be.rejected;
    });

    it('throws an error when there is no closing time when not marked as closed', () => {
      return expect(
        createOpeningHour({
          closed: false,
          closes: undefined
        })
      ).to.be.rejected;
    });

    it('throws an error when dayOfWeek is out of range', async () => {
      await expect(createOpeningHour({ dayOfWeek: -1 })).to.be.rejected;
      await expect(createOpeningHour({ dayOfWeek: 7 })).to.be.rejected;
    });

    it('throws error when opening time is wrongly formatted', () => {
      return expect(
        createOpeningHour({
          opens: '9:00'
        })
      ).to.be.rejected;
    });

    it('throws error when closing time is wrongly formatted', () => {
      return expect(
        createOpeningHour({
          closes: '9:00'
        })
      ).to.be.rejected;
    });
  });

  it('returns all opening hours', async () => {
    const sun = await createOpeningHour({ dayOfWeek: 6, opens: '12:00' });
    const tue = await createOpeningHour({ dayOfWeek: 1, opens: '09:30' });
    const thu = await createOpeningHour({ dayOfWeek: 3, opens: '10:30' });
    const sat = await createOpeningHour({ dayOfWeek: 5, opens: '11:30' });
    const mon = await createOpeningHour({ dayOfWeek: 0, opens: '09:00' });
    const fri = await createOpeningHour({ dayOfWeek: 4, opens: '11:00' });
    const wed = await createOpeningHour({ dayOfWeek: 2, opens: '10:00' });
    const hours = await OpeningHours.forRestaurant(1);
    expect(hours.length).to.equal(7);
    expect(hours[0].opens).to.equal('09:00');
    expect(hours[1].opens).to.equal('09:30');
    expect(hours[2].opens).to.equal('10:00');
    expect(hours[3].opens).to.equal('10:30');
    expect(hours[4].opens).to.equal('11:00');
    expect(hours[5].opens).to.equal('11:30');
    expect(hours[6].opens).to.equal('12:00');
    await destroy(mon, tue, wed, thu, fri, sat, sun);
  });

  it('return fields are: opening time, closing time, closed flag and day of week', async () => {
    const a = await createOpeningHour();
    const hours = await OpeningHours.forRestaurant(1);
    expect(Object.keys(hours[0]).sort()).to.deep.equal([
      'closed',
      'closes',
      'dayOfWeek',
      'opens'
    ]);
    await a.destroy();
  });

  it('does not return opening hours for another restaurant', async () => {
    const a = await createOpeningHour({ RestaurantId: 1, opens: '10:00' }),
      b = await createOpeningHour({ RestaurantId: 2, opens: '12:00' });
    const hours = await OpeningHours.forRestaurant(2);
    expect(hours[0].opens).to.equal('12:00');
    expect(hours.length).to.equal(1);
    destroy(a, b);
  });
});
