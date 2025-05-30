module.exports = (sequelize, DataTypes) => {
    const DirectMessage = sequelize.define('DirectMessage', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    }, {
      tableName: 'direct_messages',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: false
    });
  
    DirectMessage.associate = (models) => {
      // Message -> Sender (User) (many-to-one)
      DirectMessage.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'sender',
        onDelete: 'CASCADE'
      });
  
      // Message -> ChatRoom (many-to-one)
      DirectMessage.belongsTo(models.ChatRoom, {
        foreignKey: 'chatroom_id',
        as: 'chatroom',
        onDelete: 'CASCADE'
      });
    };
  
    return DirectMessage;
  };
  