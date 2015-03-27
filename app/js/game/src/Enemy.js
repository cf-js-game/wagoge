'use strict';

var Monster = function() {
  this._random = function() {
    return Math.floor(Math.random() * 3);
  };
  this._getName = function(){
    var random = this._random();
    return random === 0 ? 'Rat': random === 1 ? 'Skeleton' : 'Slime';
  };
  this.spawn = function(lvl) {
    var monster = {};

    monster.name = this._getName();
    monster.level = lvl;
    monster.atributes = {
      "damage": Math.floor(2 + lvl * 0.636363),
      "speed": 2 + lvl * 0.020202,
      "hp": Math.floor(30 + lvl * 6.262626),
      "range": 1
    };

    return monster;
  };
};

module.exports = Monster;