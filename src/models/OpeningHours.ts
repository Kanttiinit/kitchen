export default (sequelize, DataTypes) => {
  return sequelize.define('OpeningHours', {
    from: {type: DataTypes.DATEONLY, allowNull: false },
    to: {type: DataTypes.DATEONLY, allowNull: true},
    opens: {type: DataTypes.STRING, allowNull: false},
    closes: {type: DataTypes.STRING, allowNull: false},
    closed: {type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false},
    priority: {type: DataTypes.INTEGER, defaultValue: 1, allowNull: false}
  }, {
    tableName: 'opening_hours'
  });
};
