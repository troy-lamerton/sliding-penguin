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

    function togglePause() {
      game.physics.arcade.isPaused = (game.physics.arcade.isPaused) ? false : true;
    }


    game.physics.startSystem(Phaser.Physics.ARCADE);

    //background image
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
    player.body.gravity.y = 800;
    player.body.collideWorldBounds = true;

    player.jumpVelocity = -425;
    player.canDoubleJump = "wait";

    //Obstacle physics
    obstacles = game.add.group();
    obstacles.enableBody = true;
    obstacles.speed = -200;


    //Adding other variables
    player.health = 6;
    var graphics = game.add.graphics(100, 100);
    healthBar = new Phaser.Rectangle(20, 2, 300, 40);
    graphics.beginFill(0xFF700B, 1);
    graphics.drawRect(healthBar);
    graphics.endFill();

    // stage controls speed of obstacles
    stage = 1;
    obstacleInterval = 6; //Increase stage after spawning this many obstacles.
    obstacleCount = 0;
    // Display stage
    var hudStyle = {font: "bold 16pt Arial"}
    stageText = game.add.text(this.world.width/2, 9, stage, hudStyle);
    stageText.anchor.setTo(0.5,0);
    stageText.text = "Stage: " + stage;

    //arrow keys input
    cursors = game.input.keyboard.createCursorKeys();
    // Extra keys
    spaceKey = this.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    pauseKey = this.input.keyboard.addKey(Phaser.Keyboard.P);
    pauseKey.onDown.add(togglePause, this);
  },

  update: function () {
    game.physics.arcade.collide(player, ground);
    game.physics.arcade.collide(player, obstacles, this.noPushing);

    this.noPushing = function (player, obstacle) {
      player.body.x -= obstacle.body.x - obstacle.body.prev.x;
      player.body.velocity.x = 0;
    }

    //player is hitting anything on its right
    if (player.body.touching.right) {
      takeDamage();
    }
    function takeDamage () {
      //player has hit something
      player.health--;
      player.body.y = 300;
      player.body.velocity.y = 0;

      obstacles.removeAll();
    }
    function jumpKeyDown () {
      return (cursors.up.isDown || spaceKey.isDown);
    }
    function jumpKeyUp () {
      return (cursors.up.isUp && spaceKey.isUp);
    }
    // Allow the player to jump if they are on top of something.
    if (jumpKeyDown() && player.body.touching.down) {
        player.body.velocity.y = player.jumpVelocity;
        player.canDoubleJump = "jumped once";
    }
    else if (jumpKeyUp() && player.canDoubleJump === "jumped once") {
      //Player has jumped and released key
      player.canDoubleJump = "ready";
    }
    else if (jumpKeyDown() && player.canDoubleJump === "ready") {
      //Double jump!
      player.body.velocity.y = player.jumpVelocity * 0.8;
      player.canDoubleJump = "wait";
    }
    
    //Spawn a new obstacle
    function newObstacle () {
      var newBlock = obstacles.create(720, 405, 'obstacle');

      newBlock.body.immovable = true;
      newBlock.anchor.setTo(0,1);
      newBlock.scale.setTo(0.5 + Math.random()/2, 0.7 + Math.random()/2); //random width and height
      newBlock.body.velocity.x = obstacles.speed;
      obstacleCount++;
    }
    
    if (Math.random()<0.01) {
      newObstacle();
      if (obstacleCount === obstacleInterval) nextStage();
    }

    function nextStage () {
      obstacles.speed -= 30 + (stage/3 * 25);
      stage++;
      stageText.text = "Stage: " + stage;

      if (obstacles.speed > game.world.width) {
        // keep the speed low enough to be playable
        obstacles.speed = game.world.width;
      }
      obstacleCount = 0;
    }
  }
};

game.state.add('playing', PlayingState);
game.state.add('menu', menuState);

game.state.start('menu');