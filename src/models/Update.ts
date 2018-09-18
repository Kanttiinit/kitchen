import utils from './utils';

export default (sequelize, DataTypes) => {
  const Update = sequelize.define(
    'Update',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      type: DataTypes.STRING,
      title: DataTypes.STRING,
      description: DataTypes.TEXT
    },
    {
      tableName: 'updates'
    }
  );
  Update.prototype.getPublicAttributes = function(lang) {
    return utils.parsePublicParams(
      this,
      ['id', 'type', 'title', 'description', 'createdAt'],
      lang
    );
  };
  return Update;
};
