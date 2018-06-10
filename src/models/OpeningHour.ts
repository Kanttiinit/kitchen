import * as Sequelize from 'sequelize';
import * as moment from 'moment';

const timeOfDayRegExp = /^[0-9]{2}\:[0-9]{2}$/;

type OpeningHour = {
  opens: string;
  closes: string;
  closed: boolean;
};

export default (sequelize, DataTypes) => {
  const Model = sequelize.define(
    'OpeningHour',
    {
      from: { type: DataTypes.DATEONLY, allowNull: false },
      to: { type: DataTypes.DATEONLY, allowNull: true },
      opens: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { is: timeOfDayRegExp }
      },
      closes: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { is: timeOfDayRegExp }
      },
      closed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      manualEntry: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
      dayOfWeek: { type: DataTypes.INTEGER, allowNull: false } // 0 == monday, 6 == sunday
    },
    {
      tableName: 'opening_hours',
      validate: {
        openingAndClosingOrClosed() {
          if ((!this.opens || !this.closes) && !this.closed) {
            throw new Error('Must specify opening hours if not closed.');
          }
        },
        dayOfWeekWithinRange() {
          if (this.dayOfWeek < 0 || this.dayOfWeek > 6) {
            throw new Error('Week day must be between 0 and 6 (inclusive).');
          }
        },
        toIsNotBeforeFrom() {
          if (this.to && moment(this.to).isBefore(moment(this.from), 'day')) {
            throw new Error('"to" must be after "from".');
          }
        },
        closesIsNotBeforeOpens() {
          if (this.opens && this.closes) {
            if (
              moment(this.closes, 'HH:mm').isSameOrBefore(
                moment(this.opens, 'HH:mm'),
                'minute'
              )
            ) {
              throw new Error('"closes" must be after "opens".');
            }
          }
        }
      }
    }
  );

  const getQuery = distinct => {
    const baseQuery = `
    SELECT * FROM opening_hours, (
      SELECT date_trunc('week', :date::date)::date as "weekStart",
      date_trunc('week', :date::date + '1 week'::interval)::date as "weekEnd"
    ) as x
    WHERE
      "RestaurantId" = :restaurantId
      AND "from" <= "weekEnd"
      AND ("to" >= "weekStart" OR "to" IS NULL)
    ORDER BY "manualEntry" DESC, "from" DESC, "dayOfWeek" ASC`;

    if (distinct) {
      return `WITH hours as (${baseQuery}) SELECT DISTINCT ON ("dayOfWeek") * FROM hours`;
    }
    return baseQuery;
  };

  Model.forRestaurant = async (
    restaurantId: string,
    date: string = moment().format('YYYY-MM-DD'),
    everything: boolean
  ): Promise<Array<OpeningHour>> => {
    const results = await sequelize.query(getQuery(!everything), {
      replacements: { restaurantId, date },
      type: Sequelize.QueryTypes.SELECT,
      raw: true
    });

    if (everything) {
      return results;
    }

    const output = [];
    for (const dayOfWeek of [0, 1, 2, 3, 4, 5, 6]) {
      let entry = { closed: true };
      const item = results.find(n => n.dayOfWeek === dayOfWeek) || {
        closed: true,
        dayOfWeek
      };
      const previous = output[output.length - 1];
      if (
        previous &&
        ((previous.opens === item.opens && previous.closes === item.closes) ||
          previous.closed === item.closed)
      ) {
        previous.daysOfWeek.push(dayOfWeek);
      } else {
        if (item.closed) {
          output.push({
            closed: true,
            daysOfWeek: [dayOfWeek]
          });
        } else {
          output.push({
            opens: item.opens,
            closes: item.closes,
            daysOfWeek: [dayOfWeek]
          });
        }
      }
    }

    return output;
  };

  return Model;
};
