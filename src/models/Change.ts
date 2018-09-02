export default (sequelize, DataTypes) => {
  const Change = sequelize.define(
    'Change',
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
      },
      modelName: { type: DataTypes.STRING, allowNull: false },
      modelFilter: { type: DataTypes.JSONB, allowNull: false },
      change: { type: DataTypes.JSONB, allowNull: false },
      appliedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      appliedBy: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: 'changes'
    }
  );

  Change.prototype.apply = async function(appliedBy: string) {
    if (this.appliedAt) {
      throw new Error(
        `This change has already been applied at ${this.appliedAt} by ${
          this.appliedBy
        }`
      );
    }

    const model = sequelize.models[this.modelName];
    if (!model) {
      throw new Error(
        `No such model "${this.modelName}" when trying to apply a change.`
      );
    }

    const item = await model.findOne({
      where: this.modelFilter
    });

    if (!item) {
      throw new Error('No model instance found when trying to apply a change.');
    }

    await sequelize.transaction(async transaction => {
      await item.update(this.change, { transaction });
      return this.update(
        {
          appliedAt: new Date(),
          appliedBy
        },
        { transaction }
      );
    });
  };
  return Change;
};
