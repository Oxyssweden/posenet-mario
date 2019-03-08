
var game = new Phaser.Game(256, 240, Phaser.CANVAS, '', {
  preload: preload,
  create: create,
  update: update
}, false, false);

function preload() {
  game.load.spritesheet('tiles', 'https://res.cloudinary.com/harsay/image/upload/v1464614984/tiles_dctsfk.png', 16, 16);
  game.load.spritesheet('goomba', 'https://res.cloudinary.com/harsay/image/upload/v1464614984/goomba_nmbtds.png', 16, 16);
  game.load.spritesheet('mario', 'https://res.cloudinary.com/harsay/image/upload/v1464614984/mario_wjlfy5.png', 16, 16);
  game.load.spritesheet('coin', 'https://res.cloudinary.com/harsay/image/upload/v1464614984/coin_iormvy.png', 16, 16);

  game.load.tilemap('level', 'https://api.myjson.com/bins/3kk2g', null, Phaser.Tilemap.TILED_JSON);
}

function create() {
  Phaser.Canvas.setImageRenderingCrisp(game.canvas)
  game.scale.pageAlignHorizontally = true;
  game.scale.pageAlignVertically = true
  game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  game.physics.startSystem(Phaser.Physics.ARCADE);

  game.stage.backgroundColor = '#5c94fc';

  map = game.add.tilemap('level');
  map.addTilesetImage('tiles', 'tiles');
  map.setCollisionBetween(3, 12, true, 'solid');

  map.createLayer('background');

  layer = map.createLayer('solid');
  layer.resizeWorld();

  coins = game.add.group();
  coins.enableBody = true;
  map.createFromTiles(2, null, 'coin', 'stuff', coins);
  coins.callAll('animations.add', 'animations', 'spin', [0, 0, 1, 2], 3, true);
  coins.callAll('animations.play', 'animations', 'spin');

  goombas = game.add.group();
  goombas.enableBody = true;
  map.createFromTiles(1, null, 'goomba', 'stuff', goombas);
  goombas.callAll('animations.add', 'animations', 'walk', [0, 1], 2, true);
  goombas.callAll('animations.play', 'animations', 'walk');
  goombas.setAll('body.bounce.x', 1);
  goombas.setAll('body.velocity.x', -20);
  goombas.setAll('body.gravity.y', 500);

  player = game.add.sprite(16, game.world.height - 48, 'mario');
  game.physics.arcade.enable(player);
  player.body.gravity.y = 370;
  player.body.collideWorldBounds = true;
  player.animations.add('walkRight', [1, 2, 3], 10, true);
  player.animations.add('walkLeft', [8, 9, 10], 10, true);
  player.goesRight = true;

  game.camera.follow(player);

  cursors = game.input.keyboard.createCursorKeys();
}

function update() {
  game.physics.arcade.collide(player, layer);
  game.physics.arcade.collide(goombas, layer);
  game.physics.arcade.overlap(player, goombas, goombaOverlap);
  game.physics.arcade.overlap(player, coins, coinOverlap);

  if (player.body.enable) {
    player.body.velocity.x = 0;
    if (CONTROLS.left) {
      player.body.velocity.x = -90;
      player.animations.play('walkLeft');
      player.goesRight = false;
    } else if (CONTROLS.right) {
      player.body.velocity.x = 90;
      player.animations.play('walkRight');
      player.goesRight = true;
    } else {
      player.animations.stop();
      if (player.goesRight) player.frame = 0;
      else player.frame = 7;
    }

    if (CONTROLS.up && player.body.onFloor()) {
      player.body.velocity.y = -190;
      player.animations.stop();
    }

    if (player.body.velocity.y != 0) {
      if (player.goesRight) player.frame = 5;
      else player.frame = 12;
    }
  }
}

function coinOverlap(player, coin) {
  coin.kill();
}

function goombaOverlap(player, goomba) {
  if (player.body.touching.down) {
    goomba.animations.stop();
    goomba.frame = 2;
    goomba.body.enable = false;
    player.body.velocity.y = -80;
    game.time.events.add(Phaser.Timer.SECOND, function() {
      goomba.kill();
    });
  } else {
    player.frame = 6;

  }
}

var CONTROLS = {
  left: false,
  right: false,
  up: false,
};

var CALIBRATED = {
  nose: {y: 100},
}

window.gameInput = function(keypoints, minConfidence) {
  parts = {};
  if (keypoints) {
    for (let i = 0; i < keypoints.length; i++) {
      const keypoint = keypoints[i];

      if (keypoint.score < minConfidence) {
        continue;
      }

      const {y, x} = keypoint.position;
      const {part} = keypoint;
      parts[part] = keypoint.position;
    }

    CONTROLS.left = (!parts['rightEar']);
    CONTROLS.right = (!parts['leftEar']);

    CONTROLS.up = false;
    if (parts['nose'] && parts['nose'].y < (CALIBRATED.nose.y * 0.9)) {
      CONTROLS.up = true;
    }
    //let info = document.getElementById('info');
    //info.textContent = parts['nose'].y - CALIBRATED.nose.y;
  }

}

window.calibrate = function(keypoints, minConfidence) {
  parts = {};
  if (keypoints) {
    for (let i = 0; i < keypoints.length; i++) {
      const keypoint = keypoints[i];

      if (keypoint.score < minConfidence) {
        continue;
      }

      const {y, x} = keypoint.position;
      const {part} = keypoint;
      CALIBRATED[part] = keypoint.position;
    }
  }
}
