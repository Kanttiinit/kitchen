import * as Sequelize from 'sequelize';
const timeOfDayRegExp = /[0-9]{2}\:[0-9]{2}/;

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
        validtae: { is: timeOfDayRegExp }
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
      weekday: { type: DataTypes.INTEGER, allowNull: false } // 0 == monday, 6 == sunday
    },
    {
      tableName: 'opening_hours',
      validate: {
        openingAndClosingOrClosed() {
          if ((!this.opens || !this.closes) && !this.closed) {
            throw new Error('Must specify opening hours if not closed.');
          }
        }
      }
    }
  );

  Model.forRestaurant = restaurantId => {
    return sequelize.query(
      `
      WITH hours as (
        SELECT * FROM opening_hours
        WHERE
          "RestaurantId" = :restaurantId
          AND CURRENT_DATE >= "from"
          AND CURRENT_DATE <= "to"
        ORDER BY "manualEntry" DESC, "from" DESC, "weekday" ASC
      )
      SELECT DISTINCT ON (weekday) * FROM hours
    `,
      {
        replacements: { restaurantId },
        type: Sequelize.QueryTypes.SELECT,
        raw: true
      }
    );
  };

  return Model;
};
