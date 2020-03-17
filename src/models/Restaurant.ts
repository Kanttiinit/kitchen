import utils from './utils';
import * as moment from 'moment';

const publicAttrs = [
  'id',
  'type',
  'name',
  'url',
  'image',
  'latitude',
  'longitude',
  'address',
  'priceCategory'
];

function formatHour(hour) {
  return String(hour).replace(/([0-9]{1,2})([0-9]{2})/, '$1:$2');
}

function formatHours(hours) {
  if (!hours) {
    return 'closed';
  }

  return `${formatHour(hours[0])} - ${formatHour(hours[1])}`;
}

export default (sequelize, DataTypes) => {
  const Restaurant = sequelize.define(
    'Restaurant',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name_i18n: DataTypes.JSON,
      type: DataTypes.STRING,
      url: DataTypes.STRING,
      menuUrl: DataTypes.STRING,
      latitude: DataTypes.DOUBLE,
      longitude: DataTypes.DOUBLE,
      address: DataTypes.STRING,
      openingHours: DataTypes.JSON,
      priceCategory: {
        type: DataTypes.ENUM(['regular', 'student', 'studentPremium']),
        defaultValue: 'student',
        allowNull: false
      },
      hidden: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: 'restaurants',
      validate: {
        areValidOpeningHours() {
          const value = this.openingHours;
          if (value.length !== 7) {
            throw new Error('Opening hours array needs to have a length of 7.');
          }
          for (const hours of value) {
            const isClosed = hours === null;
            if (isClosed) {
              continue;
            }
            const [open, close] = hours;
            if (typeof open !== 'number' || typeof close !== 'number') {
              throw new Error('Open and close times need to be numbers.');
            }
            const openMoment = moment(formatHour(open), 'HH:mm');
            const closeMoment = moment(formatHour(close), 'HH:mm');
            if (!openMoment.isValid() || !closeMoment.isValid()) {
              throw new Error(
                `One or both of the following are not valid opening hours: ${open}, ${close}.`
              );
            }
            if (openMoment.isSameOrAfter(closeMoment)) {
              throw new Error(
                `Opening time cannot be after closing time: ${open}, ${close}.`
              );
            }
          }
        }
      }
    }
  );

  Restaurant.prototype.getPublicAttributes = async function(lang) {
    const openingHours = this.getPrettyOpeningHours();

    const output = {
      openingHours,
      distance:
        this.dataValues.distance && Math.round(this.dataValues.distance * 1000),
      ...utils.parsePublicParams(this, publicAttrs, lang)
    };

    if (this.Menus) {
      output.menus = this.Menus.map(m => m.getPublicAttributes(lang));
    }

    return output;
  };

  Restaurant.prototype.getPrettyOpeningHours = function() {
    return this.openingHours.map(curr => {
      if (curr) {
        return formatHours(curr);
      }
      return null;
    });
  };

  Restaurant.changeableFields = [
    'openingHours',
    'address',
    'latitude',
    'longitude'
  ];

  const latLngLink = (lat, lon) =>
    `[${lat}, ${lon}](http://www.google.com/maps/place/${lat},${lon})`;

  Restaurant.prototype.formatChange = function(change) {
    let formattedChange = '';
    if (change.openingHours) {
      formattedChange += change.openingHours
        .map((nextHours, i) => {
          const previousHours = this.openingHours[i];
          const weekday = moment()
            .set({ isoWeekday: i + 1 })
            .format('ddd');
          return [weekday, formatHours(previousHours), formatHours(nextHours)];
        })
        .filter(([, prev, next]) => prev !== next)
        .map(([weekday, prev, next], i) => `${weekday}: ${prev} -> ${next}`)
        .join('\n');
    }

    if (change.address) {
      formattedChange += `\nAddress: ${this.address} -> ${change.address}`;
    }

    if (change.latitude || change.longitude) {
      formattedChange += `\nLocation: ${latLngLink(
        this.latitude,
        this.longitude
      )} -> ${latLngLink(change.latitude, change.longitude)}`;
    }

    return `Restaurant name: ${this.name_i18n.fi}\nHomepage: ${this.url}\n\n${formattedChange}`;
  };

  return Restaurant;
};
