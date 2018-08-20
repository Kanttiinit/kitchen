import utils from './utils';

export default (sequelize, DataTypes) => {
  const Favorite = sequelize.define(
    'Favorite',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      name_i18n: DataTypes.JSON,
      regexp: DataTypes.STRING,
      icon: DataTypes.STRING
    },
    {
      tableName: 'favorites'
    }
  );
  Favorite.prototype.getPublicAttributes = function(lang) {
    return utils.parsePublicParams(
      this,
      ['id', 'name', 'regexp', 'icon'],
      lang
    );
  };
  return Favorite;
};
