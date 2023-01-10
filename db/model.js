module.exports = (sequelize, DataTypes) => {
    const Videos = sequelize.define('videos', {
        // name: {
        //     type: DataTypes.STRING,
        //     allowNull:false
        // },
        video:{
            type:DataTypes.STRING,
            allowNull:false
        },
    })
    return Videos
}