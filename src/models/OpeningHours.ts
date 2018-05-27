const timeOfDayRegExp = /[0-9]{2}\:[0-9]{2}/;

export default (sequelize, DataTypes) => {
  return sequelize.define('OpeningHours', {
    from: {type: DataTypes.DATEONLY, allowNull: false },
    to: {type: DataTypes.DATEONLY, allowNull: true},
    opens: {type: DataTypes.STRING, allowNull: true, validate: {is: timeOfDayRegExp}},
    closes: {type: DataTypes.STRING, allowNull: true, validtae: {is: timeOfDayRegExp}},
    closed: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
    manualEntry: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
    weekday: {type: DataTypes.INTEGER, allowNull: false} // 0 == monday, 6 == sunday
  }, {
    tableName: 'opening_hours',
    validate: {
      openingAndClosingOrClosed() {
        if ((!this.opens || !this.closes) && !this.closed) {
          throw new Error('Must specify opening hours if not closed.');
        }
      }
    }
  });
};
