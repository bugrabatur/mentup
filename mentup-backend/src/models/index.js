require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USER,
    process.env.PG_PASSWORD,
    {
      host: 'localhost',
      port: process.env.PG_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
);
  

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Skill = require('./skill')(sequelize, DataTypes);
db.MentorSkill = require('./mentorSkill')(sequelize, DataTypes);
db.Appointment = require('./appointment')(sequelize, DataTypes);
db.Review = require('./review')(sequelize, DataTypes);          // 🟢 Bunu EKLE
db.Message = require('./message')(sequelize, DataTypes);
db.Document = require('./document')(sequelize, DataTypes);
db.Profile = require('./profile')(sequelize, DataTypes);
db.User = require('./User')(sequelize, DataTypes); // EN SON
db.Mentor = require('./mentors')(sequelize, DataTypes); // 🟢 Bunu EKLE
const AvailabilitySlot = require('./availabilitySlot')(sequelize, DataTypes);
db.AvailabilitySlot = AvailabilitySlot;
db.ChatRoom = require('./chatroom')(sequelize, DataTypes);
db.ChatRoomUser = require('./chatroomuser')(sequelize, DataTypes);
db.DirectMessage = require('./directmessage')(sequelize, DataTypes);
db.DiplomaRegistry = require('./diplomaRegistry')(sequelize, Sequelize.DataTypes),


// models/index.js içinde:


// 🔴 EN SON User gelsin çünkü diğerlerine bağlı
db.User = require('./User')(sequelize, DataTypes);

// İlişkileri çalıştır
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Debug amaçlı model kontrolü
console.log("✅ Yüklenen modeller:", Object.keys(db));

module.exports = db;
