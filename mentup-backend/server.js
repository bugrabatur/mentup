require('dotenv').config(); // .env dosyasını yükler
const app = require('./src/app');
const sequelize = require('./src/config/database'); // Sequelize bağlantı dosyanız
const db = require('./src/models'); // Model dosyanız
const PORT = process.env.PORT || 5001; // .env dosyasındaki PORT'u kullanır

// Veritabanını senkronize et
(async () => {
    try {
        await sequelize.sync({ alter: true }); // force: true tüm tabloları sıfırlar, dikkatli kullanın
        console.log('Database synchronized successfully.');
        
        // Sunucuyu başlat
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error synchronizing the database:', error);
    }
})();
