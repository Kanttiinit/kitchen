const {
  createRestaurant,
  createChange,
  syncDB,
  closeDB,
  models
} = require('../utils');

describe('Change', () => {
  beforeEach(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  describe('creating', () => {
    it('throws when model name does not exist', () =>
      expect(
        createChange({
          modelName: 'UnknownModel',
          modelFilter: { id: 1 },
          change: {
            address: 'New address',
            latitude: 61.321
          }
        })
      ).rejects.toThrowError());
  });

  describe('applying', () => {
    it('applies a change correctly', async () => {
      const restaurant = await createRestaurant();
      const change = await createChange({
        modelName: 'Restaurant',
        modelFilter: { id: restaurant.id },
        change: {
          address: 'New address',
          latitude: 61.321
        }
      });
      await change.apply('Person');
      const newRestaurant = await models.Restaurant.findById(restaurant.id);
      const newChange = await models.Change.findByPk(change.uuid);
      expect(newRestaurant.address).toBe('New address');
      expect(newRestaurant.latitude).toBe(61.321);
      expect(newChange.appliedBy).toBe('Person');
      expect(newChange.appliedAt).toBeInstanceOf(Date);
    });

    it('does not apply change when it has already been applied', async () => {
      const restaurant = await createRestaurant();
      const change = await createChange({
        modelName: 'Restaurant',
        modelFilter: { id: restaurant.id },
        change: {
          address: 'New address',
          latitude: 61.321
        }
      });
      await change.apply('Person');
      const sameChange = await models.Change.findByPk(change.uuid);
      await expect(sameChange.apply('Another person')).rejects.toThrowError();
    });

    it('throws when applying a change with a model that does not exist', async () => {
      const change = await createChange({
        modelName: 'Restaurant',
        modelFilter: { id: 4 },
        change: {
          address: 'New address',
          latitude: 61.321
        }
      });
      change.modelName = 'Unknown';
      await expect(change.apply('Person')).rejects.toThrowError();
    });

    it('throws when applying a change with no model instance', async () => {
      const restaurant = await createRestaurant();
      const change = await createChange({
        modelName: 'Restaurant',
        modelFilter: { id: Math.round(restaurant.id * Math.PI) },
        change: {
          address: 'New address',
          latitude: 61.321
        }
      });
      await expect(change.apply('Person')).rejects.toThrowError();
    });

    it('throws when trying to create a change with a field without a change formatter', async () => {
      const restaurant = await createRestaurant();
      await expect(createChange({
        modelName: 'Restaurant',
        modelFilter: { id: restaurant.id },
        change: {
          AreaId: 6
        }
      })).rejects.toThrow('Creating a change is not allowed for the following fields: AreaId.');
    });

    it('only applies a change to one result', async () => {
      const restaurantOne = await createRestaurant(1, {
        address: 'Address'
      });
      const restaurantTwo = await createRestaurant(2, {
        address: 'Address'
      });
      const change = await createChange({
        modelName: 'Restaurant',
        modelFilter: { address: 'Address' },
        change: {
          latitude: 61.321
        }
      });
      await change.apply('Person');
      const restaurantOneNew = await models.Restaurant.findById(
        restaurantOne.id
      );
      const restaurantTwoNew = await models.Restaurant.findById(
        restaurantTwo.id
      );
      expect(
        restaurantOneNew.latitude === 61.321 ||
          restaurantTwoNew.latitude === 61.321
      ).toBe(true);
      expect(restaurantOneNew.latitude === restaurantTwoNew.latitude).toBe(
        false
      );
    });
  });
});
