/**
 * @fileoverview Escena del menú principal del juego.
 * Muestra opciones para iniciar el juego, pantalla completa y gestión de progreso.
 * @module Scenes/MainMenu
 */

import Button from '../../gameObjects/UI/Button.js';
import TransitionCode from '../../gameObjects/UI/Transition.js';
import saveManager from '../../gameObjects/UI/SaveManager.js';

/**
 * Espaciado vertical entre botones en píxeles.
 * @constant {number}
 */
const B_SPACING = 100;

/**
 * @class MainMenu
 * @extends Phaser.Scene
 * @description Escena del menú principal donde el jugador puede acceder a las opciones
 * del juego, iniciar partida, cambiar a pantalla completa y gestionar el progreso.
 */
class MainMenu extends Phaser.Scene {
    /**
     * Crea una instancia del menú principal.
     */
    constructor() {
        super({ key: 'MainMenu' });
    }

    /**
     * Inicializa las propiedades de la escena antes de la precarga.
     */
    init() {
        // Inicialización de propiedades
    }
    
    /**
     * Precarga los recursos específicos del menú principal.
     */
    preload() {
        this.load.image('menu_bg', 'assets/GameSprites/Precarga/MenuBG.png');
        this.load.image('TitleName', 'assets/web/TituloPNG.png');
    }

    /**
     * Crea e inicializa todos los elementos del menú principal.
     * Configura el fondo, botones, música y transiciones.
     */
    create() {
        // Actualizar estado en la interfaz web si está disponible
        if (window.updateWebStatus) {
            window.updateWebStatus({
                sceneKey: this.level, 
                purpleCoins: this.purpleCoinScore ?? 0
            });
        }

        // Transición de entrada tipo iris
        TransitionCode.invoke(this, this.cameras.main, 1000, 
            { x: this.cameras.main.width / 2, y: this.cameras.main.height / 2 }, 
            0, this.cameras.main.width, () => {});

        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // Fondo animado del menú
        this.bg = this.add.tileSprite(0, 0, width, height, 'menu_bg');
        this.bg.setOrigin(0, 0);
        this.bg.setDisplaySize(width, height);

        // Título del juego
        this.title = this.add.sprite(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 3, 
            'TitleName'
        );
        this.title.setScale(0.8);

        // Sprite de Mario animado
        this.mario2 = this.add.sprite(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2 + 140, 
            'mario_run'
        );
        this.mario2.flipX = true;
        this.mario2.setScale(2, 2);
        this.mario2.play('mario_run');

        // Mostrar Zagreus si se ha completado todo el juego
        const progression = saveManager.getCurrentProgression();
        if (progression.nextToUnlock === null) {
            this.zagreus = this.add.sprite(
                this.cameras.main.width / 3, 
                this.cameras.main.height / 2 + 100, 
                'zagreus_walk'
            );
            this.zagreus.setScale(0.75, 0.75);
            this.zagreus.play('zagreus_walk');
        }

        // Música de fondo del menú
        if (!this.menuMusic || !this.menuMusic.isPlaying) {
            this.menuMusic = this.sound.add('menu_music', { loop: true, volume: 1 });
            this.menuMusic.play();
        }

        // Botón para iniciar el juego
        this.buttonMove = new Button(
            this, 
            0, 
            this.cameras.main.height / 2.5, 
            'Jugar',
            () => {
                if (this.menuMusic && this.menuMusic.isPlaying) {
                    this.menuMusic.stop();
                }
                this.buttonMove.input.enabled = false;
                TransitionCode.invoke(
                    this, 
                    this.cameras.main, 
                    1000,
                    { x: this.cameras.main.width / 2, y: this.cameras.main.height / 2 }, 
                    1500, 
                    0,
                    () => {
                        this.scene.launch('LevelSelection');
                        this.scene.stop();
                    }
                );
            }, 
            0x387999, 
            0x285f7a, 
            0xffffff
        );

        // Botón de pantalla completa
        this.buttonFullScreen = new Button(
            this, 
            this.cameras.main.width / 4 + 50, 
            this.cameras.main.height / 2.5, 
            "Pantalla \nCompleta",
            () => this.scale.toggleFullscreen(), 
            0x387999, 
            0x285f7a, 
            0xffffff
        );

        // Botón para resetear el progreso del juego
        this.buttonReset = new Button(
            this, 
            -300, 
            B_SPACING * 2.6, 
            "Resetear \nProgreso",
            () => {
                saveManager.resetAllData();
                this.scene.restart();
            }, 
            0x387999, 
            0x285f7a, 
            0xffffff
        );

        // Botón para desbloquear todos los niveles (debug)
        this.buttonUnlockAll = new Button(
            this, 
            -300, 
            B_SPACING * 3.4, 
            "Desbloquear\nTodo", 
            () => {
                saveManager.unlockAllLevelsAndBosses();
                this.scene.restart();
            }, 
            0x387999, 
            0x285f7a, 
            0xffffff
        );

        // Contenedor de UI centrado
        this.ui = this.add.container(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2
        );
        
        this.ui.add([
            this.buttonFullScreen,
            this.buttonMove,
            this.buttonReset,
            this.buttonUnlockAll
        ]);

        // Eventos de redimensionado de ventana
        this.scale.on('resize', (gameSize) => {
            this.UIResize(gameSize.width, gameSize.height);
        });
        this.scale.on('enterFullscreen', () => {
            this.UIResize(this.scale.gameSize.width, this.scale.gameSize.height);
        });
        this.scale.on('leaveFullscreen', () => {
            this.UIResize(this.scale.gameSize.width, this.scale.gameSize.height);
        });
    }

    /**
     * Redimensiona y reposiciona los elementos de la UI al cambiar el tamaño de la ventana.
     * @param {number} width - Nueva anchura de la ventana
     * @param {number} height - Nueva altura de la ventana
     */
    UIResize(width, height) {
        this.ui.setPosition(width / 2, height / 2);

        // Limpiar listeners al cerrar la escena
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.scale.off(Phaser.Scale.Events.RESIZE, this.UIResize, this);
            this.scale.off(Phaser.Scale.Events.ENTER_FULLSCREEN, undefined, this);
            this.scale.off(Phaser.Scale.Events.LEAVE_FULLSCREEN, undefined, this);
            
            // Ajustar límites del mundo si existen físicas
            if (this.physics?.world) {
                this.physics.world.setBounds(0, 0, width, height);
            }
        });  
    }

    /**
     * Actualiza la escena cada frame.
     * Anima el fondo moviéndolo continuamente.
     * @param {number} time - Tiempo total transcurrido
     * @param {number} delta - Tiempo desde el último frame
     */
    update(time, delta) {
        // Movimiento parallax del fondo
        if (this.bg) {
            this.bg.tilePositionX += 5;
        }
    }
}

export default MainMenu;