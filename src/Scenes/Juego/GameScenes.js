/**
 * @fileoverview Clase base para todas las escenas de juego del tipo plataformas.
 * Gestiona la lógica común de niveles incluyendo creación de mapas, enemigos, colisiones,
 * sistema de puntuación, temporizador y transiciones entre escenas.
 * @module Scenes/GameScenes
 */

/**
 * Importación del botón de UI.
 * @module UI/Button
 */
import Button from '../../gameObjects/UI/Button.js';

/**
 * Función para centrar la cámara en el jugador
 */
import centerCameraOnPlayer from '../../gameObjects/Player/CenterOnPlayer.js';

/**
 * Importación del jugador Mario.
 * @module Player/Mario
 */
import Mario from '../../gameObjects/Player/Mario.js';

/**
 * Bloque final del nivel.
 * @module LevelBlockObjects/BarraFin
 */
import Fin from '../../gameObjects/LevelBlockObjects/BarraFin.js';

/**
 * Enemigos
 * @module Enemies
 */
import Goomba from '../../gameObjects/Enemies/Goomba.js';
import Koopa from '../../gameObjects/Enemies/Koopa.js';
import PiranhaPlant from '../../gameObjects/Enemies/PiranhaPlant.js';
import Pokey from '../../gameObjects/Enemies/Pokey.js';

/**
 * Transición visual entre escenas.
 * @module UI/Transition
 */
import TransitionCode from '../../gameObjects/UI/Transition.js';

/**
 * Bloques del mapa.
 * @module LevelBlockObjects
 */
import SceneBlocks from '../../gameObjects/LevelBlockObjects/SceneBlocks.js';
import Block from '../../gameObjects/LevelBlockObjects/BreakBlock.js';
import PauseBlock from '../../gameObjects/LevelBlockObjects/PauseBlock.js';
import OneWay from '../../gameObjects/LevelBlockObjects/OneWay.js';
import Spikes from '../../gameObjects/LevelBlockObjects/Spikes.js';
import Coins from '../../gameObjects/LevelBlockObjects/Coins.js';
import Impulse from '../../gameObjects/LevelBlockObjects/Impulse.js';
import CoinPath from '../../gameObjects/LevelBlockObjects/CoinPath.js';
import FallBlock from '../../gameObjects/LevelBlockObjects/FallBlock.js';

/**
 * Generador de PowerUps.
 * @module PowerUps/Spawn
 */
import spawnPowerUp from '../../gameObjects/PowerUps/PowerUpSpawn.js';

/**
 * Categorías de colisión de Matter.js
 * @module collisionCategories
 */
import {
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_TERRAIN,
    CATEGORY_FALLOFF
} from "../../gameObjects/collisionCategories.js"

/**
 * PowerUps y sus tipos.
 * @module PowerUps
 */
import { PowerUp, POWERUP_TYPES } from '../../gameObjects/PowerUps/PowerUps.js';

import Star from '../../gameObjects/PowerUps/Star.js';

/**
 * Tipos de muerte del Goomba.
 * @module Enemies/Goomba
 */
import { DIE_TYPES } from '../../gameObjects/Enemies/Goomba.js';

/**
 * Guardar los datos de la partida
 * @module UI/SaveManager
 */
import saveManager from '../../gameObjects/UI/SaveManager.js';

/**
 * Contador de monedas moradas por nivel.
 * @type {Object.<string, number>}
 */
export const purpleCoinsByLevel = {
    Nivel_T: 0,
    Nivel_R: 0,
    Nivel_D: 0,
    Nivel_G: 0,
};

/**
 * IDs de monedas moradas recolectadas por nivel.
 * @type {Object.<string, Array<number>>}
 */
export const collectedPurpleCoinsByLevel = {
    Nivel_T: [],
    Nivel_R: [],
    Nivel_D: [],
    Nivel_G: [],
};

// Cargar contadores guardados desde localStorage
const savedCounts = localStorage.getItem('w9_purpleCoinsByLevel');
if (savedCounts) {
    try {
        const parsed = JSON.parse(savedCounts);
        Object.assign(purpleCoinsByLevel, parsed);
    } catch (e) {
        console.warn('No se pudieron cargar las monedas moradas guardadas', e);
    }
}

