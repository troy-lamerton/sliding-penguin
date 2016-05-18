var game = new Phaser.Game(640, 400, Phaser.AUTO, 'gameContainer');

var PlayingState = {
  preload: function () {
    game.load.image('penguin', 'assets/images/penguin_0.png');
  },
  create: function () {
    game.add.sprite(0, 0, 'penguin');
  },
  update: function () {
    
  }
};

game.state.add('Playing', PlayingState);
game.state.start('Playing');