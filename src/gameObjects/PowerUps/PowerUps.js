export const POWERUP_TYPES = {
  MUSHROOM: "mushroom",
  STAR: "star",
  HAMMER: "hammer",
  DOUBLE_JUMP: "double_jump",
  DASH: "dash",
  JUMP_BOOTS: "jump_boots"
};


const POWERUP_SPEED = 50;  // Velocidad horizontal básica de los Power-Ups

export class PowerUp extends Phaser.GameObjects.Sprite {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {keyof POWERUP_TYPES} type
   * @param {string} textureKey - clave de textura/spritesheet cargada en preload
   * @param {string|number} frame - frame inicial opcional
   */
  constructor(scene, x, y, type, textureKey, frame) {
    super(scene, x, y, textureKey, frame);
    
    this.scene = scene;
    this.type = type;

    scene.add.existing(this);
    scene.matter.add.gameObject(this);
    this.setOrigin(0.5, 0.5);

    this.blocked= {
      left: false,
      right: false,
      up: false
    },
    this.numTouching= {
      left: 0,
      right: 0,
      up:0
    };   


    const sx = this.width/2;
    const sy = this.height/2;
    const w = this.width;
    const h = this.height;
    const M = Phaser.Physics.Matter.Matter;
    this.playerBody = M.Bodies.rectangle(sx,sy, w, h, { chamfer: { radius: 10 },label:"PowerUp"});
    this.sensors = {
        left: M.Bodies.rectangle(sx-w/1.5, sy, 5, h/2, { isSensor: true, label:"PowerUp"}),
        right: M.Bodies.rectangle(sx+w/1.5, sy, 5, h/2, { isSensor: true, label:"PowerUp" }),
    };
    const compoundBody = M.Body.create({
    parts: [this.playerBody, this.sensors.left, this.sensors.right/*, this.sensors.up*/],
    friction: 0,
    frictionAir: 0,
    restitution: 0.05, // El jugador no se pega a paredes
    label:"PowerUp"
    });
    this.setExistingBody(compoundBody);
    // El cuerpo a la posición inicial
    M.Body.setPosition(compoundBody, { x, y });

    
    const CATEGORY_PLAYER  = 0x0001;
    const CATEGORY_TERRAIN = 0x0004;
    const CATEGORY_POWERUP = 0x0003;
    
    // const mask = CATEGORY_PLAYER | CATEGORY_TERRAIN | CATEGORY_POWERUP;

    // // Apply to all parts
    // this.enemyBody.collisionFilter.category = CATEGORY_ENEMY;
    // this.enemyBody.collisionFilter.mask = mask;
    this.setCollisionCategory(CATEGORY_POWERUP);
    this.setCollidesWith([CATEGORY_PLAYER, CATEGORY_TERRAIN]);

    // Asociamos el cuerpo al sprite
    this.setPosition(x, y); // sincronizar la posición del sprite
    this.setFixedRotation();

    // Movimiento básico (rebote ligero y desplazamiento)
    this.setBounce(0.1, 0.2);
    this.setVelocityX(POWERUP_SPEED);
    this.SPEED = 5;
    
    this.scene.matter.world.on('beforeupdate', function (event) {
      this.numTouching.left = 0;
      this.numTouching.right = 0;
    }, this);
    this.scene.matter.world.on('collisionactive', (event) => {
      for (let i = 0; i < event.pairs.length; i++)            
      {
        const bodyA = event.pairs[i].bodyA;
        const bodyB = event.pairs[i].bodyB;
        if (bodyA === this.playerBody || bodyB === this.playerBody)
        {
            continue;
        }
        if (bodyA === this.sensors.left || bodyB === this.sensors.left)
        {
          this.numTouching.left++;
        }
        if (bodyA === this.sensors.right || bodyB === this.sensors.right)
        {
          this.numTouching.right++;
        }
        if (bodyA.label == "Mario" && bodyB.label=="PowerUp" || bodyA.label=="PowerUp"&&bodyB.label=="Mario")
        {
          const player = bodyA.label=="Mario" ? bodyA.gameObject : bodyB.gameObject;

          this.collect(player);
        }
      }
    });
    this.scene.matter.world.on('afterupdate', function (event) {
      this.blocked.right = this.numTouching.right > 0 ? true : false;
      this.blocked.left = this.numTouching.left > 0 ? true : false;
    }, this);
  }

