export const POWERUP_TYPES = {
  MUSHROOM: "mushroom",
  STAR: "star",
  HAMMER: "hammer",
  DOUBLE_JUMP: "double_jump",
  DASH: "dash",
  JUMP_BOOTS: "jump_boots"
};

const STAR_DURATION = 8000; // ms
const POWERUP_SPEED = 70;  // Velocidad horizontal básica de los Power-Ups

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
    // this.setActive(true).setVisible(true);
    // this.body.setAllowGravity(true);
    // this.body.setCollideWorldBounds(true);
    // Configuración de colisiones específica
    // this.body.checkCollision.left = true;
    // this.body.checkCollision.right = true;
    // this.body.checkCollision.up = false;  // No colisiona por arriba para que Mario no pueda saltar encima de los Power-Ups
    // this.body.checkCollision.down = true;
    this.blocked= {
      left: false,
      right: false,
      bottom: false,
      up: false
    },
    this.numTouching= {
      left: 0,
      right: 0,
      bottom: 0,
      up:0
    };   


    const sx = this.width/2;
    const sy = this.height/2;
    const w = this.width;
    const h = this.height;
    const M = Phaser.Physics.Matter.Matter;
    this.playerBody = M.Bodies.rectangle(sx,sy, w, h, { chamfer: { radius: 10 } });
    this.sensors = {
        bottom: M.Bodies.rectangle(sx, h, sx, 5, { isSensor: true }),
        left: M.Bodies.rectangle(sx-w, sy, 5, h/2, { isSensor: true }),
        right: M.Bodies.rectangle(sx+w, sy, 5, h/2, { isSensor: true }),
    };
    const compoundBody = M.Body.create({
    parts: [this.playerBody,this.sensors.bottom, this.sensors.left, this.sensors.right/*, this.sensors.up*/],
    friction: 0,
    frictionAir: 0,
    restitution: 0.05 // El jugador no se pega a paredes
    });
    this.setExistingBody(compoundBody);
    // El cuerpo a la posición inicial
    M.Body.setPosition(compoundBody, { x, y });

    // Asociamos el cuerpo al sprite
    this.setPosition(x, y); // sincronizar la posición del sprite
    this.setFixedRotation();

    // Movimiento básico (rebote ligero y desplazamiento)
    this.setBounce(0.1, 0.2);
    this.setVelocityX(POWERUP_SPEED);

    
    this.scene.matter.world.on('beforeupdate', function (event) {
      this.numTouching.left = 0;
      this.numTouching.right = 0;
      this.numTouching.bottom = 0;
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
          this.numTouching.left += 1;
        }
        if (bodyA === this.sensors.right || bodyB === this.sensors.right)
        {
          this.numTouching.right += 1;
        }
        if (bodyA === this.sensors.bottom || bodyB === this.sensors.bottom)
        {
          this.numTouching.bottom += 1;
        }
      }
    });
    this.scene.matter.world.on('afterupdate', function (event) {
      this.blocked.right = this.numTouching.right > 0 ? true : false;
      this.blocked.left = this.numTouching.left > 0 ? true : false;
      this.blocked.bottom = this.numTouching.bottom > 0 ? true : false;
    }, this);
  }

  /** Llamado al recogerlo por el jugador. */
  collect(player) {
    if (!this.active) return;

    // Desactiva cualquier power-up activo anterior (solo uno a la vez)
    if (player.activePowerUp && player.deactivatePowerUp) {
      player.deactivatePowerUp();
    }

    player.activePowerUp = this.type;

    switch (this.type) {
      case POWERUP_TYPES.STAR:
        player.setInvincible?.(STAR_DURATION);
        // se desactiva automáticamente tras STAR_DURATION
        break;
      case POWERUP_TYPES.HAMMER:
        player.enableHammer?.();
        break;
      case POWERUP_TYPES.DOUBLE_JUMP:
        player.enableDoubleJump?.();
        break;
      case POWERUP_TYPES.DASH:
        player.enableDash?.();
        break;
      case POWERUP_TYPES.JUMP_BOOTS:
        player.enableHighJump?.();
        break;
        case POWERUP_TYPES.MUSHROOM:
        player.enableSuperSize?.();
        break;
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

  /** Update simple para rebotar en paredes y moverse. */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    // console.log(this.blocked.left);
    if (this.blocked.left) this.setVelocityX(Math.abs(this.body.velocity.x));
    else if (this.blocked.right) this.setVelocityX(-Math.abs(this.body.velocity.x));
  }
}

// ------------------------------------------------------------
// NOTAS DE INTEGRACIÓN:
// ------------------------------------------------------------
// Tu clase Player debería implementar los métodos:
//   - setInvincible(durationMs) → para la Estrella (duración limitada)
//   - enableHammer() → activa lanzamiento de martillos
//   - enableDoubleJump() → habilita doble salto
//   - enableDash() → añade dash o aumenta velocidad base
//   - enableHighJump() → aumenta altura de salto
//   - deactivatePowerUp() → limpia cualquier efecto activo
//  - enableSuperSize() → aumenta tamaño del jugador
// Solo la estrella tiene duración temporal automática.
