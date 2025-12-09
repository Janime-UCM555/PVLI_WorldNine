/**
 * Tipos de Power-Up disponibles en el juego.
 * @readonly
 * @enum {string}
 */
export const POWERUP_TYPES = {
  MUSHROOM: "mushroom",
  STAR: "star",
  HAMMER: "hammer",
  DOUBLE_JUMP: "double_jump",
  DASH: "dash",
  JUMP_BOOTS: "jump_boots"
};
import{
    CATEGORY_PLAYER,
    CATEGORY_TERRAIN,
    CATEGORY_POWERUP,
} from "../collisionCategories.js"

/**
 * @typedef {'mushroom' | 'star' | 'hammer' | 'double_jump' | 'dash' | 'jump_boots'} PowerUpType
 */

/**
 * Velocidad horizontal básica de los Power-Ups.
 * @constant {number}
 */
const POWERUP_SPEED = 50;  // Velocidad horizontal básica de los Power-Ups

/**
 * Clase base para todos los Power-Ups del juego.
 * 
 * Se encarga de:
 * - Crear el cuerpo físico con Matter (cuerpo principal + sensores).
 * - Detectar colisiones laterales y rebotar en paredes.
 * - Gestionar la recogida genérica del power-up por el jugador.
 * - Activar/desactivar estados del jugador (estrella, Super Mario, etc.).
 */
export class PowerUp extends Phaser.GameObjects.Sprite {
  /**
   * Crea un nuevo Power-Up.
   * @param {Phaser.Scene} scene - Escena a la que pertenece el Power-Up.
   * @param {number} x - Posición X inicial.
   * @param {number} y - Posición Y inicial.
   * @param {PowerUpType} type - Tipo de Power-Up.
   * @param {string} textureKey - Clave de textura/spritesheet cargada en preload.
   * @param {string|number} [frame] - Frame inicial opcional.
   */
  constructor(scene, x, y, type, textureKey, frame) {
    super(scene, x, y, textureKey, frame);
    
    /** @type {Phaser.Scene} */
    this.scene = scene;

    /** @type {PowerUpType} */
    this.type = type;

    scene.add.existing(this);
    scene.matter.add.gameObject(this);
    this.setOrigin(0.5, 0.5);

    /**
     * Flags de colisión para saber si está bloqueado por la izquierda/derecha/suelo.
     * @type {{left: boolean, right: boolean, up: boolean, bottom: boolean}}
     */
    this.blocked = {
      left: false,
      right: false,
      up: false,
      bottom: false
    };

    /**
     * Contadores de cuántos cuerpos están tocando cada sensor.
     * @type {{left: number, right: number, up: number, bottom: number}}
     */
    this.numTouching = {
      left: 0,
      right: 0,
      up: 0,
      bottom: 0
    };

    // Creación del cuerpo principal y sensores (Matter)
    const sx = this.width / 2;
    const sy = this.height / 2;
    const w = this.width;
    const h = this.height;
    const M = Phaser.Physics.Matter.Matter;

    /** @type {MatterJS.BodyType} */
    this.playerBody = M.Bodies.rectangle(sx, sy, w, h, {
      chamfer: { radius: 10 },
      label: "PowerUp"
    });

    /**
     * Sensores laterales/inferiores para detectar colisiones.
     * @type {{left: MatterJS.BodyType, right: MatterJS.BodyType, bottom: MatterJS.BodyType}}
     */
    this.sensors = {
      left: M.Bodies.rectangle(sx - w / 1.5, sy / 2, 5, 9/10 *  h, {
        isSensor: true,
        label: "PowerUp"
      }),
      right: M.Bodies.rectangle(sx + w / 1.5, sy / 2, 5, 9/10 * h, {
        isSensor: true,
        label: "PowerUp"
      }),
      bottom: M.Bodies.rectangle(sx, sy + h / 2, w / 2, 5, {
        isSensor: true,
        label: "PowerUp"
      })
    };

    const compoundBody = M.Body.create({
      parts: [this.playerBody, this.sensors.left, this.sensors.right, this.sensors.bottom /*, this.sensors.up*/],
      friction: 0,
      frictionAir: 0,
      restitution: 0.05, // El power-up no se pega a paredes
      label: "PowerUp"
    });

    this.setExistingBody(compoundBody);
    // El cuerpo a la posición inicial
    M.Body.setPosition(compoundBody, { x, y });

    // // Apply to all parts
    // this.enemyBody.collisionFilter.category = CATEGORY_ENEMY;
    // this.enemyBody.collisionFilter.mask = mask;
    this.setCollisionCategory([CATEGORY_POWERUP]);
    this.setCollidesWith([CATEGORY_PLAYER, CATEGORY_TERRAIN]);

    // Asociamos el cuerpo al sprite
    this.setPosition(x, y); // sincronizar la posición del sprite
    this.setFixedRotation();

    // Movimiento básico (rebote ligero y desplazamiento)
    this.setBounce(0.1, 1);
    this.setVelocityX(POWERUP_SPEED);

    /** Velocidad usada al rebotar contra paredes. */
    this.SPEED = 5;
    
    // Reset de contadores de sensores antes de cada update de Matter
    this.scene.matter.world.on('beforeupdate', function () {
      this.numTouching.left = 0;
      this.numTouching.right = 0;
      this.numTouching.bottom = 0;
    }, this);

    // Gestión de colisiones activas (sensores + recogida)
    this.scene.matter.world.on('collisionactive', (event) => {
      for (let i = 0; i < event.pairs.length; i++) {
        const bodyA = event.pairs[i].bodyA;
        const bodyB = event.pairs[i].bodyB;

        if (!bodyA.isStatic && !bodyB.isStatic && !bodyA instanceof PowerUp && !bodyB instanceof PowerUp) {
          continue;
        }
        if (bodyA === this.playerBody || bodyB === this.playerBody)
        {
          continue;
        }
        // 1) Primero, comprobar si ESTE power-up ha chocado con Mario
        const isThisPowerBody =
          bodyA === this.playerBody || bodyB === this.playerBody;
        const isMarioBody =
          bodyA.label === "Mario" || bodyB.label === "Mario";

        if (isThisPowerBody && isMarioBody) {
          // Sacamos el gameObject del cuerpo de Mario
          /** @type {any} */ // tu clase Player
          const player = bodyA.label === "Mario" ? bodyA.gameObject : bodyB.gameObject;
          this.collect(player);   // <-- SOLO este powerup
          continue;               // No hace falta procesar sensores para este par
        }
        else {
          // No es colisión con Mario, seguir a sensores
          // 2) A partir de aquí, lógica de sensores
          if (bodyA === this.sensors.left || bodyB === this.sensors.left) {
            this.numTouching.left++;
          }
          if (bodyA === this.sensors.right || bodyB === this.sensors.right) {
            this.numTouching.right++;
          }
          if (bodyA === this.sensors.bottom || bodyB === this.sensors.bottom) {
            this.numTouching.bottom++;
          }
        }
    }
    });

    // Actualizar flags blocked según numTouching
    this.scene.matter.world.on('afterupdate', function () {
      this.blocked.right  = this.numTouching.right  > 0;
      this.blocked.left   = this.numTouching.left   > 0;
      this.blocked.bottom = this.numTouching.bottom > 0;
    }, this);
  }