  /** Llamado al recogerlo por el jugador. */
  collect(player) {
    if (!this.active) return;

    this.deactivatePowerUp({ keepSize: player.isSuperSize });
    if(!player.isSuperSize) this.enableSuperSize?.(player);

    player.activePowerUp = this.type;

    switch (this.type) {
      // case POWERUP_TYPES.STAR:
      //   player.setInvincible?.(STAR_DURATION);
      //   // se desactiva automáticamente tras STAR_DURATION
      //   break;
      // case POWERUP_TYPES.HAMMER:
      //   player.enableHammer?.();
      //   break;
      case POWERUP_TYPES.DOUBLE_JUMP:
        player.enableDoubleJump?.();
        break;
      case POWERUP_TYPES.DASH:
        player.enableDash?.();
        break;
      case POWERUP_TYPES.JUMP_BOOTS:
        player.enableHighJump?.();
        break;
        // case POWERUP_TYPES.MUSHROOM:
        // player.enableSuperSize?.();
        // break;
    }

    // Por si queremos añadir efectos de sonido
    // if (this.scene.sound && this.scene.sound.play) {
    //   const sfxKey = ({
    //     [POWERUP_TYPES.STAR]: "sfx_star",
    //     [POWERUP_TYPES.HAMMER]: "sfx_hammer",
    //     [POWERUP_TYPES.DOUBLE_JUMP]: "sfx_jump",
    //     [POWERUP_TYPES.DASH]: "sfx_dash",
    //     [POWERUP_TYPES.JUMP_BOOTS]: "sfx_boots"
    //     [POWERUP_TYPES.MUSHROOM]: "sfx_mushroom"
    //   })[this.type];
    //   if (sfxKey) this.scene.sound.play(sfxKey, { volume: 0.6 });
    // }

    // this.disableBody(true, true);
    this.destroy();
  }

  deactivatePowerUp(player, options = {}) {
        // Si no hay power-up activo y no es Super Mario, no hacer nada
        if (!player.activePowerUp && !player.isSuperSize) return;

        const keepSize = options.keepSize ?? false;

        // 1. Quitar efectos de estrella
        if (player.invEvent?.remove) {
            player.invEvent.remove(false);
            player.invEvent = null;
        }

        if (player.invTimer?.remove) {
            player.invTimer.remove(false);
            player.invTimer = null;
        }

        if (player.warningTimer?.remove) {
            player.warningTimer.remove(false);
            player.warningTimer = null;
        }

        if (player.starman && player.starman.isPlaying) {
            player.starman.stop();
        }
        if (this.starEndingSound && this.starEndingSound.isPlaying) {
            this.starEndingSound.stop();
        }
        if (this.scene.levelMusic && this.scene.levelMusic.isPaused && !this.scene.endTimer) {
            this.scene.levelMusic.resume();
        }

        // 2. Restaurar apariencia
        this.clearTint();
        this.alpha = 1;

        // 3. Restaurar tamaño si toca
        if (!keepSize && this.isSuperSize) {
            this.setScale(this.base.scaleX, this.base.scaleY);

            // Solo si es arcade, esto existe
            if (this.baseBody && this.body && this.body.setSize) {
                this.body.setSize(
                    this.baseBody.w * this.base.scaleX,
                    this.baseBody.h * this.base.scaleY
                );
                this.body.setOffset(this.baseBody.offsetX, this.baseBody.offsetY);
            }

            this.isSuperSize = false;
        }

        // 4. Resetear flags y multiplicadores
        this.isInvincible = false;
        this.canThrowHammer = false;
        this.canDoubleJump = false;
        this.hasDoubleJumped = false;
        this.canDash = false;
        this.isDashing = false;
        this.canHighJump = false;
        this.highJumpMultiplier = 1.5;

        // 5. Restaurar velocidad y salto base
        this.speed = this.base.speed;
        this.minJumpVelocity = this.base.minJumpVelocity ?? this.minJumpVelocity;
        this.maxJumpVelocity = this.base.maxJumpVelocity ?? this.base.jumpForce ?? this.maxJumpVelocity;

        // 6. Power-up activo
        this.activePowerUp = keepSize && this.isSuperSize
            ? POWERUP_TYPES.MUSHROOM
            : null;
    }

    enableSuperSize(player) {
        // Evita duplicar
        if (player.isSuperSize) return;

        player.powerUpSound?.play();

        const k = player.scaleMultiplier;
        player.isSuperSize = true;

        // Escala visual (Super Mario / Powered-Up)
        player.setScale(player.base.scaleX * k, player.base.scaleY * k);
    }

  /** Update simple para rebotar en paredes y moverse. */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    // console.log(this.blocked.left);
    if (this.blocked.left) this.setVelocityX(Math.abs(this.SPEED));
    else if (this.blocked.right) this.setVelocityX(-Math.abs(this.SPEED));
  }
}
