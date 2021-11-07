import * as Phaser from "phaser";
console.log("Phaser", Phaser);

let platforms, keyboard;
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let jumpsAvailable = 0;
let jumping = false;
let jumpLock = false;

export default class Demo extends Phaser.Scene {
  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("platform", "assets/platform.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    platforms = this.physics.add.staticGroup();
    platforms.create(400, 600, "platform").setScale(2).refreshBody();

    player = this.physics.add.sprite(100, 450, "dude");
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    //  Input Events
    keyboard = this.input.keyboard.addKeys("w,a,s,d,f,space,shift");
    console.log("keyboard", keyboard);
    this.physics.add.collider(player, platforms);
  }

  update() {
    // if (this.input.mousePointer.leftButtonDown()) {
    //   console.log("mouse left");
    // }
    // if (this.input.mousePointer.rightButtonDown()) {
    //   console.log("mouse right");
    // }
    if (keyboard.d.isDown) {
      if (keyboard.shift.isDown) {
        player.setVelocityX(400);
      } else {
        player.setVelocityX(200);
      }
      player.anims.play("right", true);
    } else if (keyboard.a.isDown) {
      if (keyboard.shift.isDown) {
        player.setVelocityX(-400);
      } else {
        player.setVelocityX(-200);
      }
      player.anims.play("right", true);
    } else {
      player.setVelocityX(0);
      player.anims.play("turn");
    }

    if (player.body.touching.down) {
      jumpsAvailable = 2;
      jumping = false;
      jumpLock = false;
    }
    if (jumping && keyboard.space.isUp && !jumpLock) {
      jumpsAvailable -= 1;
      jumpLock = true;
    }

    if (Phaser.Input.Keyboard.JustDown(keyboard.space) && jumpsAvailable > 0) {
      jumping = true;
      jumpLock = false;
      player.setVelocityY(-500);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  backgroundColor: "#1166AA",
  width: 1024,
  height: 768,
  scene: Demo,
  parent: "phaser",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 900 },
      debug: true,
    },
  },
};

const game = new Phaser.Game(config);
