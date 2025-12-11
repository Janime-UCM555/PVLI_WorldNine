// // EnemyBase.js
// import {
//     CATEGORY_PLAYER,
//     CATEGORY_ENEMY,
//     CATEGORY_TERRAIN
// } from "../collisionCategories.js";

// export const DIE_TYPES = {
//     STOMP: 'STOMP',
//     HAMMER: 'HAMMER',
//     STAR: 'STAR',
//     FALL: 'FALL',
// };

// export default class EnemyBase extends Phaser.GameObjects.Sprite {

//     constructor(scene, x, y, texture, speed = 50, type) {
//         super(scene, x, y, texture);

//         this.scene = scene;
//         this.type = type;
//         this.speed = speed;
//         this.direction = -1;

//         this.isAlive = true;
//         this.shouldBeDestroyed = false;
//         this.currentlyVisible = false;

//         this.blocked = { left: false, right: false };
//         this.numTouching = { left: 0, right: 0 };

//         scene.add.existing(this);
//         scene.matter.add.gameObject(this);

//         this.setupPhysics();
//         this.setupCollisions();

//         this.stompSound = scene.sound.add("aplastar");
//     }

//     /**
//      * CONFIGURACIÓN DEL CUERPO FÍSICO + SENSORES
//      */
//     setupPhysics() {
//         const sx = this.width / 2;
//         const sy = this.height / 2;

//         const w = this.width;
//         const h = this.height;

//         const M = Phaser.Physics.Matter.Matter;

//         this.enemyBody = M.Bodies.rectangle(sx, sy, w, h, {
//             chamfer: { radius: 6 },
//             label: this.constructor.name
//         });

//         this.sensors = {
//             left: M.Bodies.rectangle(sx - w * 0.45, sy, 5, h * 0.4, {
//                 isSensor: true,
//                 label: this.constructor.name
//             }),
//             right: M.Bodies.rectangle(sx + w * 0.45, sy, 5, h * 0.4, {
//                 isSensor: true,
//                 label: this.constructor.name
//             }),
//         };

//         const body = M.Body.create({
//             parts: [this.enemyBody, this.sensors.left, this.sensors.right],
//             friction: 0,
//             frictionAir: 0,
//             restitution: 0,
//             label: this.constructor.name
//         });

//         this.setExistingBody(body);
//         this.setFixedRotation();
//         this.setCollisionCategory([CATEGORY_ENEMY]);
//         this.setCollidesWith([CATEGORY_PLAYER, CATEGORY_TERRAIN, CATEGORY_ENEMY]);
//     }

//     /**
//      * LISTENERS DE SENSORES Y COLISIONES
//      */
//     setupCollisions() {
//         const world = this.scene.matter.world;

//         world.on("beforeupdate", () => {
//             this.numTouching.left = 0;
//             this.numTouching.right = 0;
//         });

//         world.on("collisionactive", (event) => {
//             for (let pair of event.pairs) {
//                 const { bodyA, bodyB } = pair;

//                 this.checkSensor(bodyA, bodyB);
//                 this.checkSensor(bodyB, bodyA);
//             }
//         });

//         world.on("afterupdate", () => {
//             this.blocked.left = this.numTouching.left > 0;
//             this.blocked.right = this.numTouching.right > 0;
//         });
//     }

//     /**
//      * Detecta si un sensor toca algo útil
//      */
//     checkSensor(sensor, other) {
//         if (sensor === this.sensors.left && (other.isStatic || other.label.includes("Goomba") || other.label.includes("Koopa"))) {
//             this.numTouching.left++;
//         }
//         if (sensor === this.sensors.right && (other.isStatic || other.label.includes("Goomba") || other.label.includes("Koopa"))) {
//             this.numTouching.right++;
//         }
//     }

//     /**
//      * ----------- MOVIMIENTO -----------
//      */
//     updateMovement() {
//         if (!this.isAlive || this.shouldBeDestroyed) return;

