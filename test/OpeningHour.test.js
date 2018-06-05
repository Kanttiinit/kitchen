const { OpeningHour } = require('../dist/models');
const { createRestaurant, createOpeningHour, syncDB } = require('./utils');

const get = (date = '2018-01-01') => OpeningHour.forRestaurant(1, date);

describe('Opening hours', () => {
  let restaurants = [];
  beforeEach(async () => {
    await syncDB();
    restaurants.push(await createRestaurant(1));
    restaurants.push(await createRestaurant(2));
  });

  describe('preference', () => {
    test('prefers manual entries', async () => {
      await createOpeningHour({ manualEntry: true, opens: '10:00' });
      await createOpeningHour({ manualEntry: false, opens: '12:00' });
      const hours = await get();
      expect(hours[0].opens).toBe('10:00');
    });

    test('prefers entries added at a later date', async () => {
      await createOpeningHour({ opens: '10:00' }, 0);
      await createOpeningHour({ opens: '12:00' }, 1);
      const hours = await get();
      expect(hours[0].opens).toBe('12:00');
    });

    test('prefers manually added entry even though there is a newer one', async () => {
      await createOpeningHour({ opens: '10:00', manualEntry: true }, -5);
      await createOpeningHour({ opens: '12:00', manualEntry: false });
      const hours = await get();
      expect(hours[0].opens).toBe('10:00');
    });
  });

  test('does not return an entry which has expired', async () => {
    await createOpeningHour({ from: '2018-01-01', to: '2018-02-01' });
    const hours = await get('2018-03-01');
    expect(hours.length).toBe(1);
    expect(hours[0].closed).toBe(true);
  });

  test('does not return an entry which is coming up', async () => {
    await createOpeningHour({}, 8);
    const hours = await get();
    expect(hours.length).toBe(1);
    expect(hours[0].closed).toBe(true);
  });

  test('returns an entry which starts on the week start', async () => {
    await createOpeningHour({
      from: '2018-01-01',
      to: '2018-02-01',
      opens: '10:00'
    });
    const hours = await get('2018-01-01');
    expect(hours.length).toBe(2);
    expect(hours[0].opens).toBe('10:00');
  });

  test('returns an entry which ends on the week start', async () => {
    await createOpeningHour({ from: '2017-10-10', to: '2018-01-01' });
    const hours = await get('2018-01-01');
    expect(hours.length).toBe(2);
  });

  test('returns an entry which only lasts a day', async () => {
    await createOpeningHour({}, 0, 0);
    const hours = await OpeningHour.forRestaurant(1);
    expect(hours.length).toBe(1);
  });

  describe('validation', () => {
    test('does not require opening and closing times when marked as closed', async () => {
      await createOpeningHour({
        closed: true,
        opens: undefined,
        closes: undefined
      });
    });

    test('throws an error when there is no opening time when not marked as closed', () =>
      expect(
        createOpeningHour({
          closed: false,
          opens: undefined
        })
      ).rejects.toThrow());

    test('throws an error when there is no closing time when not marked as closed', () =>
      expect(
        createOpeningHour({
          closed: false,
          closes: undefined
        })
      ).rejects.toThrow());

    test('throws an error when dayOfWeek is out of range', async () => {
      await expect(createOpeningHour({ dayOfWeek: -1 })).rejects.toThrow();
      await expect(createOpeningHour({ dayOfWeek: 7 })).rejects.toThrow();
    });

    test('throws error when opening time is wrongly formatted', () =>
      expect(
        createOpeningHour({
          opens: '9:00'
        })
      ).rejects.toThrow());

    test('throws error when closing time is wrongly formatted', () =>
      expect(
        createOpeningHour({
          closes: '9:00'
        })
      ).rejects.toThrow());

    test('throws an error when to is before from', () =>
      expect(createOpeningHour({}, 0, -1)).rejects.toThrow());

    test('throws an error when closing time is before opening time', () =>
      expect(
        createOpeningHour({ opens: '10:00', closes: '09:59' })
      ).rejects.toThrow());
  });

  test('returns all opening hours', async () => {
    await Promise.all([
      createOpeningHour({ dayOfWeek: 6, opens: '12:00' }),
      createOpeningHour({ dayOfWeek: 1, opens: '09:30' }),
      createOpeningHour({ dayOfWeek: 3, opens: '10:30' }),
      createOpeningHour({ dayOfWeek: 5, opens: '11:30' }),
      createOpeningHour({ dayOfWeek: 0, opens: '09:00' }),
      createOpeningHour({ dayOfWeek: 4, opens: '11:00' }),
      createOpeningHour({ dayOfWeek: 2, opens: '10:00' })
    ]);
    const hours = await get();
    expect(hours.length).toBe(7);
    expect(hours[0].opens).toBe('09:00');
    expect(hours[1].opens).toBe('09:30');
    expect(hours[2].opens).toBe('10:00');
    expect(hours[3].opens).toBe('10:30');
    expect(hours[4].opens).toBe('11:00');
    expect(hours[5].opens).toBe('11:30');
    expect(hours[6].opens).toBe('12:00');
  });

  describe('fields', () => {
    test('has correct fields when closed', async () => {
      await createOpeningHour({
        closed: true,
        from: '2018-01-01',
        to: '2018-02-01'
      });
      const hours = await get();
      expect(Object.keys(hours[0]).sort()).toEqual(['closed', 'daysOfWeek']);
    });

    test('has correct fields when not closed', async () => {
      await createOpeningHour({
        from: '2018-01-01',
        to: '2018-02-01'
      });
      const hours = await get('2018-01-01');
      expect(Object.keys(hours[0]).sort()).toEqual([
        'closes',
        'daysOfWeek',
        'opens'
      ]);
    });

    test('concatenates adjacent times that are the same', async () => {
      await Promise.all([
        createOpeningHour({
          opens: '09:00',
          closes: '10:00',
          from: '2018-01-01',
          to: '2018-02-01',
          dayOfWeek: 0
        }),
        createOpeningHour({
          opens: '09:00',
          closes: '10:00',
          from: '2018-01-01',
          to: '2018-02-01',
          dayOfWeek: 1
        }),
        createOpeningHour({
          opens: '09:00',
          closes: '12:00',
          from: '2018-01-01',
          to: '2018-02-01',
          dayOfWeek: 2
        })
      ]);
      const hours = await get('2018-01-02');
      expect(hours.length).toBe(3);
      expect(hours[0].daysOfWeek.length).toBe(2);
      expect(hours[0].closes).toBe('10:00');
      expect(hours[1].daysOfWeek.length).toBe(1);
      expect(hours[1].closes).toBe('12:00');
      expect(hours[2].daysOfWeek.length).toBe(4);
      expect(hours[2].closed).toBe(true);
    });
  });

  test('does not return opening hours for another restaurant', async () => {
    await Promise.all([
      createOpeningHour({ RestaurantId: 1, opens: '10:00' }),
      createOpeningHour({ RestaurantId: 2, opens: '12:00' })
    ]);
    const hours = await OpeningHour.forRestaurant(2, '2018-01-01');
    expect(hours[0].opens).toBe('12:00');
    expect(hours.length).toBe(2);
  });

  test('returns an entry without an ending time', async () => {
    await createOpeningHour({ to: null, opens: '12:34' });
    const hours = await get();
    expect(hours.length).toBe(2);
    expect(hours[0].opens).toBe('12:34');
  });
});
