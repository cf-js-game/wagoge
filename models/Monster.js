'use strict';

var mongoose = require('mongoose');

var monsterSchema = new mongoose.Schema({
  type: {type: String, default: 'Rat'},
  damage: {type: String, default: '1'},
  melee: {type: String, default: 'true'},
  hp: {type: String, default: '1'}
});

var monsterQSchema = new mongoose.Schema({
  hp: {type: String, default: '1'}
});

module.exports = mongoose.model('Monster', monsterSchema);
module.exports = mongoose.module('MonsterQ', monsterQSchema);
