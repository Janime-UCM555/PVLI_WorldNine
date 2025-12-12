/**
 * Importación de la clase para los botones
 * @module gameObjects/UI/Button
 */
import Button from '../../gameObjects/UI/Button.js';

/**
 * Importación de la clase Mario
 * @module gameObjects/Player/Mario
 */
import Mario from '../../gameObjects/Player/Mario.js';

/**
 * Importación de la clase de los PowerUps y los tipos de PowerUps
 * @module gameObjects/PowerUps/PowerUps
 */
import { PowerUp, POWERUP_TYPES } from '../../gameObjects/PowerUps/PowerUps.js';

const B_SPACING = 100;

/**
 * Escena de prueba que demuestra el funcionamiento de todos los power-ups del juego
 * @extends Phaser.Scene
 */
class MapScene extends Phaser.Scene {
  /**
   * Constructor de la escena MapScene.
   * Inicializa la escena con clave 'MapScene'.
   */
  constructor() {
    super({ key: 'MapScene' });
  }

  /**
   * Precarga los recursos necesarios para la escena.
   */
  preload() {
    // --- Power-Ups ---
    this.load.image('star', '../../../assets/GameSprites/PowerUps/star.png');
    this.load.image('hammer', '../../../assets/GameSprites/PowerUps/hammer.png');
    this.load.image('double_jump', '../../../assets/GameSprites/PowerUps/double_jump.png');
    this.load.image('dash', '../../../assets/GameSprites/PowerUps/dash.png');
    this.load.image('jump_boots', '../../../assets/GameSprites/PowerUps/jump_boots.png');
    this.load.image('mushroom', '../../../assets/GameSprites/PowerUps/mushroom.png');
  }

  /**
   * Crea y configura todos los elementos de la escena.
   * Inicializa física, jugador, power-ups y elementos de UI.
   */
  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    // Mundo
    this.physics.world.setBounds(0, 0, w, h);

    // Suelo estático (rectángulo invisible con cuerpo)
    this.groundRect = this.add.rectangle(w / 2, h - 20, w, 40);
    this.physics.add.existing(this.groundRect, true); // static body

    // 1) Mario con física
    this.mario = new Mario(this, 0, h - 200, 'mario_run');
    this.mario.body.setCollideWorldBounds(true);

    // 2) Grupo de power-ups
    this.powerups = this.add.group();

    // 3) Spawnea SIEMPRE con tu clase PowerUp
    this.spawnPowerUp(200, h - 100, POWERUP_TYPES.STAR, 'star');
    this.spawnPowerUp(300, h - 100, POWERUP_TYPES.HAMMER, 'hammer');
    this.spawnPowerUp(400, h - 100, POWERUP_TYPES.DOUBLE_JUMP, 'double_jump');
    this.spawnPowerUp(500, h - 100, POWERUP_TYPES.DASH, 'dash');
    this.spawnPowerUp(600, h - 100, POWERUP_TYPES.JUMP_BOOTS, 'jump_boots');
    this.spawnPowerUp(700, h - 100, POWERUP_TYPES.MUSHROOM, 'mushroom');

    // 4) Overlap para recoger (llama a collect y se destruye)
    this.physics.add.overlap(
    this.mario,
    this.powerups,
    (player, pu) => pu.collect(player),
    null,
    this
    );

    // Colisiones con el suelo
    this.physics.add.collider(this.mario, this.groundRect);
    this.physics.add.collider(this.powerups, this.groundRect);

    this.buttonPrueba = new Button(this, 0, 0, 'Prueba', () => {
      this.scene.launch('MainMenu');
      this.scene.stop();
    });

    this.buttonFullScreen = new Button(this, 0, B_SPACING, "Pantalla \nCompleta",
      () => this.scale.toggleFullscreen()
    );

    this.buttonMove = new Button(this, 0, -B_SPACING, 'Move',() =>{
        this.scene.launch('MovimientoScene');
        this.scene.stop();
    })

    this.ui = this.add.container(this.cameras.main.width / 2, this.cameras.main.height / 2);
    this.ui.add([
        //Añadir aqui los elementos de la ui
        this.buttonFullScreen,
        this.buttonPrueba,
        this.buttonMove
    ])

    this.scale.on('resize', (gameSize) => { this.UIResize(gameSize.width, gameSize.height); });
    this.scale.on('enterFullscreen', () => { this.UIResize(this.scale.gameSize.width, this.scale.gameSize.height); });
    this.scale.on('leaveFullscreen', () => { this.UIResize(this.scale.gameSize.width, this.scale.gameSize.height); });
  }

   /**
   * Genera un power-up específico en las coordenadas dadas
   * @param {number} x - Posición X en píxeles
   * @param {number} y - Posición Y en píxeles
   * @param {string} type - Tipo de power-up (de POWERUP_TYPES)
   * @param {string} textureKey - Clave de textura para el power-up
   * @returns {Phaser.GameObjects.Group} Grupo de power-ups actualizado
   */
  spawnPowerUp(x, y, type, textureKey) {
    this.powerups.add(new PowerUp(this, x, y, type, textureKey));
    return this.powerups;
  }

  /**
   * Recalcula y reposiciona elementos de UI al redimensionar la ventana
   * @param {number} width - Nuevo ancho de la pantalla
   * @param {number} height - Nuevo alto de la pantalla
   */
  UIResize(width, height) {
    this.ui.setPosition(width / 2, height / 2);
    this.mario.setPosition(width - 50, height - 50);

    // Ajustar suelo al nuevo tamaño de pantalla
    if (this.groundRect) {
      this.groundRect.setPosition(width / 2, height - 20);
      this.groundRect.width = width;
      // Actualizar el cuerpo estático
      const body = this.groundRect.body;
      if (body) {
        body.updateFromGameObject(); // sincroniza el estático con el rectángulo
      }
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    this.scale.off(Phaser.Scale.Events.RESIZE, this.UIResize, this);
    this.scale.off(Phaser.Scale.Events.ENTER_FULLSCREEN, undefined, this);
    this.scale.off(Phaser.Scale.Events.LEAVE_FULLSCREEN, undefined, this);
     });

    // Ajustar world bounds
     if(this.physics?.world) this.physics.world.setBounds(0, 0, width, height);
  }

  /**
   * Actualización de la escena cada frame
   * @param {number} time - Tiempo actual del juego en milisegundos
   * @param {number} delta - Tiempo transcurrido desde el último frame
   */
  update(time, delta) {
    if (this.mario){
      this.mario.update(time, delta);
    }
    
  }
}

export default MapScene;
