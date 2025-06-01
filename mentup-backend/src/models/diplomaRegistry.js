module.exports = (sequelize, DataTypes) => {
    const DiplomaRegistry = sequelize.define('DiplomaRegistry', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: DataTypes.STRING,
      surname: DataTypes.STRING,
      tc: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      diploma_number: {
        type: DataTypes.STRING,
        allowNull: false
      }
    }, {
      tableName: 'diploma_registry',
      timestamps: false
    });
  
    return DiplomaRegistry;
  };
  