//         const visible = this.checkVisibility();
//         this.currentlyVisible = visible;

//         if (!visible) {
//             this.setVelocity(0, 0);
//             if (this.anims?.isPlaying) this.anims.stop();
//             return;
//         }

//         const targetVel = this.speed * this.direction;

//         if (this.body.velocity.x !== targetVel) {
//             this.setVelocityX(targetVel);
//         }

//         this.playWalkAnimation();
//     }

//     /**
//      * Animación genérica – cada subclase puede sobrescribirla
//      */
//     playWalkAnimation() {}

//     /**
//      * ----------- CAMBIO DE DIRECCIÓN -----------
//      */
//     changeDirection() {
//         this.direction *= -1;
//         this.flipX = this.direction > 0;
//         this.setVelocityX(this.direction * this.speed);
//     }

//     handleWallCollision() {
//         if (!this.isAlive) return;

//         if ((this.blocked.left && this.direction === -1) ||
//             (this.blocked.right && this.direction === 1)) {
//             this.x += (this.direction * -5);
//             this.changeDirection();
//         }
//     }

//     /**
//      * ----------- COLISIÓN CON JUGADOR -----------
//      * Subclases pueden sobreescribir stompTexture()
//      */
//     handlePlayerCollision(player) {
//         if (!this.isAlive) return;

//         if (player.isInvincible) {
//             this.stomp();
//             return;
//         }

//         const fromAbove = player.body.velocity.y > 0.7;

//         if (fromAbove) {
//             this.stomp();
//             player.setVelocityY(-4.5);
//             player.canEnemyJump = true;

//             this.scene.time.delayedCall(200, () => player.canEnemyJump = false);
//             return;
//         }

//         // Daño lateral
//         if (!player.isInvulnerable) {
//             const push = player.x < this.x ? -1 : 1;
//             player.takeDamage(push);
//         }
//     }

//     /**
//      * ----------- MUERTE ----------- 
//      */
//     die(type = DIE_TYPES.STOMP) {
//         if (type === DIE_TYPES.STOMP) {
//             this.stomp();
//         } else {
//             this.safeDestroy();
//         }
//     }

//     stomp() {
//         if (!this.isAlive || this.shouldBeDestroyed) return;

//         this.isAlive = false;
//         this.stompSound.play();

//         this.setVelocity(0, 0);
//         this.body.collisionFilter.mask = 0;

//         if (this.anims?.isPlaying) this.anims.stop();

//         this.setTexture(this.stompTexture());

//         this.scene.increaseScore(200, "score");

//         this.scene.time.delayedCall(2000, () => this.safeDestroy());
//     }

//     /**
//      * Debe devolver la textura del "aplastado"
//      * Cada subclase la define
//      */
//     stompTexture() {
//         return "default_stomp";
//     }

//     /**
//      * ----------- VISIBILIDAD -----------
//      */
//     checkVisibility() {
//         const cam = this.scene.cameras.main;
//         const margin = 20;

//         return (
//             this.x >= cam.scrollX - margin &&
//             this.x <= cam.scrollX + cam.width + margin &&
//             this.y >= cam.scrollY - margin &&
//             this.y <= cam.scrollY + cam.height + margin
//         );
//     }

//     /**
//      * ----------- DESTRUCCIÓN SEGURA -----------
//      */
//     safeDestroy() {
//         if (this.shouldBeDestroyed) return;

//         this.shouldBeDestroyed = true;

//         if (this.body) {
//             this.body.enable = false;
//         }

//         this.setVisible(false);
//         this.setActive(false);
//         this.destroy();
//     }

//     /**
//      * ----------- UPDATE GENERAL -----------
//      */
//     update() {
//         if (!this.isAlive || this.shouldBeDestroyed) return;

//         this.updateMovement();
//         this.handleWallCollision();
//     }
// }