// Cargar monedas recolectadas desde localStorage
const savedCollected = localStorage.getItem('w9_collectedPurpleCoinsByLevel');
if (savedCollected) {
    try {
        const parsed = JSON.parse(savedCollected);
        for (const level in collectedPurpleCoinsByLevel) {
            if (parsed[level]) {
                collectedPurpleCoinsByLevel[level] = parsed[level];
            }
        }
    } catch (e) {
        console.warn('No se pudieron cargar las monedas moradas recogidas', e);
    }
}

/**
 * Mapa que relaciona nombres de capas de Tiled con clases constructoras.
 * Sirve como fábrica para crear objetos desde el editor de mapas Tiled.
 * @type {Object.<string, Function>}
 */
export const CLASS_MAP = {
    Bloques: Block,
    FallOffs: FallBlock,
    OneWays: OneWay,
    Pinchos: Spikes,
    PauseBlocks: PauseBlock,
    Impulsos: Impulse,
    CaminoMonedas: CoinPath,
    Monedas: Coins,
    BarraFin: Fin,
    Goomba, 
};

/**
 * @class EscenaBase
 * @extends Phaser.Scene
 * @description Clase base para todas las escenas de niveles del juego.
 * Proporciona funcionalidad común como gestión de mapas, enemigos, colisiones,
 * puntuación, temporizador y transiciones.
 */
class EscenaBase extends Phaser.Scene {
    /**
     * Crea una instancia de EscenaBase.
     * @param {string} key - Identificador único de la escena
     * @param {Function} callback - Función para crear capas personalizadas del nivel
     * @param {boolean} IsBoss - Indica si la escena es un nivel de jefe
     */
    constructor(key, callback, IsBoss) {
        super({ key: key });

        this.level = key;
        this.mapKey = this.level + '_map';
        this.isBoss = IsBoss;
        this.customLayer = callback;
        this.saveManager = saveManager;
        this.levelType = "Normal";
        this.type = 0;
        
        // Determinar el tipo de nivel según la clave
        if (this.level == "Nivel_R" || this.level == "BossJ") {
            this.levelType = "Roma";
            this.type = 1;
        }
        else if (this.level == "Nivel_D" || this.level == "BossH") {
            this.levelType = "Egipto";
            this.type = 2;
        }
        else if (this.level == "Nivel_G" || this.level == "BossHades") {
            this.levelType = "Grecia";
            this.type = 3;
        }
    }

    /**
     * Precarga recursos comunes para la escena.
     */
    preload() {
        console.log('=== INICIO ===');
    }

