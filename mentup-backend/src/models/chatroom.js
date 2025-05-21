module.exports = (sequelize, DataTypes) => {
    const ChatRoom = sequelize.define('ChatRoom', {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4
      }
    }, {
      tableName: 'chatrooms',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    });
  
    ChatRoom.associate = (models) => {
      // ChatRoom <-> User (many-to-many)
      ChatRoom.belongsToMany(models.User, {
        through: 'chatroom_users', // küçük harf
        foreignKey: 'chatroom_id',
        otherKey: 'user_id',
        as: 'participants',
        onDelete: 'CASCADE'
      });      
  
      // ChatRoom -> DirectMessages (1-N)
      ChatRoom.hasMany(models.DirectMessage, {
        foreignKey: 'chatroom_id',
        as: 'messages',
        onDelete: 'CASCADE'
      });
    };
  
    return ChatRoom;
  };
  