  /**
   * Llamado cuando el jugador recoge este Power-Up.
   * 
   * Comportamiento por defecto:
   * - Desactiva el power-up actual del jugador (pero puede conservar tamaño si ya es Super).
   * - Si no era Super, activa el estado Super (seta).
   * - Actualiza `activePowerUp` en el jugador.
   * - Destruye el objeto en el mundo.
   *
   * Los power-ups específicos suelen extender este método con `super.collect(player)`.
   *
   * @param {any} player - Instancia del jugador que recoge el power-up.
   */
  collect(player) {
    if (!this.active) return;

    player.deactivatePowerUp({ keepSize: player.isSuperSize });
    if (!player.isSuperSize) this.enableSuperSize?.(player);

    player.activePowerUp = this.type;

    this.destroy();
  }

  /**
   * Activa el estado "Super Size" (tipo seta).
   * Escala el sprite del jugador y marca el estado interno.
   *
   * @param {any} player - Instancia del jugador.
   */
  enableSuperSize(player) {
    // Evita duplicar
    if (player.isSuperSize) return;

    player.powerUpSound?.play();

    const k = player.scaleMultiplier;
    player.isSuperSize = true;

    // Escala visual (Super Mario / Powered-Up)
    player.setScale(player.base.scaleX * k, player.base.scaleY * k);
  }

  /**
   * Update simple para rebotar en paredes y mantener el movimiento horizontal.
   *
   * @param {number} time - Tiempo actual del juego.
   * @param {number} delta - Tiempo transcurrido desde el último frame.
   */
  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (this.blocked.left) {
      this.setVelocityX(Math.abs(this.SPEED));
    } else if (this.blocked.right) {
      this.setVelocityX(-Math.abs(this.SPEED));
    }
  }
}
export default PowerUp;