    /**
     * Crea e inicializa todos los elementos de la escena.
     * Configura el mapa, jugador, enemigos, colisiones y UI.
     */
    create() {
        this.purpleCoinScore = purpleCoinsByLevel[this.level] ?? 0;

        // Actualizar la interfaz web externa
        if (window.updateWebStatus) {
            window.updateWebStatus({
                sceneKey: this.level, 
                purpleCoins: this.purpleCoinScore ?? 0,
                isBoss: this.isBoss
            });
        }

        // Crear el mapa de Tiled
        this.map = this.make.tilemap({ key: this.mapKey, tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('MapaTiles', 'mi_tileset');
        this.tile = tileset;
        this.customLayer();

        // Crear objetos desde las capas del mapa
        this.fallBlock = this.createObjectsFromLayer('FallOffs');
        this.spikes = this.createObjectsFromLayer('Pinchos');
        this.impulsos = this.createObjectsFromLayer('Impulsos');
        this.blocks = this.createObjectsFromLayer('Bloques');
        this.pausa = this.createObjectsFromLayer('PauseBlocks');
        this.oneWay = this.createObjectsFromLayer('OneWays');
        this.coinPath = this.createObjectsFromLayer('CaminoMonedas');
        this.coinPath?.setDepth(3);

        this.coins = this.createsCoinsFromLayer('Monedas');
        this.coins?.setDepth(2);

        // Crear capas visuales del mapa
        if (this.map.getLayer('CapaFrente')) {       
            this.frontLayer = this.map.createLayer('CapaFrente', tileset, 0, 0);
            this.frontLayer?.setDepth(4);
        }
        if (this.map.getLayer('CapaDecoraciones')) {
            this.decorationsLayer = this.map.createLayer('CapaDecoraciones', tileset, 0, 0);
            this.decorationsLayer?.setDepth(1);
        }
        if (this.map.getLayer('CapaFalsoSuelo')) {
            this.fakeFloorLayer = this.map.createLayer('CapaFalsoSuelo', tileset, 0, 0);
            this.fakeFloorLayer?.setTint(0x888888);
            this.fakeFloorLayer?.setDepth(0);
        }
        
        this.groundLayer = this.map.createLayer('CapaSuelo', tileset, 0, 0);
        this.groundLayer?.setDepth(1);
        this.barraFinLayer = this.createObjectsFromLayer('BarraFin');
        this.barraFinLayer?.setDepth(8);

        // Configurar colisiones en las tiles del suelo
        this.map.setCollisionByExclusion([-1, 0]);
        this.matter.world.convertTilemapLayer(this.groundLayer);
        this.groundLayer.forEachTile(tile => {
            if (tile.physics.matterBody) {
                const body = tile.physics.matterBody.body;
                // Eliminar fricción para movimiento suave
                body.friction = 0;
                body.frictionStatic = 0;
                body.frictionAir = 0;
                body.restitution = 0;
                
                body.collisionFilter.category = CATEGORY_TERRAIN;
                body.collisionFilter.mask = CATEGORY_PLAYER | CATEGORY_ENEMY;
            }
        });

        // Crear jugador si no es nivel de jefe
        if (!this.isBoss) {
            this.jugador = new Mario(this, 25, 625, 'mario_run', 3.5, -3.75, true, false);
        }

        if (!this.jugador) {
            console.error("No se ha podido crear a Mario");
        }    

        this.jugador.setDepth(3);
            
        // Forzar la inicialización de animaciones
        if (this.anims.exists('mario_run')) {
            this.jugador.play('mario_run');
        }

        this.setupCollisions();

        this.powerups = this.add.group();
        this.hammers = this.add.group();

        // Configurar límites del mundo
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.ui = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2).setDepth(10);
        
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(1.65);
        
        // Transición de entrada si es la primera vez
        if (!this.openedScene) {
            this.jugador?.setStatic(true);
            TransitionCode.invoke(this, this.cameras.main, 1000, this.jugador?.getCenter(), 0, 120, () => {
                transition2();
            });
            const transition2 = () => {
                TransitionCode.invoke(this, this.cameras.main, 600, this.jugador?.getCenter(), 120, this.cameras.main.width,
                () => {
                    this.openedScene = true;
                    this.jugador?.setStatic(false);
                    this.jugador?.resume();
                });
            }
        }
        
        this.irisSound = this.sound.add('iris-out');

        // Quitar colisión con los bordes del mapa
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, 0, false, false, false, false);
        this.createText();  

        // Crear enemigos desde la capa de objetos
        const enemies = this.map.getObjectLayer('Enemigos').objects;
        this.goombas = this.add.group();
        this.koopas = this.add.group();
        this.piranhas = this.add.group();
        this.pokeys = this.add.group();
        
        for (const enemie of enemies) {
            if (enemie.name === 'Goomba') {
                const goomba = new Goomba(this, enemie.x, enemie.y - 16, 'Gomb_Walk', 1, 1, this.type);
                goomba.direction = 1;
                this.goombas.add(goomba);
                goomba.setDepth(2);
                goomba.setCollisionCategory(CATEGORY_ENEMY);
                goomba.setCollidesWith([CATEGORY_PLAYER, CATEGORY_TERRAIN, CATEGORY_ENEMY]);
            }
            else if (enemie.name === 'Koopa') {
                const koopa = new Koopa(this, enemie.x, enemie.y - 32, 'Koopa_walk', 1, this.type);
                koopa.direction = -1;
                this.koopas.add(koopa);
                koopa.setDepth(2);
                koopa.setCollisionCategory(CATEGORY_ENEMY);
                koopa.setCollidesWith([CATEGORY_PLAYER, CATEGORY_TERRAIN, CATEGORY_ENEMY]);
            }
            else if (enemie.name === 'Piranha') {
                const inverse = enemie.properties?.find(p => p.name === 'inverse')?.value || false;
                const piranha = new PiranhaPlant(this, enemie.x + 33, enemie.y - 35, 'Piranha_plant', 2000, 2000, inverse);
                this.piranhas.add(piranha);
                piranha.setCollisionCategory(CATEGORY_ENEMY);
                piranha.setCollidesWith([CATEGORY_PLAYER, CATEGORY_TERRAIN, CATEGORY_ENEMY]);
            }
            else if (enemie.name === 'Pokey') {
                const segments = enemie.properties?.find(p => p.name === 'segments')?.value || 5;
                const pokey = new Pokey(this, enemie.x, enemie.y, segments, 1);
                this.pokeys.add(pokey);
            }
        }
        
        this.openedScene = false;
    }

