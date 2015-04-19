var Player = require('../entities/player');
var MapGenerator = require('../generators/scenariomap');
var TileDef = require('../spritedefs/tile');

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

var map = new MapGenerator(_.extend(pregens.openworld1, {worldWidth: 30, worldHeight: 30, distanceReq: {keep: 5}}));

var numToSprite = function(map, x, y, num, width = 32) {
  switch(num) {
    case 3: return (width*6)-2;
    case 6: return (width*3)-2;
    case 7: return
  }
};

Game.prototype = {

  preload: function() {
    this.game.load.tilemap('world', null, map.toCSV(), Phaser.Tilemap.CSV);
  },

  create: function () {

    var tilemap = this.game.add.tilemap('world');
    tilemap.addTilesetImage('DungeonA2', 'DungeonA2', 16, 16);
    tilemap.addTilesetImage('WorldA2', 'WorldA2', 16, 16, 0, 0, 768);

    var terrainLayer = tilemap.create('terrain', map.worldWidth*2, map.worldHeight*2, 16, 16);
    terrainLayer.resizeWorld();

    var collisionLayerObj = tilemap.createBlankLayer('collision', map.worldWidth*2, map.worldHeight*2, 16, 16);
    collisionLayerObj.callbacks = []; //necessary I guess, probably should bug report this

    var lowerLayer = [];

    (function() {
      for(var x = 0; x < map.worldWidth*2; x++) {
        lowerLayer[x] = [];
      }
    })();

    (function() {
      for(var x = 0; x < map.worldWidth*2; x+=2) {
        for(var y = 0; y < map.worldHeight*2; y+=2) {
          lowerLayer[y][x]    = new Phaser.Tile('terrain', 6, x, y, 16, 16);
          lowerLayer[y][x+1]  = new Phaser.Tile('terrain', 7, x+1, y, 16, 16);
          lowerLayer[y+1][x]  = new Phaser.Tile('terrain', 6+32, x, y+1, 16, 16);
          lowerLayer[y+1][x+1]= new Phaser.Tile('terrain', 7+32, x+1, y+1, 16, 16);
        }
      }
    })();

    tilemap.layers[0].data = lowerLayer;

    //tilemap.createBlankLayer('niceties', map.worldWidth*2, map.worldHeight*2, 16, 16);

    var spawnx = 0;
    var spawny = 0;

    for(var x = 0; x < map.worldWidth*2; x+=2) {
      for(var y = 0; y < map.worldHeight*2; y+=2) {

        var hx = x/2;
        var hy = y/2;

        switch(map.world[hx][hy]) {
          case 4:
            tilemap.layers[1].data[y][x] = new Phaser.Tile(collisionLayerObj, 768 + 30, x, y, 16, 16);
            tilemap.layers[1].data[y][x + 1] = new Phaser.Tile(collisionLayerObj, 768 + 31, x + 1, y, 16, 16);
            tilemap.layers[1].data[y + 1][x] = new Phaser.Tile(collisionLayerObj, 768 + 30 + 32, x, y + 1, 16, 16);
            tilemap.layers[1].data[y + 1][x + 1] = new Phaser.Tile(collisionLayerObj, 768 + 31 + 32, x + 1, y + 1, 16, 16);
            break;

          default:
            spawnx = x/2;
            spawny = y/2;
            break;
        }

      }
    }

    //TODO possibly, calculate all changes and store in a separate 2d array
    //then apply them with another loop
    //yay loops
    (function() {
      for(var x = 0; x < map.worldWidth*2; x+=2) {
        for (var y = 0; y < map.worldHeight * 2; y += 2) {

          switch (map.world[x / 2][y / 2]) {
            case 4:

              //var start = (map.world[hx][hy+1] === 4) * 1 +
              //    (map.world[hx+1][hy] === 4) * 2 +
              //    (map.world[hx][hy-1] === 4) * 4 +
              //    (map.world[hx-1][hy] === 4) * 8;

              //tilemap.layers[1].data[y][x].index = 100;
              //tilemap.layers[1].data[y][x+1].index = 100;
              //tilemap.layers[1].data[y+1][x].index = 100;
              //tilemap.layers[1].data[y+1][x+1].index = 100;
              break;

            default:
              spawnx = x / 2;
              spawny = y / 2;
              break;
          }

        }
      }
    })();

    tilemap.setCollision([768+30, 768+31, 768+30+32, 768+31+32], true, 'collision');

    this.testentity = new Player(this.game, spawnx*32, spawny*32, collisionLayerObj);

  },

  update: function () {
  }
};
