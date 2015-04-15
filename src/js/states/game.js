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

var map = new MapGenerator(_.extend(pregens.openworld1, {worldWidth: 24, worldHeight: 24, distanceReq: {keep: 5}}));

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

    var lowerLayer = [];
    var collisionLayer = [];

    (function() {
      for(var x = 0; x < map.worldWidth*2; x++) {
        lowerLayer[x] = [];
        collisionLayer[x] = [];
      }
    })();

    (function() {
      for(var x = 0; x < map.worldWidth*2; x+=2) {
        for(var y = 0; y < map.worldHeight*2; y+=2) {
          lowerLayer[x][y]    = new Phaser.Tile('terrain', 6, x, y, 16, 16);
          lowerLayer[x][y+1]  = new Phaser.Tile('terrain', 7, x, y+1, 16, 16);
          lowerLayer[x+1][y]  = new Phaser.Tile('terrain', 6+32, x+1, y, 16, 16);
          lowerLayer[x+1][y+1]= new Phaser.Tile('terrain', 7+32, x+1, y+1, 16, 16);
        }
      }
    })();

    tilemap.layers[0].data = lowerLayer;

    //tilemap.createBlankLayer('niceties', map.worldWidth*2, map.worldHeight*2, 16, 16);

    var spawnx = 0;
    var spawny = 0;

    for(var x = 0; x < map.worldWidth*2; x+=2) {
      for(var y = 0; y < map.worldHeight*2; y+=2) {

        switch(map.world[x/2][y/2]) {
          case 4:
            collisionLayer[x][y]    = new Phaser.Tile(collisionLayerObj, 768+30, x, y, 16, 16);
            collisionLayer[x][y+1]  = new Phaser.Tile(collisionLayerObj, 768+31, x, y+1, 16, 16);
            collisionLayer[x+1][y]  = new Phaser.Tile(collisionLayerObj, 768+30+32, x+1, y, 16, 16);
            collisionLayer[x+1][y+1]= new Phaser.Tile(collisionLayerObj, 768+31+32, x+1, y+1, 16, 16);

            collisionLayer[x][y].setCollision(true, true, true, true);
            collisionLayer[x][y+1].setCollision(true, true, true, true);
            collisionLayer[x+1][y].setCollision(true, true, true, true);
            collisionLayer[x+1][y+1].setCollision(true, true, true, true);

            //tilemap.putTile(768+30, x, y, 'collision');
            //tilemap.putTile(768+31, x+1, y, 'collision');
            //tilemap.putTile(768+30+32, x, y+1, 'collision');
            //tilemap.putTile(768+31+32, x+1, y+1, 'collision');
            break;

          default:
            spawnx = x/2;
            spawny = y/2;
            break;
        }

      }
    }

    tilemap.layers[1].data = collisionLayer;

    //causes an error!
    //tilemap.setCollision([768+30, 768+31, 768+30+32, 768+31+32], true, 'collision', true);

    this.testentity = new Player(this.game, spawnx*32, spawny*32, collisionLayerObj);

  },

  update: function () {
  }
};
