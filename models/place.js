'use strict';
module.exports = (sequelize, DataTypes) => {
  const place = sequelize.define('place', {
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    lat: DataTypes.NUMERIC,
    long: DataTypes.NUMERIC
  }, {});
  place.associate = function(models) {
    models.place.belongsToMany(models.traveler, {through: "placeTraveler"});
  };
  return place;
};