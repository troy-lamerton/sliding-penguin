var game = new Phaser.Game(720, 480, Phaser.AUTO, 'gameContainer');

var player, ground, obstacles; 
var PlayingState = {
  preload: function () {
    game.load.image('background', 'assets/background.png');
    game.load.image('penguin', 'assets/penguin_0.png');
    game.load.image('ground', 'assets/ground.png');
    game.load.image('obstacle', 'assets/obstacle.png');

    game.load.image('heart', 'assets/heart.png');
    game.load.image('emptyHeart', 'assets/emptyHeart.png');

  },
  create: function () {
    game.togglePause = function () {
      game.physics.arcade.isPaused = (game.physics.arcade.isPaused) ? false : true;
    }

    game.physics.startSystem(Phaser.Physics.ARCADE);

    //background image
    game.add.image(0, 0, 'background');

    //add ground and make it solid
    ground = game.add.sprite(0,this.world.height - 80, 'ground');
    game.physics.arcade.enable(ground);
    ground.body.immovable = true;

    //Player physics setup
    player = game.add.sprite(45, 230, 'penguin');
    game.physics.arcade.enable(player);

    player.enableBody = true;
    player.body.gravity.y = 800;
    player.body.collideWorldBounds = true;

    player.jumpVelocity = -425;
    player.canDoubleJump = "wait";

    //Obstacle physics setup
    obstacles = game.add.group();
    obstacles.enableBody = true;
    obstacles.speed = -200;


    //Player health
    player.maxHealth = 5;
    player.currentHealth = player.maxHealth;

    player.generateHealth = function (maxHealth) {
      var heartSize = 32;
      var spacing = 12;
      var left = spacing;
      var top = 10;

      var healthArray = [];
      for (var i = 1; i <= player.maxHealth; i++) {
        var nextHeart = game.add.sprite(left + (i-1)*(spacing + heartSize), top, 'heart');
        nextHeart.width = heartSize;
        nextHeart.height = heartSize;
        healthArray.push(nextHeart);
      }
      return healthArray;
    }

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
    pauseKey.onDown.add(game.togglePause, this);

    player.health = player.generateHealth(player.maxHealth);

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
      player.body.y = 200;
      player.body.velocity.y = 0;

      player.currentHealth--;

      //replace the last heart with an empty one
      if (player.currentHealth >= 0){
        player.health[player.currentHealth].loadTexture('emptyHeart');
      };

      if (player.currentHealth === 0) {
        game.togglePause();

        displayFinalScore();
        game.time.events.add(Phaser.Timer.SECOND * 4, function () {
        game.state.start('menu');}, this);

        return;
      }

      obstacles.removeAll();
    }

    function displayFinalScore () {
      var scoreStyle = {font: "bold 16pt Arial", backgroundColor: "#FFF"}
      
      var gameOverText = game.add.text(game.world.width/2, game.world.height/2 - 40,
        "Game Over", scoreStyle);
      var scoreText = game.add.text(game.world.width/2, game.world.height/2,
        "Obstacles passed: " + obstacleCount, scoreStyle);


      scoreText.anchor.x = 0.5;
      scoreText.anchor.y = 1;
      gameOverText.anchor.x = 0.5;
      gameOverText.anchor.y = 1;
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
    
    function needMoreObstacles (prevBlock) {
      if (prevBlock !== undefined) {
        //dont add another block if the previous block will in be in the way
        //else if the previous block is almost off the screen, need more!
        if (prevBlock.x > 720 - prevBlock.width) return false;
        else if (prevBlock.x < game.world.width/5) return true;
        else return 'maybe';
      }
      else {
        previousBlock = false;
        return true;
      }
    }

    //Spawn a new obstacle
    function newObstacle (prevBlock, placeAtX) {
      if (!placeAtX) placeAtX = 720;

      var newBlock = obstacles.create(placeAtX, 407, 'obstacle');

      newBlock.body.immovable = true;
      newBlock.anchor.setTo(0,1);
      newBlock.scale.setTo(0.5 + Math.random()/2, 0.6 + Math.random()); //random width and height
      newBlock.body.velocity.x = obstacles.speed;

      obstacleCount++;

      //this is the first block, we're done creating it
      if (prevBlock === false) return;

      //If the previous block is nearby, make this one taller
      if (prevBlock.x > 720 - prevBlock.body.width * 2
        && prevBlock.x < 720 - prevBlock.body.width * 1.1) {
        newBlock.height += prevBlock.height * 0.8;
      }

    }

    var previousBlock = obstacles.children[obstacles.children.length-1];
    if (needMoreObstacles(previousBlock) === 'maybe') {
      if (Math.random()<0.01) {
        newObstacle(previousBlock);
      }
    }
    else if (needMoreObstacles(previousBlock)) {
      newObstacle(previousBlock);
    }

    if (obstacleCount === obstacleInterval && player.currentHealth !== 0) nextStage();


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