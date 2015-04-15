var Preloader = function () {
  this.asset = null;
  this.ready = false;
};

module.exports = Preloader;

Preloader.prototype = {

  preload: function () {
    this.asset = this.add.sprite(320, 240, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);

    this.load.image('DungeonA2', 'assets/sprites/tiles/Dungeon_A2.png');
    this.load.image('WorldA2', 'assets/sprites/tiles/World_A2.png');

    this.load.spritesheet('Actor1', 'assets/sprites/characters/Actor1.png', 32, 32);
    //this.load.spritesheet('Actor2', 'assets/sprites/characters/Actor2.png', 32, 32);
    //this.load.spritesheet('Actor3', 'assets/sprites/characters/Actor3.png', 32, 32);
    //this.load.spritesheet('Actor4', 'assets/sprites/characters/Actor4.png', 32, 32);

    //this.load.spritesheet('Damage1', 'assets/sprites/characters/Damage1.png', 32, 32);
    //this.load.spritesheet('Damage2', 'assets/sprites/characters/Damage2.png', 32, 32);
    //this.load.spritesheet('Damage3', 'assets/sprites/characters/Damage3.png', 32, 32);
    //this.load.spritesheet('Damage4', 'assets/sprites/characters/Damage4.png', 32, 32);
  },

  create: function () {
    this.asset.cropEnabled = false;
  },

  update: function () {
    if (!!this.ready) {
      this.game.state.start('Menu');
    }
  },

  onLoadComplete: function () {
    this.ready = true;
  }
};
