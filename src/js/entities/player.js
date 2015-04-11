var Player = function(game, x, y, colLayer) {

  var spriteStart = 0;

  Phaser.Sprite.call(this, game, x, y, 'Actor1', spriteStart);

  this.animations.add('down',   [spriteStart,    spriteStart   +1, spriteStart   +2], 10, true);
  this.animations.add('left',   [spriteStart+12, spriteStart+12+1, spriteStart+12+2], 10, true);
  this.animations.add('right',  [spriteStart+24, spriteStart+24+1, spriteStart+24+2], 10, true);
  this.animations.add('up',     [spriteStart+36, spriteStart+36+1, spriteStart+36+2], 10, true);

  this.colLayer = colLayer;

  game.add.existing(this);
  game.camera.follow(this);
  game.physics.arcade.enable(this);

  this.cursors = game.input.keyboard.createCursorKeys();
};

Player.prototype = Object.create(Phaser.Sprite.prototype);
Player.prototype.constructor = Player;

/**
 * Automatically called by World.update
 */
Player.prototype.update = function() {

  this.game.physics.arcade.collide(this, this.colLayer);

  this.body.velocity.x = 0;
  this.body.velocity.y = 0;

  var speed = 300;

  if(this.cursors.left.isDown) {
    this.body.velocity.x = -speed;
    this.play('left');

  } else if(this.cursors.right.isDown) {
    this.body.velocity.x = speed;
    this.play('right');

  } else if(this.cursors.up.isDown) {
    this.body.velocity.y = -speed;
    this.play('up');

  } else if(this.cursors.down.isDown) {
    this.body.velocity.y = speed;
    this.play('down');

  } else {
    this.animations.stop();
  }
};

module.exports = Player;
