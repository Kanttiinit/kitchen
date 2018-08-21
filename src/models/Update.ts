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
      description: DataTypes.STRING
    },
    {
      tableName: 'updates'
    }
  );
  Update.prototype.getPublicAttributes = function(lang) {
    return utils.parsePublicParams(
      this,
      ['id', 'type', 'description', 'createdAt'],
      lang
    );
  };
  return Update;
};
