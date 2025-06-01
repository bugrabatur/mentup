module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, set(value) { this.setDataValue('name', value.trim());}, allowNull: false },
      surname: { type: DataTypes.STRING, set(value) { this.setDataValue('surname', value.trim());}, allowNull: false },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      role: {
        type: DataTypes.ENUM('mentor', 'mentee', 'admin'),
        allowNull: false,
      }
    }, {
      tableName: 'users',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    });
  
    User.associate = (models) => {
      User.hasOne(models.Profile, {
        foreignKey: 'user_id',
        onDelete: 'CASCADE',
        as: 'profile',
      });
  
      User.belongsToMany(models.Skill, {
        through: models.MentorSkill,
        foreignKey: 'mentor_id',
        as: 'skills',
      });
  
      User.hasMany(models.Appointment, {
        foreignKey: 'mentor_id',
        as: 'MentorAppointments',
      });
  
      User.hasMany(models.Appointment, {
        foreignKey: 'mentee_id',
        as: 'MenteeAppointments',
      });

      User.hasMany(models.Document, {
        foreignKey: 'user_id',
        as: 'documents',
      });

      // User <-> ChatRoom (many-to-many)
      User.belongsToMany(models.ChatRoom, {
        through: 'chatroom_users',
        foreignKey: 'user_id',
        otherKey: 'chatroom_id',
        as: 'chatrooms',
        onDelete: 'CASCADE'
      });

      // User -> SentMessages (1-N)
      User.hasMany(models.DirectMessage, {
        foreignKey: 'sender_id',
        as: 'sentMessages',
        onDelete: 'CASCADE'
      });

    };
  
    return User;
  };