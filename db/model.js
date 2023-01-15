module.exports = (sequelize, DataTypes) => {
    const Videos = sequelize.define('videos', {
        video:{
            type:DataTypes.STRING,
            allowNull:false
        },
    })
    return Videos
}