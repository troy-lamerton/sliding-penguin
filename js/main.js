var game = new Phaser.Game(640, 400, Phaser.AUTO, 'gameContainer');

var PlayingState = {
  preload: function () {

  },
  create: function () {

  },
  update: function () {

  }
};

game.state.add('Playing', PlayingState);
game.state.start('Playing');