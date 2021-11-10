import * as Phaser from "phaser";
console.log("Phaser", Phaser);

let platforms, keyboard;
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let jumpsAvailable = 0;
let jumping = false;
let jumpLock = false;
let leftMouse = false;
let rightMouse = false;
let boosting = false;
let boostAvailable = true;
let bullets;

export default class Demo extends Phaser.Scene {
  constructor() {
    super("demo");
  }

  preload() {
    this.load.image("platform", "assets/platform.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    bullets = new Bullets(this);

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
    this.input.mouse.onMouseDown((e) => console.log("mouseDown", e));
    this.input.mouse.onMouseUp((e) => console.log("mouseUp", e));
  }

  update() {
    if (this.input.mousePointer.leftButtonDown() && !leftMouse) {
      leftMouse = true;
      let toX = this.input.mousePointer.x;
      let toY = this.input.mousePointer.y;
      console.log("mouse left", toX, toY);
      this.time.addEvent({ delay: 250, callback: () => (leftMouse = false) });
      let x = toX - player.x;
      let y = toY - player.y;
      let v = new Phaser.Math.Vector2(x, y).normalize();
      bullets.fireBullet(player.x, player.y, v);
    }
    if (this.input.mousePointer.rightButtonDown() && !rightMouse) {
      rightMouse = true;
      let x = this.input.mousePointer.x;
      let y = this.input.mousePointer.y;
      console.log("mouse right", x, y);
      this.time.addEvent({ delay: 250, callback: () => (rightMouse = false) });
    }
    if (keyboard.shift.isDown && !boosting && boostAvailable) {
      boosting = true;
      boostAvailable = false;
      this.time.addEvent({ delay: 1000, callback: () => (boosting = false) });
      this.time.addEvent({
        delay: 3000,
        callback: () => (boostAvailable = true),
      });
    }

    if (keyboard.d.isDown) {
      if (boosting) {
        player.setVelocityX(400);
      } else {
        player.setVelocityX(200);
      }
      player.anims.play("right", true);
    } else if (keyboard.a.isDown) {
      if (boosting) {
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

class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, "bullet");
  }

  fire(fromX, fromY, v) {
    this.body.reset(fromX, fromY);

    this.setActive(true);
    this.setVisible(true);

    this.setVelocity(300 * v.x, 300 * v.y);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.y <= -32) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

class Bullets extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene, { allowGravity: false });

    this.createMultiple({
      frameQuantity: 10,
      key: "bullet",
      active: false,
      visible: false,
      classType: Bullet,
    });
  }

  fireBullet(fromX, fromY, v) {
    let bullet = this.getFirstDead(false);

    if (bullet) {
      bullet.fire(fromX, fromY, v);
    }
  }
}
