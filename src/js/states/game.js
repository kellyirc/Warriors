var Player = require('../entities/player');
var MapGenerator = require('../generators/scenariomap');

var pregens = {
  openworld1: {
    birthLimit: 4,
    deathLimit: 4,
    wallChance: 0.4,
    numberOfSteps: 10
  },
  openworld2: {
    birthLimit: 4,
    deathLimit: 4,
    wallChance: 0.3,
    numberOfSteps: 2
  },
  caveish1: {
    birthLimit: 4,
    deathLimit: 4,
    wallChance: 0.5,
    numberOfSteps: 3
  },
  caveish2: {
    birthLimit: 3,
    deathLimit: 3,
    wallChance: 0.3,
    numberOfSteps: 2
  },
  cave1: {
    birthLimit: 4,
    deathLimit: 3,
    wallChance: 0.5,
    numberOfSteps: 10
  }
};

var Game = function () {
  this.testentity = null;
};

module.exports = Game;

var map = new MapGenerator(_.extend(pregens.openworld1));

Game.prototype = {

  preload: function() {
    this.game.load.tilemap('world', null, map.toCSV(), Phaser.Tilemap.CSV);
  },

  create: function () {

    var tilemap = this.game.add.tilemap('world');
    console.log(tilemap);
    tilemap.addTilesetImage('DungeonA2', 'DungeonA2');
    tilemap.addTilesetImage('WorldA2', 'WorldA2', 32, 32, 0, 0, 192);

    var terrainLayer = tilemap.create('terrain', map.worldWidth, map.worldHeight, 32, 32);
    terrainLayer.resizeWorld();

    var lowerLayer = [];

    (function() {
      for(var x = 0; x < map.worldWidth; x++) {
        lowerLayer[x] = [];
        for(var y = 0; y < map.worldHeight; y++) {
          lowerLayer[x][y] = new Phaser.Tile(tilemap.layers[0], 3, x, y, 32, 32);
        }
      }
    })();

    tilemap.layers[0].data = lowerLayer;

    var collisionLayerObj = tilemap.createBlankLayer('collision', map.worldWidth, map.worldHeight, 32, 32);

    var spawnx = 0;
    var spawny = 0;

    //var collisionLayer = [];

    for(var x = 0; x < map.worldWidth; x++) {
      //collisionLayer[x] = [];
      for(var y = 0; y < map.worldHeight; y++) {
        if(map.world[x][y] !== 207) {
          spawnx = x;
          spawny = y;
          continue;
        }
        //collisionLayer doesn't work for some reason so oh well
        //collisionLayer[x][y] = new Phaser.Tile(tilemap.layers[1], 207, x, y, 32, 32);
        tilemap.putTile(207, x, y, 'collision');
      }
    }

    //tilemap.layers[1].data = collisionLayer;

    tilemap.setCollision(207);

    this.testentity = new Player(this.game, spawnx*32, spawny*32, collisionLayerObj);
    this.testentity.anchor.setTo(0.5, 0.5);

  },

  update: function () {
  }
};
