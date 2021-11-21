import * as Phaser from "phaser";
// console.log("Phaser", Phaser);

let platforms: Phaser.Physics.Arcade.StaticGroup;
let keyboard;
let player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
let jumpsAvailable = 0;
let jumping = false;
let jumpLock = false;
let leftMouse = false;
let rightMouse = false;
let boosting = false;
let boostAvailable = true;
let bullets;
let god = false;
let hitPoints = 3;
let gameOver = false;
let txtGameOver: Phaser.GameObjects.Text;
let mobs: Phaser.Physics.Arcade.Group;

export default class Game extends Phaser.Scene {
  constructor() {
    super("game");
  }

  preload() {
    this.load.image("platform", "assets/platform.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.physics.world.setBounds(0, 0, 1024, 768);
    bullets = new Bullets(this);

    platforms = this.physics.add.staticGroup();
    const ground = platforms
      .create(1000, 700, "platform")
      .setScale(4, 1)
      .refreshBody();

    const p1 = platforms.create(700, 500, "platform");

    this.add.text(1000, 300, "1000px", { color: "white" });
    this.add.text(2000, 300, "2000px", { color: "white" });
    this.add.text(3000, 300, "3000px", { color: "white" });
    this.add.text(4000, 300, "4000px", { color: "white" });
    this.add.text(5000, 300, "4000px", { color: "white" });

    txtGameOver = this.add
      .text(100, 100, "Game Over!", { fontSize: "26px" })
      .setVisible(false);

    player = this.physics.add.sprite(200, 400, "dude");
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setCollideWorldBounds(true, 0, 0, true);

    this.physics.world.on("worldbounds", (a, b) => {
      if (a.checkCollision.down) hitPoints = 0;
    });

    // this.cameras.main.setBounds(-100, -100, 5000, 5000);
    this.cameras.main.startFollow(player);

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

    mobs = this.physics.add.group({ allowGravity: false });

    //  Input Events
    keyboard = this.input.keyboard.addKeys("w,a,s,d,f,g,space,shift");
    // console.log("keyboard", keyboard);
    this.physics.add.collider(player, platforms);

    this.physics.add.collider(bullets, platforms, (b) => {
      b.body.gameObject.setActive(false);
      b.body.gameObject.setVisible(false);
    });

    this.physics.add.collider(bullets, mobs, (b, m) => {
      b.body.gameObject.setActive(false);
      b.body.gameObject.setVisible(false);
      m.body.gameObject.setActive(false);
      m.body.gameObject.setVisible(false);
      m.destroy();
    });
    this.physics.add.collider(mobs, platforms, (m) => {
      m.body.gameObject.setActive(false);
      m.body.gameObject.setVisible(false);
      m.destroy();
    });

    this.physics.add.collider(player, mobs, (p, m) => {
      console.log("collide");
      m.body.gameObject.setActive(false);
      m.body.gameObject.setVisible(false);
      m.destroy();
      hitPoints -= 1;
      console.log("hitPoints", hitPoints);
    });

    this.time.addEvent({
      delay: 5000,
      loop: true,
      callback: () => {
        console.log("spawn");
        let mob = mobs.create(300, 300, "bomb");
        mob.setScale(2, 2);
        mob.setCollideWorldBounds(true);
        let x = mob.x - player.x;
        let y = mob.y - player.y;
        let v = new Phaser.Math.Vector2(x, y).normalize();
        mob.setVelocity(-100 * v.x, -100 * v.y);
      },
    });
  }

  update() {
    if (hitPoints <= 0) {
      gameOver = true;
    }
    if (gameOver) {
      txtGameOver.setVisible(true);
      this.physics.pause();
      return;
    }
    const worldView = this.cameras.main.worldView;
    txtGameOver.setPosition(worldView.x + 400, worldView.y + 200);
    // console.log(this.cameras.main.worldView);
    if (this.input.mousePointer.leftButtonDown() && !leftMouse) {
      leftMouse = true;
      let toX = this.input.mousePointer.worldX;
      let toY = this.input.mousePointer.worldY;
      // console.log("player", player.x, player.y);
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
      // console.log("mouse right", x, y);
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
    // console.log("player", player.x, player.y);

    if (keyboard.w.isDown && god) {
      player.setVelocityY(-400);
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
      player.anims.play("left", true);
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
  scene: Game,
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
    this.setAngularVelocity(1000);

    this.setActive(true);
    this.setVisible(true);

    this.setVelocity(600 * v.x, 600 * v.y);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    const d = Phaser.Math.Distance.Between(player.x, player.y, this.x, this.y);
    if (d >= 1000) {
      this.setActive(false);
      this.setVisible(false);
    }
  }
}

class Bullets extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene, { allowGravity: false });

    this.createMultiple({
      max: 0,
      frameQuantity: 3,
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