    /**
     * Crea los elementos de texto de la UI (puntuación, monedas, temporizador).
     */
    createText() {
        const posUI = this.cameras.main.centerX + this.cameras.main.centerX/2;
        const fontSize = 29;

        this.textTimer = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '00', {fontFamily: 'aku-kamu'})
            .setOrigin(0.5, 5)
            .setStroke('#000000ff', 6)
            .setFill('#ffffffff')
            .setDepth(6)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0);

        this.textScore = this.add.text(posUI, this.cameras.main.centerY, "".padStart(10, "0"), {fontFamily: 'aku-kamu'})
            .setOrigin(1, 5)
            .setStroke('#000000ff', 6)
            .setFill('#ffffffff')
            .setDepth(6)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0);

        this.textCoins = this.add.text(posUI, this.cameras.main.centerY, "".padStart(2, "0"), {fontFamily: 'aku-kamu'})
            .setOrigin(1, 4)
            .setStroke('#000000ff', 6)
            .setFill('#DBC716')
            .setDepth(6)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0);

        this.textPurpleCoins = this.add.text(posUI, this.cameras.main.centerY, this.purpleCoinScore.toString().padStart(1, '0'), {fontFamily: 'aku-kamu'})
            .setOrigin(1, 3)
            .setFontSize(fontSize + 'px')
            .setAlign('center')
            .setStroke('#000000ff', 6)
            .setFill('#621C87')
            .setDepth(6)
            .setScrollFactor(0);

        this.timerMethod();
    }

    /**
     * Crea enemigos desde la capa de objetos del mapa.
     * @deprecated Este método está duplicado, usar la creación en create() directamente
     */
    createEnemies() {
        const enemies = this.map.getObjectLayer('Enemigos').objects;
        this.goombas = this.add.group();
        this.koopas = this.add.group();
        this.piranhas = this.add.group();
        this.pokeys = this.add.group();
        
        for (const enemie of enemies) {
            if (enemie.name === 'Goomba') {
                const goomba = new Goomba(this, enemie.x, enemie.y - 16, 'Gomb_Walk', 1, 1, this.type);
                goomba.direction = 1;
                this.goombas.add(goomba);
            }
            else if (enemie.name === 'Koopa') {
                const koopa = new Koopa(this, enemie.x, enemie.y - 32, 'Koopa_walk', 1, this.type);
                koopa.direction = -1;
                this.koopas.add(koopa);
            }
            else if (enemie.name === 'Piranha') {
                const piranha = new PiranhaPlant(this, enemie.x + 33, enemie.y - 35, 'Piranha_plant', 2000, 2000);
                this.piranhas.add(piranha);
            }
            else if (enemie.name === 'Pokey') {
                const segments = enemie.properties?.find(p => p.name === 'segments')?.value || 5;
                const pokey = new Pokey(this, enemie.x, enemie.y, segments, 1);
                this.pokeys.add(pokey);                
            }
        }
    }

    /**
     * Crea objetos de juego desde una capa de objetos de Tiled usando el CLASS_MAP.
     * @param {string} layerName - Nombre de la capa de objetos en Tiled
     * @returns {Phaser.GameObjects.Group|undefined} Grupo con los objetos creados
     */
    createObjectsFromLayer(layerName) {
        const objects = this.map.getObjectLayer(layerName)?.objects;
        if (objects) {
            const ClassRef = CLASS_MAP[layerName];
            const group = this.add.group();

            objects.forEach(obj => {
                const instance = new ClassRef(this, obj);
                group.add(instance);
            });
            return group;
        }
    }

    /**
     * Crea monedas desde una capa de objetos, verificando si ya fueron recolectadas.
     * @param {string} layerName - Nombre de la capa de monedas en Tiled
     * @returns {Phaser.GameObjects.Group|undefined} Grupo con las monedas creadas
     */
    createsCoinsFromLayer(layerName) {
        const objects = this.map.getObjectLayer(layerName)?.objects;
        if (objects) {
            const ClassRef = CLASS_MAP[layerName];
            const group = this.add.group();
            let alreadyCollected = false;

            objects.forEach(obj => {
                if (obj.name === 'purple') {
                    const levelKey = this.level;
                    const collectedIds = collectedPurpleCoinsByLevel[levelKey] || [];
                    alreadyCollected = collectedIds.includes(obj.id);
                }

                const instance = new ClassRef(this, obj, alreadyCollected);
                group.add(instance);
            });
            return group;
        }
    }

    /**
     * Ejecuta una doble transición de iris para cambiar de escena.
     * @param {Function} callback - Función a ejecutar después de las transiciones
     */
    doubleEndTransition(callback) {
        if (this.levelMusic && this.levelMusic.isPlaying) {
            this.levelMusic.stop();
            this.levelMusic.destroy();
            this.levelMusic = null;
        }
        
        TransitionCode.invoke(this, this.cameras.main, 1000, this.jugador?.getCenter() || {x: this.cameras.main.width/2, y: this.cameras.main.height/2}, this.cameras.main.width, 120,
        () => {
            this.sound.play('iris-out');
            const transition2 = () => {
                TransitionCode.invoke(this, this.cameras.main, 1000, this.jugador?.getCenter() || {x: this.cameras.main.width/2, y: this.cameras.main.height/2}, 120, 0,
                () => {
                    this.cleanupBeforeSceneChange();

                    if (this.scene.isActive('LevelSelection')) {
                        this.scene.stop('LevelSelection');
                    }

                    callback();

                    this.time.delayedCall(100, () => {
                        this.scene.stop();
                    });
                });
            };
            transition2();
        });
    }

    /**
     * Transición segura entre escenas, deteniendo escenas duplicadas.
     * @param {string} targetScene - Clave de la escena objetivo
     */
    safeSceneTransition(targetScene) {
        const scenes = this.scene.manager.scenes;
        const currentScene = this.scene.key;
            
        // Detener todas las escenas excepto la actual y la objetivo
        for (let i = scenes.length - 1; i >= 0; i--) {
            const scene = scenes[i];
                
            if (scene.scene && scene.scene.key) {
                const sceneKey = scene.scene.key;
                    
                if (sceneKey !== currentScene && sceneKey !== targetScene) {
                    if (scene.scene.isActive && scene.scene.isActive()) {
                        scene.scene.stop();
                    }
                }
            }
        }
            
        this.scene.launch(targetScene);
            
        setTimeout(() => {
            this.scene.stop();
        }, 50);
    }

    /**
     * Limpia recursos antes de cambiar de escena (música, timers, grupos).
     */
    cleanupBeforeSceneChange() {
        if (this.levelMusic) {
            this.levelMusic.stop();
            this.levelMusic.destroy();
            this.levelMusic = null;
        }
        
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
        }
        
        if (this.goombas) this.goombas.clear(true, true);
        if (this.koopas) this.koopas.clear(true, true);
        if (this.piranhas) this.piranhas.clear(true, true);
        if (this.pokeys) this.pokeys.clear(true, true);
        if (this.powerups) this.powerups.clear(true, true);
        if (this.hammers) this.hammers.clear(true, true);
        
        this.tweens.killAll();
        this.time.removeAllEvents();
    }

    /**
     * Actualiza la escena cada frame.
     * @param {number} time - Tiempo total transcurrido
     * @param {number} delta - Tiempo desde el último frame
     */
    update(time, delta) {
        if (!this.endTimer) {
            this.jugador.update(time, delta);
            this.updateObjects(time, delta);

            if (!this.isBoss) {
                centerCameraOnPlayer(this, this.jugador, 0.55, 0.66);
            } else {
                centerCameraOnPlayer(this, this.jugador, 0.55, 0.75);
            }
            
            this.checkPlayerFell();
        }
    }

    /**
     * Actualiza un objeto individual o sus hijos si es un grupo.
     * @param {Object} obj - Objeto o grupo a actualizar
     * @param {number} time - Tiempo total transcurrido
     * @param {number} delta - Tiempo desde el último frame
     */
    individualUpdates(obj, time, delta) {
        if (!obj) return;

        if (obj.getChildren) {
            obj.getChildren().forEach(child => {
                if (child.update) child.update(time, delta);
            });
        }
        if (obj.update) {
            obj.update(time, delta);
        }
    }

    /**
     * Actualiza todos los objetos del nivel.
     * @param {number} time - Tiempo total transcurrido
     * @param {number} delta - Tiempo desde el último frame
     */
    updateObjects(time, delta) {
        this.individualUpdates(this.barraFinLayer, time, delta);
        this.individualUpdates(this.impulsos, time, delta);
        this.individualUpdates(this.goombas, time, delta);
        this.individualUpdates(this.koopas, time, delta);
        this.individualUpdates(this.piranhas, time, delta);
        this.individualUpdates(this.pokeys, time, delta);
        this.individualUpdates(this.fallBlock, time, delta);
        this.individualUpdates(this.pausa, time, delta);
        this.individualUpdates(this.pokey, time, delta);
        this.individualUpdates(this.pilar, time, delta);  
        this.individualUpdates(this.jupiterBoss, time, delta);  
        this.individualUpdates(this.hadesBoss, time, delta);  
    }

    /**
     * Mueve la cámara hacia la esquina inferior derecha del mapa.
     */
    moveCameraToBottomRight() {
        const camera = this.cameras.main;
        const cameraViewWidth = camera.width / camera.zoom;
        const cameraViewHeight = camera.height / camera.zoom;

        const targetX = this.map.widthInPixels - cameraViewWidth;
        const targetY = this.map.heightInPixels - cameraViewHeight;

        const clampedX = Phaser.Math.Clamp(targetX, 0, this.map.widthInPixels - cameraViewWidth);
        const clampedY = Phaser.Math.Clamp(targetY, 0, this.map.heightInPixels - cameraViewHeight);

        this.tweens.add({
            targets: camera,
            scrollX: clampedX,
            scrollY: clampedY,
            duration: 4000,
            ease: 'Cubic.Out',
        });
    }

    /**
     * Verifica si el jugador se ha caído del mapa y gestiona las consecuencias.
     */
    checkPlayerFell() {
        if (this.jugador.y > this.map.heightInPixels + 50) {
            if (this.isBoss) {
                if (this.level == "BossJ") {
                    this.sound.play("fallWater");
                }
                this.jugador.hurt();
                this.endTimer = true;
                this.jugador.setStatic(true);
                this.doubleEndTransition(() => {
                    this.scene.restart();
                });
            }
            else if (!this.jugador.isInBubble && !this.jugador.canDrop && this.jugador.bubblesLeft > 0) {
                this.sound.play('muerte');
                this.jugador.Bubble();
            }
            else if (this.jugador.bubblesLeft <= 0 && !this.jugador.isInBubble && !this.endTimer) {
                this.sound.play('muerte');
                this.endTimer = true;
                this.jugador.y = this.map.heightInPixels + 45;
                this.jugador.hurt();
                this.jugador.setStatic(true);
                this.doubleEndTransition(() => {
                    this.safeSceneTransition('LevelSelection');
                });
            }
        }
    }

    /**
     * Reinicia el nivel a su estado inicial.
     */
    restartLevel() {
        this.jugador.x = 25;
        this.jugador.y = 625;
        this.jugador.resetStates();
        this.jugador.resume();
        
        this.jugador.isHurt = false;
        this.jugador.play('mario_run', true);
        this.jugador.isInvulnerable = false;
        this.jugador.setVisible(true);
        this.jugador.bubblePhase = 0;
        this.jugador.isInBubble = false;
        this.jugador.canDrop = false;
    }

    /**
     * Configura las colisiones entre diferentes tipos de objetos del juego.
     */
    setupCollisions() {
        const M = Phaser.Physics.Matter.Matter;
        
        /**
         * Manejador de colisiones entre objetos
         * @param {Object} event - Evento de colisión
         * @param {Object} bodyA - Primer cuerpo en la colisión
         * @param {Object} bodyB - Segundo cuerpo en la colisión
         */
        const handle = (event, bodyA, bodyB) => {
            // Colisión PowerUp - Mario
            if ((bodyB.label == "PowerUp" && bodyA.label == "Mario") ||
                (bodyA.label == "PowerUp" && bodyB.label == "Mario")) {
                const powerUp = bodyA.label == "PowerUp" ? bodyA.gameObject : bodyB.gameObject;
                const player = bodyA.label == "Mario" ? bodyA.gameObject : bodyB.gameObject;
                powerUp.collect(player);
            }
            
            // Colisión Goomba - Mario
            if (bodyB.label == "Goomba" && bodyA.label == "Mario" ||
                bodyA.label == "Goomba" && bodyB.label == "Mario") {
                const goomba = bodyA.label == "Goomba" ? bodyA.gameObject : bodyB.gameObject;
                goomba.handlePlayerCollision(this.jugador);
            }
            
            // Colisión entre enemigos
            if (bodyB.label == "Goomba" && bodyA.label == "Goomba" || 
                bodyB.label == "Koopa" && bodyA.label == "Goomba" ||
                bodyB.label == "Koopa" && bodyA.label == "Koopa") {
                const goomba = bodyB.label == "Goomba" ? bodyA.gameObject : bodyB.gameObject;
                const koopa = bodyA.label == "Koopa" ? bodyA.gameObject : bodyB.gameObject;
                goomba.handleEnemyCollision(koopa);
            }
            
            // Colisión Koopa - Mario
            if (bodyB.label == "Koopa" && bodyA.label == "Mario" ||
                bodyA.label == "Koopa" && bodyB.label == "Mario") {
                const koopa = bodyA.label == "Koopa" ? bodyA.gameObject : bodyB.gameObject;
                koopa.handlePlayerCollision(this.jugador);
            }
            
            // Colisión Pokey - Mario
            if (bodyB.label == "Pokey" && bodyA.label == "Mario" ||
                bodyA.label == "Pokey" && bodyB.label == "Mario") {
                const pokey = bodyA.label == "Pokey" ? bodyA.gameObject : bodyB.gameObject;
                pokey.handlePlayerCollision(this.jugador);
            }
            
            // Colisión Piranha - Mario
            if (bodyB.label == "Piranha" && bodyA.label == "Mario" ||
                bodyA.label == "Piranha" && bodyB.label == "Mario") {
                const piranha = bodyA.label == "Piranha" ? bodyA.gameObject : bodyB.gameObject;
                piranha.handlePlayerCollision(this.jugador);
            }
        }
        
        this.matter.world.on('collisionstart', handle);
        this.matter.world.on('collisionactive', handle);
    }

    /**
     * Incrementa la puntuación del jugador.
     * @param {number} points - Cantidad de puntos a añadir
     * @param {string} [type='score'] - Tipo de puntuación: 'score', 'coins' o 'purple_coin'
     */
    increaseScore(points, type = 'score') {
        if (type === 'score') {
            if (this.score < 9999999999) {
                this.score += points;
                this.textScore.setText("".padStart(10 - this.score.toString().length, "0") + this.score);
            } else {
                this.textScore.setText("9999999999");
            }
        } else if (type === 'coins') {
            this.sound.play('coin_sound');
            this.coinScore += points;
            if (this.textCoins) {
                this.textCoins.setText(this.coinScore.toString().padStart(2, '0'));
            }
        } else if (type == 'purple_coin') {
            this.purpleCoinScore += points;
            purpleCoinsByLevel[this.level] = this.purpleCoinScore;
            localStorage.setItem('w9_purpleCoinsByLevel', JSON.stringify(purpleCoinsByLevel));
            
            if (this.purpleCoinScore < 5) {
                this.sound.play('purple_coin_sound');
            } else {
                this.sound.play('purple_coin_all_sound');
            }
            
            if (this.textPurpleCoins) {
                this.textPurpleCoins.setText(this.purpleCoinScore.toString().padStart(1, '0'));
            }
        }
    }

    /**
     * Configura el temporizador del nivel.
     */
    timerMethod() {
        this.endTimer = false;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            loop: true,
            callback: () => {
                if (!this.endTimer) {
                    this.textTimer.setText(this.timer.toString().padStart(2, '0'));
                    if (this.timer == 0) {
                        this.endTimer = true;
                        this.sound.play('muerte');
                        this.jugador.hurt();
                        this.jugador.setStatic(true);
                        this.doubleEndTransition(() => {
                            this.safeSceneTransition('LevelSelection');
                        });
                    }
                    if (!this.jugador.isInBubble) {
                        this.timer = this.timer - 1;
                    }
                } else {
                    this.timer = 0;
                    this.textTimer.setText(this.timer.toString().padStart(2, '0'));
                }
            },
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.timerEvent?.remove(false);
        });
    }

    /**
     * Maneja la lógica cuando el jugador gana el nivel.
     */
    ganasPartida() {
        this.endTimer = true;
        this.moveCameraToBottomRight();

        // Destruir todos los enemigos
        this.goombas.getChildren().forEach(goomba => {
            if (goomba.safeDestroy && !goomba.shouldBeDestroyed) {
                goomba.safeDestroy();
            }
        });

        this.koopas.getChildren().forEach(koopa => {
            if (koopa.safeDestroy && !koopa.shouldBeDestroyed) {
                koopa.safeDestroy();
            }
        });

        this.piranhas.getChildren().forEach(piranha => {
            if (piranha.safeDestroy && !piranha.shouldBeDestroyed) {
                piranha.safeDestroy();
            }
        });

        this.pokeys.getChildren().forEach(pokey => {
            if (pokey.safeDestroy && !pokey.shouldBeDestroyed) {
                pokey.safeDestroy();
            }
        });

        if (this.jupiterBoss) this.jupiterBoss.defeat();
        if (this.horus) this.horus.defeat();
        if (this.hadesBoss) this.hadesBoss.defeat();

        this.saveManager.markLevelCompleted(this.level);
        this.saveManager.updateLevelScore(this.level, this.score, this.purpleCoinScore);

        this.jugador.win();
        this.jugador.play('mario_stop', true);

        if (this.levelMusic && this.levelMusic.isPlaying) {
            this.levelMusic.stop();
        }

        const victoryMusic = this.sound.add('victory_music');
        victoryMusic.play();
        victoryMusic.once('complete', () => {
            this.jugador.play('mario_victory', true);
            setTimeout(() => {
                this.doubleEndTransition(() => {
                    this.safeSceneTransition('LevelSelection');
                });
            }, 1000);
        });
    }

    /**
     * Limpia recursos al cerrar la escena.
     */
    shutdown() {
        if (this.levelMusic && this.levelMusic.isPlaying) {
            this.levelMusic.stop();
            this.levelMusic.destroy();
        }
        
        this.jugador = null;
        this.map = null;
        this.timerEvent?.remove();
        
        this.goombas?.clear(true, true);
        this.koopas?.clear(true, true);
        this.piranhas?.clear(true, true);
        this.pokeys?.clear(true, true);
        this.powerups?.clear(true, true);
        this.hammers?.clear(true, true);
        
        this.time.removeAllEvents();
        this.tweens.killAll();
        
        this.endTimer = true;
        this.enPausa = false;
    }

    /**
     * Solicita un martillo del pool de objetos reciclables.
     * @param {Object} player - Jugador que solicita el martillo
     * @returns {Phaser.Physics.Matter.Sprite} Martillo creado o reciclado
     */
    requestHammer(player) {
        let hammer = this.hammers.getChildren().find(h => !h.active);

        if (!hammer) {
            hammer = this.matter.add.sprite(player.x, player.y, 'hammer');
            hammer.setCircle(8);
            hammer.setBounce(0.8);
            hammer.setIgnoreGravity(false);
            hammer.setFixedRotation();
            hammer.isHammer = true;
            hammer.used = false;
            hammer.setDepth(6);

            hammer._bounces = 0;
            hammer._maxBounces = 3;

            hammer.setOnCollide((collision) => {
                if (hammer.used) return;

                const bodyA = collision.bodyA;
                const bodyB = collision.bodyB;
                const other = (bodyA === hammer.body) ? bodyB : bodyA;
                const otherGO = other?.gameObject;

                if (otherGO && otherGO.isEnemy && typeof otherGO.die === 'function') {
                    otherGO.die(DIE_TYPES.HAMMER);
                }

                if (other && other.isStatic) {
                    hammer._bounces++;

                    if (hammer._bounces >= hammer._maxBounces) {
                        hammer.used = true;
                        hammer.setBounce(0);

                        this.time.delayedCall(300, () => {
                            this.recycleHammer(hammer);
                        });
                    }
                }
            });

            this.hammers.add(hammer);
        }

        hammer.used = false;
        hammer._bounces = 0;
        hammer.setBounce(0.4);
        hammer.setIgnoreGravity(false);
        hammer.setActive(true);
        hammer.setVisible(true);
        hammer.setVelocity(0, 0);
        hammer.setAngularVelocity(0);
        hammer.setDepth(6);

        return hammer;
    }

    /**
     * Recicla un martillo para su reutilización.
     * @param {Phaser.Physics.Matter.Sprite} hammer - Martillo a reciclar
     */
    recycleHammer(hammer) {
        if (!hammer) return;

        hammer.used = false;
        hammer._bounces = 0;
        hammer.setActive(false);
        hammer.setVisible(false);
        hammer.setVelocity(0, 0);
        hammer.setAngularVelocity(0);
        hammer.setPosition(-1000, -1000);
    }
}

export default EscenaBase;