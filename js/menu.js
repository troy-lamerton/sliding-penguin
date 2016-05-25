var menuState = {
  preload: function () {
    //load startmenu image
    game.load.image('menu', 'assets/startMenu.png');
  },  

  create: function () {
    game.add.image(0, 0, 'menu');


    var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACE);

    spaceKey.onDown.addOnce(this.play, this);
  },

  play: function () {
    game.state.start('playing');
  }
};