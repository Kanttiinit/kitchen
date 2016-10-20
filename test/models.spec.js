import models from '../dist/models';
import {expect} from 'chai';

describe('Models', () => {
  describe('Area', () => {
    it('gets map image after creation', async () => {
      const area = await models.Area.findById(1);
      expect(area.mapImageUrl).to.be.a('string');
    });

    it('changes map image after editing', async () => {
      const area = await models.Area.findById(1);
      const oldImageUrl = area.mapImageUrl;
      const updatedArea = await area.update({locationRadius: 5});
      expect(oldImageUrl).not.to.equal(updatedArea.mapImageUrl);
      console.log(oldImageUrl, updatedArea.mapImageUrl);
    });
  });
});
