var game = new Phaser.Game(720, 480, Phaser.AUTO, 'gameContainer');
var player, ground, obstacles;
var PlayingState = {
  preload: function () {
    game.load.image('background', 'assets/background.png');
    game.load.image('penguin', 'assets/penguin_0.png');
    game.load.image('ground', 'assets/ground.png');
  },
  create: function () {
    
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.add.image(0, 0, 'background');


    ground = game.add.sprite(0,400, 'ground');
    game.physics.arcade.enable(ground);
    ground.body.immovable = true;

    player = game.add.sprite(45, 230, 'penguin');
    game.physics.arcade.enable(player);

    player.enableBody = true;
    player.body.bounce.y = 0.1;
    player.body.gravity.y = 300;
    player.body.collideWorldBounds = true;

    game.world.angle += 7;
  },
  update: function () {
    game.physics.arcade.collide(player, ground);
  }
};

game.state.add('Playing', PlayingState);
game.state.start('Playing');