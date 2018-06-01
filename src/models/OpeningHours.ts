import * as Sequelize from 'sequelize';
const timeOfDayRegExp = /[0-9]{2}\:[0-9]{2}/;

type OpeningHour = {
  opens: string;
  closes: string;
  closed: boolean;
};

export default (sequelize, DataTypes) => {
  const Model = sequelize.define(
    'OpeningHours',
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
        defaultValue: false,
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
        }
      }
    }
  );

  Model.forRestaurant = async (
    restaurantId: string
  ): Promise<Array<OpeningHour>> => {
    const results = await sequelize.query(
      `
      WITH hours as (
        SELECT "opens", "closes", "dayOfWeek", "closed" FROM opening_hours
        WHERE
          "RestaurantId" = :restaurantId
          AND CURRENT_DATE >= "from"
          AND (CURRENT_DATE <= "to" OR "to" IS NULL)
        ORDER BY "manualEntry" DESC, "from" DESC, "dayOfWeek" ASC
      )
      SELECT DISTINCT ON ("dayOfWeek") * FROM hours
    `,
      {
        replacements: { restaurantId },
        type: Sequelize.QueryTypes.SELECT,
        raw: true
      }
    );
    return results.map(({ opens, closes, closed, dayOfWeek }) => {
      if (closed) {
        return { dayOfWeek, closed };
      }
      return { opens, closes, dayOfWeek };
    });
  };

  return Model;
};
