module.exports = (sequelize, DataTypes) => {
    const ChatRoomUser = sequelize.define('ChatRoomUser', {
      chatroom_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      }
    }, {
      tableName: 'chatroom_users',
      timestamps: false
    });
  
    return ChatRoomUser;
  };
  