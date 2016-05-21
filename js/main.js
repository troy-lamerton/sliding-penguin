var game = new Phaser.Game(720, 480, Phaser.AUTO, 'gameContainer');
var player, ground, obstacles; 
var PlayingState = {
  preload: function () {
    game.load.image('background', 'assets/background.png');
    game.load.image('penguin', 'assets/penguin_0.png');
    game.load.image('ground', 'assets/ground.png');
    game.load.image('obstacle', 'assets/obstacle.png');

  },
  create: function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    game.add.image(0, 0, 'background');

    //add ground and make it solid
    ground = game.add.sprite(0,this.world.height - 80, 'ground');
    game.physics.arcade.enable(ground);
    ground.body.immovable = true;

    //Player physics
    player = game.add.sprite(45, 230, 'penguin');
    game.physics.arcade.enable(player);

    player.enableBody = true;
    player.body.bounce.y = 0.1;
    player.body.gravity.y = 600;
    player.body.collideWorldBounds = true;

    player.jumpVelocity = -350;
    player.canDoubleJump = "wait";

    //Obstacle physics
    obstacles = game.add.group();
    obstacles.enableBody = true;

    //arrow keys input
    cursors = game.input.keyboard.createCursorKeys();

    //Adding other variables
    player.health = 6;
  },
  update: function () {
    game.physics.arcade.collide(player, ground);
    game.physics.arcade.collide(player, obstacles, this.noPushing);

    this.noPushing = function (player, obstacle) {
      player.body.x -= obstacle.body.x - obstacle.body.prev.x;
      player.body.velocity.x =0;//-= obstacle.body.velocity.x;
    }

    //player is hitting anything on its right
    if (player.body.touching.right) {
      takeDamage();
    }
    function takeDamage () {
      //player has hit something
      player.body.y = 100;
      player.health--;

      player.body.gravity.y = 600;
    }

    // Allow the player to jump if they are on top of something.
    if (cursors.up.isDown && player.body.touching.down) {
        player.body.velocity.y = player.jumpVelocity;
        player.canDoubleJump = "jumped once";
    }
    else if (cursors.up.isUp && player.canDoubleJump === "jumped once") {
      //Player has jumped and released key
      player.canDoubleJump = "ready";
    }
    else if (cursors.up.isDown && player.canDoubleJump === "ready") {
      //Double jump!
      player.body.velocity.y = player.jumpVelocity * 0.8;
      player.canDoubleJump = "wait";
    }
    else if (cursors.right.isDown) {
      player.x += 10;
    }

    //generate a new obstacle
    if (Math.random()<0.01) {
      var newBlock = obstacles.create(700, 405, 'obstacle');

      newBlock.body.immovable = true;
      newBlock.anchor.setTo(0,1);
      newBlock.scale.setTo(0.5 + Math.random()/2, 0.7 + Math.random()/2); //random width and height
      newBlock.body.velocity.x = -300;
    }
    
  }
};

game.state.add('Playing', PlayingState);
game.state.start('Playing');