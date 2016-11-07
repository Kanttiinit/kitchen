export default (sequelize, DataTypes) => {
  return sequelize.define('Location', {
    latitude: {type: DataTypes.DOUBLE, primaryKey: true, allowNull: false},
    longitude: {type: DataTypes.DOUBLE, primaryKey: true, allowNull: false},
    timestamp: {type: DataTypes.DATE, primaryKey: true, allowNull: false, defaultValue: DataTypes.NOW},
    userHash: {type: DataTypes.STRING, primaryKey: true, allowNull: false}
  }, {
    tableName: 'locations',
    timestamps: false
  });
};
