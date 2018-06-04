const { OpeningHour } = require('../dist/models');
const {
  createRestaurant,
  createOpeningHour,
  destroy,
  syncDB
} = require('./utils');

describe('Opening hours', () => {
  let restaurants = [];
  beforeAll(async () => {
    await syncDB();
    restaurants.push(await createRestaurant(1));
    restaurants.push(await createRestaurant(2));
  });

  afterAll(async () => {
    await destroy(...restaurants);
  });

  describe('preference', () => {
    test('prefers manual entries', async () => {
      const a = await createOpeningHour({ manualEntry: true, opens: '10:00' }),
        b = await createOpeningHour({ manualEntry: false, opens: '12:00' });
      const hours = await OpeningHour.forRestaurant(1);
      expect(hours[0].opens).toBe('10:00');
      await destroy(a, b);
    });

    test('prefers entries added at a later date', async () => {
      const a = await createOpeningHour({ opens: '10:00' }, -3, 1),
        b = await createOpeningHour({ opens: '12:00' }, -1, 1);
      const hours = await OpeningHour.forRestaurant(1);
      expect(hours[0].opens).toBe('12:00');
      await destroy(a, b);
    });

    test('prefers manually added entry even though there is a newer one', async () => {
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
      const hours = await OpeningHour.forRestaurant(1);
      expect(hours[0].opens).toBe('10:00');
      await destroy(a, b);
    });
  });

  test('does not return an entry which has expired', async () => {
    const a = await createOpeningHour({}, -5, -1);
    const hours = await OpeningHour.forRestaurant(1);
    expect(hours.length).toBe(0);
    await destroy(a);
  });

  test('does not return an entry which is coming up', async () => {
    const a = await createOpeningHour({}, 1, 5);
    const hours = await OpeningHour.forRestaurant(1);
    expect(hours.length).toBe(0);
    await destroy(a);
  });

  test('returns an entry which starts today', async () => {
    const a = await createOpeningHour({}, 0, 5);
    const hours = await OpeningHour.forRestaurant(1);
    expect(hours.length).toBe(1);
    await destroy(a);
  });

  test('returns an entry which ends today', async () => {
    const a = await createOpeningHour({}, -5, 0);
    const hours = await OpeningHour.forRestaurant(1);
    expect(hours.length).toBe(1);
    await destroy(a);
  });

  test('returns an entry which only lasts a day', async () => {
    const a = await createOpeningHour({}, 0, 0);
    const hours = await OpeningHour.forRestaurant(1);
    expect(hours.length).toBe(1);
    await destroy(a);
  });

  describe('validation', () => {
    test('does not require opening and closing times when marked as closed', async () => {
      (await createOpeningHour({
        closed: true,
        opens: undefined,
        closes: undefined
      })).destroy();
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
  });

  test('returns all opening hours', async () => {
    const sun = await createOpeningHour({ dayOfWeek: 6, opens: '12:00' });
    const tue = await createOpeningHour({ dayOfWeek: 1, opens: '09:30' });
    const thu = await createOpeningHour({ dayOfWeek: 3, opens: '10:30' });
    const sat = await createOpeningHour({ dayOfWeek: 5, opens: '11:30' });
    const mon = await createOpeningHour({ dayOfWeek: 0, opens: '09:00' });
    const fri = await createOpeningHour({ dayOfWeek: 4, opens: '11:00' });
    const wed = await createOpeningHour({ dayOfWeek: 2, opens: '10:00' });
    const hours = await OpeningHour.forRestaurant(1);
    expect(hours.length).toBe(7);
    expect(hours[0].opens).toBe('09:00');
    expect(hours[1].opens).toBe('09:30');
    expect(hours[2].opens).toBe('10:00');
    expect(hours[3].opens).toBe('10:30');
    expect(hours[4].opens).toBe('11:00');
    expect(hours[5].opens).toBe('11:30');
    expect(hours[6].opens).toBe('12:00');
    await destroy(mon, tue, wed, thu, fri, sat, sun);
  });

  describe('fields', () => {
    test('has correct fields when closed', async () => {
      const a = await createOpeningHour({ closed: true });
      const hours = await OpeningHour.forRestaurant(1);
      expect(Object.keys(hours[0]).sort()).toEqual(['closed', 'dayOfWeek']);
      await a.destroy();
    });

    test('has correct fields when not closed', async () => {
      const a = await createOpeningHour();
      const hours = await OpeningHour.forRestaurant(1);
      expect(Object.keys(hours[0]).sort()).toEqual([
        'closes',
        'dayOfWeek',
        'opens'
      ]);
      await a.destroy();
    });
  });

  test('does not return opening hours for another restaurant', async () => {
    const a = await createOpeningHour({ RestaurantId: 1, opens: '10:00' }),
      b = await createOpeningHour({ RestaurantId: 2, opens: '12:00' });
    const hours = await OpeningHour.forRestaurant(2);
    expect(hours[0].opens).toBe('12:00');
    expect(hours.length).toBe(1);
    destroy(a, b);
  });

  test('returns an entry without an ending time', async () => {
    const a = await createOpeningHour({ to: undefined });
    const hours = await OpeningHour.forRestaurant(1);
    expect(hours.length).toBe(1);
    destroy(a);
  });
});
