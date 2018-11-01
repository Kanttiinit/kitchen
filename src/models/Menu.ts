import utils from './utils';
import * as moment from 'moment';

export default (sequelize, DataTypes) => {
  const Menu = sequelize.define(
    'Menu',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      day: { type: DataTypes.DATEONLY, allowNull: false },
      courses_i18n: {
        type: DataTypes.JSON,
        allowNull: false,
        validate: {
          isCorrectFormat(value) {
            const langs = Object.keys(value);
            if (langs.some(lang => lang !== 'fi' && lang !== 'en')) {
              throw new Error('The only allowed languages are fi and en.');
            }
          }
        }
      }
    },
    {
      tableName: 'menus'
    }
  );

  Menu.prototype.getPublicAttributes = function(lang) {
    const publicParams = utils.parsePublicParams(
      this,
      ['day', 'courses'],
      lang
    );
    publicParams.day = moment(publicParams.day).format('YYYY-MM-DD');
    return publicParams;
  };

  return Menu;
};
