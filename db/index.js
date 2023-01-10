const { Sequelize, DataTypes } = require('sequelize')

const sequelize = new Sequelize('video-app', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    pool: { max: 5, min:0 },
    logging:false,
    database:'video-app',
});

sequelize.authenticate().then(() => console.log('connected')).catch(err => console.log(err))

const db = {}
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.videos = require('./model')(sequelize, DataTypes)

db.sequelize.sync({force:false}).then(() => {
    console.log('Synced')
})
.catch(err => {
    console.log(err)
})

module.exports = db;