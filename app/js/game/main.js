'use strict';

require('craftyjs');
var enemy = require('./src/Enemy');
var Game = require('./game');
var TileMap = require('./src/map');
require('./src/component');
var Pathing = require('./src/ai_pathing');

var viewport = {
  w: 800,
  h: 600
};

var directions = {
  n:0,
  ne:45,
  e:90,
  se:135,
  s:180,
  sw:225,
  w:270,
  nw:315
};

Game.loadCharacter = function(char) {};

Game.saveCharacter = function(char) {};

Game.emitCharStatChange = function() {};

Game.start = function(initPlayerObj) {
  for (var k in initPlayerObj) {
    Game.player[k] = initPlayerObj[k];
  }
  Crafty.init();
  Game.defineScenes();
  Crafty.scene('init');
};

Game.defineScenes = function() {

  Crafty.defineScene('main', function() {

    Crafty.viewport.init(viewport.w, viewport.h);

    Crafty.background('#000');

    Crafty.viewport._clamp();
    Crafty.viewport.clampToEntities = false;

    Game.initMapAndEntities();
    Game.initPlayer();
  });

  Crafty.defineScene('init', function() {
    Crafty.viewport.init(viewport.w, viewport.h);
    Crafty.background('#000');
    console.log('init scene');
    Crafty.e('2D, Canvas, Mouse, HTML')
      .attr({x: (viewport.w - 100) / 2, y: (viewport.h - 30) / 2, h: 30, w: 100})
      .append('<button>Enter the depths.</button>')
      .bind('Click', function() {
        Crafty.scene('main');
      });
  });
};

var pTA = function(pixel) {
  var tileSize = Game.grid.tile.width;
  return Math.floor((pixel) / tileSize);
};

var heroArr = function() {
  var curr = Game.Hero.pos();
  return [pTA(curr._x), pTA(curr._y)];
};

var heroStat = function() {
  var stat = Game.Hero;
  return stat;
}

var detectDistance = function(pointA, pointB) {
  return Math.sqrt(Math.pow(pointB[0] - pointA[0], 2) + Math.pow(pointB[1] - pointA[1], 2));
};

var countdown = 1;

Game.initMapAndEntities = function() {

  //Generate Map
  TileMap.generateBlob();

  // Place All Entities
  for (var y = 0; y < Game.grid.width; y++) {
    for (var x = 0; x < Game.grid.height; x++) {
      var atEdge = x == 0 || x == Game.grid.width - 1 || y == 0 || y == Game.grid.height - 1;

      if (atEdge) {
        Crafty.e('LevelBounds').at(x, y);
      } else if (TileMap.tileMap[x][y] === 0) {
        Crafty.e('LevelBounds').at(x, y);
      } else if (TileMap.tileMap[x][y] === 1) {
        Crafty.e('Floor').at(x, y);
      }
    }
  }

  // Place Rocks and Water
  for (var y = 0; y < Game.grid.width; y++) {
    for (var x = 0; x < Game.grid.height; x++) {
      if (TileMap.tileMap[x][y] === 2) {
        Crafty.e('Floor').at(x, y);
        Crafty.e('StaticSprite').at(x, y);
      } else if (TileMap.tileMap[x][y] === 5) {
        Crafty.e('Water').at(x, y);
      }
    }
  }

  // Place Chests
  for (var y = 0; y < Game.grid.width; y++) {
    for (var x = 0; x < Game.grid.height; x++) {
      if (TileMap.tileMap[x][y] === 6) {
        Crafty.e('Floor').at(x, y);
        Crafty.e('Chest').at(x, y);
      }
    }
  }

  var levelItems = [];
  var enemies = [];
  for (var y = 0; y < Game.grid.width; y++) {
    for (var x = 0; x < Game.grid.height; x++) {
      if  (TileMap.tileMap[x][y] === 3) {
        Crafty.e('Floor').at(x, y);
        enemies.push(
          Crafty.e(enemy._getName()).at(x, y)
            .attr(enemy.spawn(Game.player.level).attributes)
            .attr({countdown: 1})
            .bind('NPCDeath', function() {
              var nItems = Crafty.rInt(0, 4);
              for (var i = 0; i < nItems; i++) {
                levelItems.push(
                  Crafty.e('cItem')
                    .at((this.x + Crafty.rInt(-32, 32)) / 32 + Crafty.rInt(-1, 1), (this.y + Crafty.rInt(-32, 32)) / 32 + Crafty.rInt(-1, 1))
                );
                levelItems[levelItems.length - 1].initStats(this.killedBy, 10);
              }
              Game.Hero.details.xp++;
            })
            .bind('EnterFrame', function() {
              if (detectDistance([pTA(this.x), pTA(this.y)], heroArr()) < 8) {
                if (!this.path) {
                  this.path = Pathing(TileMap.tileMap, [pTA(this.x), pTA(this.y)], heroArr())[1];
                  if (this.path) {
                    this.last = this.path[0];
                  }
                }
                if (this.countdown <= 0) {
                  this.path = Pathing(TileMap.tileMap, [pTA(this.x), pTA(this.y)], heroArr())[1];
                  if (!this.path) {
                    var pathy = this.last;
                    //this.rotation = directions.pathy;
                    this.move(this.last, 2);
                  } else if (this.path[0]) {
                    var pathy = this.path[0];
                    //this.rotation = directions.pathy;
                    this.move(this.path[0], 2);
                  }
                  this.countdown = 16;
                } else {
                  if (!this.path) {
                    var pathy = this.last;
                    //this.rotation = directions.pathy;
                    this.move(this.last, 2);
                  } else if (this.path[0]) {
                    var pathy = this.path[0]
                    //this.rotation = directions.pathy;
                    this.move(this.path[0], 2);
                  }
                  this.countdown -= 1;
                }
              }
            })
          );
      }
    }
  }
  Crafty.e('ExitPoint').at(TileMap.farthestFromOrigin[0], TileMap.farthestFromOrigin[1]);
};

Game.initPlayer = function() {
  Game.Hero = Crafty.e('PlayerCharacter').at(250, 250);
  Crafty.viewport.reload();
  Crafty.viewport.follow(Game.Hero, 0, 0);
};

Game.stop = function() {
  console.log('game stop called');
  Crafty.stop();
};

module.exports = Game.start;
