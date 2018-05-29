const chai = require('chai');
const { OpeningHours, sequelize } = require('../../dist/models');
const { createRestaurant, createOpeningHour, destroy } = require('../utils');

chai.use(require('chai-as-promised'));
const { expect } = chai;

describe.only('Opening hours', () => {
  let restaurants = [];
  before(async () => {
    await sequelize.sync({ force: true });
    restaurants.push(await createRestaurant(1));
    restaurants.push(await createRestaurant(2));
  });

  after(async () => {
    await destroy(...restaurants);
  });

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

  it('does return an entry which starts today', async () => {
    const a = await createOpeningHour({}, 0, 5);
    const hours = await OpeningHours.forRestaurant(1);
    expect(hours.length).to.equal(1);
    await destroy(a);
  });

  it('does return an antry which ends today', async () => {
    const a = await createOpeningHour({}, -5, 0);
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

    it('throws an error when weekday is out of range', async () => {
      await expect(createOpeningHour({ weekday: -1 })).to.be.rejected;
      await expect(createOpeningHour({ weekday: 7 })).to.be.rejected;
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

  it('returns opening hours in correct order', async () => {
    const sun = await createOpeningHour({ weekday: 6, opens: '12:00' });
    const tue = await createOpeningHour({ weekday: 1, opens: '09:30' });
    const thu = await createOpeningHour({ weekday: 3, opens: '10:30' });
    const sat = await createOpeningHour({ weekday: 5, opens: '11:30' });
    const mon = await createOpeningHour({ weekday: 0, opens: '09:00' });
    const fri = await createOpeningHour({ weekday: 4, opens: '11:00' });
    const wed = await createOpeningHour({ weekday: 2, opens: '10:00' });
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

  it('only returns opening time, closing time and closed flag', async () => {
    const a = await createOpeningHour();
    const hours = await OpeningHours.forRestaurant(1);
    expect(Object.keys(hours[0]).sort()).to.deep.equal([
      'closed',
      'closes',
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
