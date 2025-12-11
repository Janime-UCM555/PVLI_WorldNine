/**
 * Importación del botón de UI.
 * @module UI/Button
 */
import Button from '../../gameObjects/UI/Button.js';
/**
 * 
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
import{
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

export const purpleCoinsByLevel = {
    Nivel_T: 0,
    Nivel_R: 0,
    Nivel_D: 0,
    Nivel_G: 0,
    // BossJ: 0,
    // BossH: 0,
    // BossHades: 0
};

export const collectedPurpleCoinsByLevel = {
    Nivel_T: [],
    Nivel_R: [],
    Nivel_D: [],
    Nivel_G: [],
    // BossJ: [],
    // BossH: [],
    // BossHades: []
};

const savedCounts = localStorage.getItem('w9_purpleCoinsByLevel');
if (savedCounts) {
    try {
        const parsed = JSON.parse(savedCounts);
        Object.assign(purpleCoinsByLevel, parsed);
    } catch (e) {
        console.warn('No se pudieron cargar las monedas moradas guardadas', e);
    }
}

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
 * Mapa que relaciona nombres de capas con clases constructoras.
 * Sirve como fábrica para crear objetos desde Tiled.
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
class EscenaBase extends Phaser.Scene {
    constructor(key, callback, IsBoss) {
        super({ key: key });

        this.level = key;
        this.mapKey = this.level + '_map';
        this.isBoss = IsBoss;
        this.customLayer = callback;
        this.saveManager = saveManager;
        this.levelType = "Normal";
        this.type = 0;
        
        if (this.level == "Nivel_R"||this.level=="BossJ")
        {
            console.log("Roma");
            this.levelType="Roma";
            this.type = 1;
        }
        else if (this.level=="Nivel_D"||this.level == "BossH")
        {
            console.log("Egipto");
            this.levelType="Egipto";
            this.type = 2;
        }
        else if (this.level=="Nivel_G"||this.level == "BossHades")
        {
            console.log("Grecia");
            this.levelType="Grecia";
            this.type = 3;
        }
    }

    preload() {
        console.log('=== INICIO ===');
        // Preload común
    }

    create() {

         this.purpleCoinScore = purpleCoinsByLevel[this.level] ?? 0;

        // Actualizar la interfaz web
        if (window.updateWebStatus) {
            window.updateWebStatus({
                sceneKey: this.level, 
                purpleCoins: this.purpleCoinScore ?? 0,
                isBoss: this.isBoss
            });
        }

        this.map = this.make.tilemap({ key: this.mapKey, tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('MapaTiles', 'mi_tileset');
        this.tile = tileset;
        this.customLayer();

        // Aquí se llama al factory
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

        if (this.map.getLayer('CapaFrente'))
        {       
            this.frontLayer = this.map.createLayer('CapaFrente', tileset, 0, 0);
            this.frontLayer?.setDepth(4);
        }
        if (this.map.getLayer('CapaDecoraciones'))
        {
            this.decorationsLayer = this.map.createLayer('CapaDecoraciones', tileset, 0, 0);
            this.decorationsLayer?.setDepth(1);
        }
        if (this.map.getLayer('CapaFalsoSuelo'))
        {
            this.fakeFloorLayer = this.map.createLayer('CapaFalsoSuelo', tileset, 0, 0);
            this.fakeFloorLayer?.setTint(0x888888);
            this.fakeFloorLayer?.setDepth(0);
        }
        this.groundLayer = this.map.createLayer('CapaSuelo', tileset, 0, 0);
        this.groundLayer?.setDepth(1);
        this.barraFinLayer = this.createObjectsFromLayer('BarraFin');
        this.barraFinLayer?.setDepth(8);

        // Ponemos colisión a las tiles
        this.map.setCollisionByExclusion([ -1, 0 ]);
        this.matter.world.convertTilemapLayer(this.groundLayer);
        this.groundLayer.forEachTile(tile => {
            if (tile.physics.matterBody) {
                const body = tile.physics.matterBody.body;
                // Quita la fricción
                body.friction = 0;
                body.frictionStatic = 0;
                body.frictionAir = 0;
                body.restitution = 0;
                
                body.collisionFilter.category = CATEGORY_TERRAIN;
                body.collisionFilter.mask     = CATEGORY_PLAYER | CATEGORY_ENEMY;
            }
        });

        
        if (!this.isBoss)
        {
            this.jugador = new Mario(this, 25, 625, 'mario_run', 3.5, -3.75, true, false);
        }

        if (!this.jugador){console.error("No se ha podido crear a Mario");}    

        this.jugador.setDepth(3);
            
            // Forzar la inicialización de animaciones
            if (this.anims.exists('mario_run')) {
                this.jugador.play('mario_run');
            }


        this.setupCollisions();

        this.powerups = this.add.group();
        this.hammers = this.add.group();

        // Configurar mejor los límites del mundo
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.ui = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2).setDepth(10);
        // this.ui.add([this.buttonPrueba]);
        
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        // Zoom más cercano (1.65 es 65% más cercano)
        this.cameras.main.setZoom(1.65);
        
        if (!this.openedScene)
        {
            this.jugador?.setStatic(true);
            TransitionCode.invoke(this, this.cameras.main, 1000,this.jugador?.getCenter(), 0, 120, ()=>{
                transition2();
            });
            const transition2 = () => {
                TransitionCode.invoke(this, this.cameras.main, 600,this.jugador?.getCenter(), 120, this.cameras.main.width,
                ()=>{
                    this.openedScene = true;
                    this.jugador?.setStatic(false);
                    this.jugador?.resume(); // Reanudar movimiento
                });
            }
        }
        this.irisSound = this.sound.add('iris-out');

        // Quitamos la colisión con los bordes del mapa
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, 0, false, false, false, false);
        this.createText();  


        const enemies = this.map.getObjectLayer('Enemigos').objects;
        this.goombas = this.add.group();
        this.koopas = this.add.group();
        this.piranhas = this.add.group();
        this.pokeys = this.add.group();
        for (const enemie of enemies)
        {
            if (enemie.name === 'Goomba')
            {
                const goomba = new Goomba(
                    this,
                    enemie.x,
                    enemie.y -16, 
                    'Gomb_Walk',
                    1,
                    1,
                    this.type
                );
                goomba.direction = 1;
                this.goombas.add(goomba);
                goomba.setDepth(2);
                goomba.setCollisionCategory(CATEGORY_ENEMY);
                goomba.setCollidesWith([CATEGORY_PLAYER,CATEGORY_TERRAIN, CATEGORY_ENEMY]);
            }
            else if (enemie.name === 'Koopa')
            {
                const koopa = new Koopa(
                    this,
                    enemie.x,
                    enemie.y - 32, 
                    'Koopa_walk',
                    1,
                    this.type
                );
                koopa.direction = -1;
                this.koopas.add(koopa);
                koopa.setDepth(2);
                koopa.setCollisionCategory(CATEGORY_ENEMY);
                koopa.setCollidesWith([CATEGORY_PLAYER,CATEGORY_TERRAIN, CATEGORY_ENEMY]);
            }
            else if (enemie.name === 'Piranha')
            {
                const inverse = enemie.properties?.find(p => p.name === 'inverse')?.value || false;
                // console.log('PIRANYA');
                const piranha = new PiranhaPlant(
                    this,
                    enemie.x + 33,
                    enemie.y - 35, 
                    'Piranha_plant',
                    2000,
                    2000,
                    inverse
                );
                this.piranhas.add(piranha);
                piranha.setCollisionCategory(CATEGORY_ENEMY);
                piranha.setCollidesWith([CATEGORY_PLAYER,CATEGORY_TERRAIN, CATEGORY_ENEMY]);
            }
            else if (enemie.name === 'Pokey')
            {
                const segments = enemie.properties?.find(p => p.name === 'segments')?.value || 5;
                const pokey = new Pokey(this, enemie.x, enemie.y, segments, 1);
                this.pokeys.add(pokey);
                // pokey.setDepth(2);
                
            }
        }
        
        this.openedScene = false;
        // Create común
    }
    createText()
    {
    // Este gráfico representa la línea dónde se alinea la UI por la derecha

    // var graphics = this.add.graphics();

    const posUI = this.cameras.main.centerX+this.cameras.main.centerX/2; // Posición UI por la derecha
    // graphics.lineStyle(1, 0xffffff, 1);
    // graphics.lineBetween(posUI, 0,posUI, 600);
    // graphics.setScrollFactor(0);

    const fontSize = 29; // 50 / 1.65 ≈ 29
        // if(this.game.config.physics?.matter?.debug){
        // this.fpsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -',{fontFamily: 'aku-kamu'})
        //     .setOrigin(-2,5)
        //     .setStroke('#000000ff', 6)
        //     .setFill('#38b762ff')
        //     .setFontSize(fontSize + 'px')
        //     .setDepth(6)
        //     .setScrollFactor(0);
        // }
            
        

        this.textTimer = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '00',{fontFamily: 'aku-kamu'})
        .setOrigin(0.5,5)
        .setStroke('#000000ff', 6)
        .setFill('#ffffffff')
        // .setText("60")
        .setDepth(6)
        .setFontSize(fontSize + 'px')
        .setScrollFactor(0)

        this.textScore = this.add.text(posUI, this.cameras.main.centerY,"".padStart(10,"0"),{fontFamily: 'aku-kamu'})
        .setOrigin(1,5)
        .setStroke('#000000ff', 6)
        .setFill('#ffffffff')
        .setDepth(6)
        .setFontSize(fontSize + 'px')
        .setScrollFactor(0);

        this.textCoins = this.add.text(posUI, this.cameras.main.centerY, "".padStart(2,"0"),{fontFamily: 'aku-kamu'})
        .setOrigin(1,4)
        .setStroke('#000000ff', 6)
        .setFill('#DBC716')
        .setDepth(6)
        .setFontSize(fontSize + 'px')
        .setScrollFactor(0);

        this.textPurpleCoins = this.add.text(posUI, this.cameras.main.centerY, this.purpleCoinScore.toString().padStart(1, '0'),{fontFamily: 'aku-kamu'})
        .setOrigin(1,3)
        .setFontSize(fontSize + 'px')
        .setAlign('center')
        .setStroke('#000000ff', 6)
        .setFill('#621C87')
        .setDepth(6)
        .setScrollFactor(0);

        this.timerMethod();
    }

    createEnemies()
    {
        const enemies = this.map.getObjectLayer('Enemigos').objects;
        this.goombas = this.add.group();
        this.koopas = this.add.group();
        this.piranhas = this.add.group();
        this.pokeys = this.add.group();
        for (const enemie of enemies)
        {
            if (enemie.name === 'Goomba')
            {
                const goomba = new Goomba(
                    this,
                    enemie.x,
                    enemie.y -16, 
                    'Gomb_Walk',//
                    1,
                    1,
                    this.type
                );
                goomba.direction = 1;
                this.goombas.add(goomba);
            }
            else if (enemie.name === 'Koopa')
            {
                const koopa = new Koopa(
                    this,
                    enemie.x,
                    enemie.y - 32, 
                    'Koopa_walk',
                    1,
                    this.type
                );
                koopa.direction = -1;
                this.koopas.add(koopa);
            }
            else if (enemie.name === 'Piranha')
            {
                const piranha = new PiranhaPlant(
                    this,
                    enemie.x + 33,
                    enemie.y - 35, 
                    'Piranha_plant',
                    2000,
                    2000
                );
                this.piranhas.add(piranha);
            }
            else if (enemie.name === 'Pokey')
            {
                const segments = enemie.properties?.find(p => p.name === 'segments')?.value || 5;
                const pokey = new Pokey(this, enemie.x, enemie.y, segments, 1);
                this.pokeys.add(pokey);                
            }
        }
    }

createObjectsFromLayer(layerName) {
    const objects = this.map.getObjectLayer(layerName)?.objects;
    if (objects)
    {
        const ClassRef = CLASS_MAP[layerName];

        const group = this.add.group();

        objects.forEach(obj => {
            const instance = new ClassRef(this, obj);
            group.add(instance);
        });
        return group;
    }
}

createsCoinsFromLayer(layerName) {
    const objects = this.map.getObjectLayer(layerName)?.objects;
    if (objects)
    {
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
doubleEndTransition(callback)
{
    if (this.levelMusic && this.levelMusic.isPlaying) {
        this.levelMusic.stop();
        this.levelMusic.destroy();
        this.levelMusic = null;
    }
    TransitionCode.invoke(this, this.cameras.main, 1000, this.jugador?.getCenter() || {x: this.cameras.main.width/2, y: this.cameras.main.height/2}, this.cameras.main.width, 120,
    ()=>{
        this.sound.play('iris-out');
        const transition2 = () => {
            TransitionCode.invoke(this, this.cameras.main, 1000, this.jugador?.getCenter() || {x: this.cameras.main.width/2, y: this.cameras.main.height/2}, 120, 0,
            ()=>{
                // Limpiar recursos antes de cambiar de escena
                this.cleanupBeforeSceneChange();

                // Asegurarse de que no haya escenas duplicadas
                if (this.scene.isActive('LevelSelection')) {
                    this.scene.stop('LevelSelection');
                }

                // Ejecutar el callback
                callback();

                // Detener esta escena después de un pequeño delay
                this.time.delayedCall(100, () => {
                    this.scene.stop();
                });
            });
        };
        transition2();
    });
}
safeSceneTransition(targetScene) {
    // Obtener todas las instancias de escenas del manager
    const scenes = this.scene.manager.scenes;
    const currentScene = this.scene.key;
        
    // Detener todas las escenas excepto la actual y la objetivo
    for (let i = scenes.length - 1; i >= 0; i--) {
        const scene = scenes[i];
            
        // Verificar que la escena tenga la propiedad scene.key
        if (scene.scene && scene.scene.key) {
            const sceneKey = scene.scene.key;
                
            // Detener escenas que no sean la actual ni la objetivo
            if (sceneKey !== currentScene && sceneKey !== targetScene) {
                if (scene.scene.isActive && scene.scene.isActive()) {
                    scene.scene.stop();
                }
            }
        }
    }
        
    // Lanzar la nueva escena
    this.scene.launch(targetScene);
        
    // Detener la escena actual después de un breve retraso
    setTimeout(() => {
        this.scene.stop();
    }, 50);
}
cleanupBeforeSceneChange() {
    // Detener todos los sonidos
    if (this.levelMusic) {
        this.levelMusic.stop();
        this.levelMusic.destroy();
        this.levelMusic = null;
    }
    
    // Limpiar timers
    if (this.timerEvent) {
        this.timerEvent.remove();
        this.timerEvent = null;
    }
    
    // Limpiar grupos
    if (this.goombas) this.goombas.clear(true, true);
    if (this.koopas) this.koopas.clear(true, true);
    if (this.piranhas) this.piranhas.clear(true, true);
    if (this.pokeys) this.pokeys.clear(true, true);
    if (this.powerups) this.powerups.clear(true, true);
    if (this.hammers) this.hammers.clear(true, true);
    
    // Detener todas las animaciones
    this.tweens.killAll();
    this.time.removeAllEvents();
}
update(time, delta) {
    // if (!this.fpsText || !this.fpsText.scene || this.fpsText._destroyed) return;
    if (!this.endTimer)
    {
        // this.fpsText?.setText(Math.floor(this?.game?.loop?.actualFps));
        // Actualizar jugador
        this.jugador.update(time,delta);

        // Actualizar objetos
        this.updateObjects(time, delta);

        if (!this.isBoss)
        {
            // Posicionar bien la cámara respecto al jugador
            centerCameraOnPlayer(this,this.jugador, 0.55, 0.66);
        }
        else{
            centerCameraOnPlayer(this,this.jugador, 0.55, 0.75);
        }
        // Comprobar si el jugador se ha caído
        this.checkPlayerFell();
    }
}
individualUpdates(obj,time,delta)
{
    if(!obj) {return;}

    if(obj.getChildren)
    {
        obj.getChildren().forEach(child=>{
            if(child.update){child.update(time,delta);}
        });
    }
    if(obj.update)
    {
        obj.update(time,delta);
    }
}
// Actualizar objetos
updateObjects(time, delta) {
    // Actualizar barra final
    this.individualUpdates(this.barraFinLayer, time,delta)
    this.individualUpdates(this.impulsos, time,delta)
    this.individualUpdates(this.goombas, time,delta)
    this.individualUpdates(this.koopas, time,delta)
    this.individualUpdates(this.piranhas, time,delta)
    this.individualUpdates(this.pokeys, time,delta)
    this.individualUpdates(this.fallBlock, time,delta)
    this.individualUpdates(this.pausa, time,delta)
    this.individualUpdates(this.pokey, time,delta)
    this.individualUpdates(this.pilar, time,delta)  
    this.individualUpdates(this.jupiterBoss, time,delta)  
    this.individualUpdates(this.hadesBoss, time,delta)  
}
moveCameraToBottomRight() {
    const camera = this.cameras.main;

    // Calcular las dimensiones de la vista de la cámara considerando el zoom
    const cameraViewWidth = camera.width / camera.zoom;
    const cameraViewHeight = camera.height / camera.zoom;

    // Calcular la posición objetivo (esquina inferior derecha)
    const targetX = this.map.widthInPixels - cameraViewWidth;
    const targetY = this.map.heightInPixels - cameraViewHeight;

    // Asegurarse de no salirse de los límites del mapa
    const clampedX = Phaser.Math.Clamp(targetX, 0, this.map.widthInPixels - cameraViewWidth);
    const clampedY = Phaser.Math.Clamp(targetY, 0, this.map.heightInPixels - cameraViewHeight);

    // Movimiento suave
    this.tweens.add({
        targets: camera,
        scrollX: clampedX,
        scrollY: clampedY,
        duration: 4000, // 4 segundos para el movimiento
        ease: 'Cubic.Out', // Suavizado al final
    });
}
checkPlayerFell() {
    if (this.jugador.y > this.map.heightInPixels + 50) {
        if (this.isBoss)
        {
            if(this.level == "BossJ")
            {
                this.sound.play("fallWater");
            }
            this.jugador.hurt();
            this.endTimer=true;
            this.jugador.setStatic(true);
            this.doubleEndTransition(()=>{
                this.scene.restart();
            });
        }
        else if (!this.jugador.isInBubble && !this.jugador.canDrop && this.jugador.bubblesLeft > 0)
        {
            this.sound.play('muerte');
            this.jugador.Bubble();
        }
        else if (this.jugador.bubblesLeft <= 0 && !this.jugador.isInBubble && !this.endTimer)
        {
            this.sound.play('muerte');
            this.endTimer=true;
            this.jugador.y = this.map.heightInPixels + 45;
            this.jugador.hurt();
            this.jugador.setStatic(true);
            this.doubleEndTransition(()=>{this.safeSceneTransition('LevelSelection');});
        }
    }
}
restartLevel() {
    // Reiniciar la escena o reposicionar el jugador
    this.jugador.x = 25;
    this.jugador.y = 625;
    this.jugador.resetStates(); // Resetear estados
    this.jugador.resume(); // Reanudar movimiento
    if (this.jugador.body) {
        // this.jugador.setVelocity(0, 0);
    }
    // Resetear estado de daño
    this.jugador.isHurt = false;
    // Asegurar animación correcta al reiniciar
    this.jugador.play('mario_run', true);
    // Resetear invulnerabilidad
    this.jugador.isInvulnerable = false;
    this.jugador.setVisible(true);
    this.jugador.bubblePhase = 0;
    this.jugador.isInBubble = false;
    this.jugador.canDrop = false;
}
setupCollisions() {
    const M = Phaser.Physics.Matter.Matter;
    // Colisión con barra final
    const handle = (event, bodyA, bodyB) => {
        if ((bodyB.label=="PowerUp" && bodyA.label=="Mario") ||
            (bodyA.label=="PowerUp" && bodyB.label=="Mario"))// && bodyA.gameObject == this.jugador)
        {
            const powerUp  = bodyA.label=="PowerUp"  ? bodyA.gameObject : bodyB.gameObject;
            const player = bodyA.label=="Mario" ? bodyA.gameObject : bodyB.gameObject;

            powerUp.collect(player);
        }
        
        if(bodyB.label=="Goomba" && bodyA.label=="Mario"  ||
        bodyA.label=="Goomba" && bodyB.label=="Mario"  )
        {
            const goomba  = bodyA.label=="Goomba"  ? bodyA.gameObject : bodyB.gameObject;
            // const player = bodyA.label=="Mario" ? bodyA.gameObject : bodyB.gameObject;

            goomba.handlePlayerCollision(this.jugador);
        }
        if(bodyB.label=="Goomba" && bodyA.label=="Goomba" || 
            bodyB.label=="Koopa" && bodyA.label=="Goomba" ||
            bodyB.label=="Koopa" && bodyA.label=="Koopa")
        {
            const goomba  = bodyB.label=="Goomba"  ? bodyA.gameObject : bodyB.gameObject;
            const koopa = bodyA.label=="Koopa" ? bodyA.gameObject : bodyB.gameObject;

            goomba.handleEnemyCollision(koopa);
        }
        if(bodyB.label=="Koopa" && bodyA.label=="Mario"  ||
            bodyA.label=="Koopa"&& bodyB.label=="Mario" )
        {
            // const player  = bodyB.label=="Mario"  ? bodyA.gameObject : bodyB.gameObject;
            const koopa = bodyA.label=="Koopa" ? bodyA.gameObject : bodyB.gameObject;

            koopa.handlePlayerCollision(this.jugador);
        }
        if(bodyB.label=="Pokey" && bodyA.label=="Mario" ||
        bodyA.label=="Pokey" && bodyB.label=="Mario")
        {
            const pokey = bodyA.label=="Pokey" ? bodyA.gameObject : bodyB.gameObject;
            
            pokey.handlePlayerCollision(this.jugador);
        }
        if(bodyB.label=="Piranha" && bodyA.label=="Mario" ||
        bodyA.label=="Piranha" && bodyB.label=="Mario")
        {
            const piranha = bodyA.label=="Piranha" ? bodyA.gameObject : bodyB.gameObject;
            
            piranha.handlePlayerCollision(this.jugador);
        }
    }
    
    this.matter.world.on('collisionstart', handle);
    this.matter.world.on('collisionactive', handle);
}

increaseScore(points, type = 'score'){
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
    } else if (type == 'purple_coin'){
        this.purpleCoinScore += points;
        // Guardar inmediatamente en localStorage también
        purpleCoinsByLevel[this.level] = this.purpleCoinScore;
        localStorage.setItem('w9_purpleCoinsByLevel', JSON.stringify(purpleCoinsByLevel));
        if(this.purpleCoinScore < 5)
        {
            this.sound.play('purple_coin_sound');
        }
        else{
            this.sound.play('purple_coin_all_sound');
        }
        if (this.textPurpleCoins) {
            this.textPurpleCoins.setText(this.purpleCoinScore.toString().padStart(1, '0'));
        }
    }
}

timerMethod ()
{
    this.endTimer = false;
    this.timerEvent = this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: () => {
        if (!this.endTimer)
        {
            this.textTimer.setText(this.timer.toString().padStart(2, '0'));
            if (this.timer == 0) {
                this.endTimer=true;
                this.sound.play('muerte');
                this.jugador.hurt();
                this.jugador.setStatic(true);
                this.doubleEndTransition(
                ()=>{this.safeSceneTransition('LevelSelection');});
            }
            if (!this.jugador.isInBubble) {
                this.timer = this.timer - 1; // reinicia a 60
            }
        }
        else{
            this.timer = 0;
            this.textTimer.setText(this.timer.toString().padStart(2, '0'));
        }
    },
    });

    // Eventos para limpiar listeners al cerrar la escena
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    this.timerEvent?.remove(false);
    });
}

ganasPartida() {
    this.endTimer=true;

    this.moveCameraToBottomRight();

    // Destruir todos los Goombas
    this.goombas.getChildren().forEach(goomba => {
        if (goomba.safeDestroy && !goomba.shouldBeDestroyed) {
            goomba.safeDestroy();
        }
    });

    // Destruir todos los Koopas
    this.koopas.getChildren().forEach(koopa => {
        if (koopa.safeDestroy && !koopa.shouldBeDestroyed) {
            koopa.safeDestroy();
        }
    });

    // Destruir todas las plantas piraña
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

    if (this.jupiterBoss) {
        this.jupiterBoss.defeat();
    }

    if (this.horus) {
        this.horus.defeat();
    }

    if (this.hadesBoss) {
        this.hadesBoss.defeat();
    }

    this.saveManager.markLevelCompleted(this.level);
    this.saveManager.updateLevelScore(this.level, this.score, this.purpleCoinScore);

    this.jugador.win();
    this.jugador.play('mario_stop', true);

    // Detener música de nivel al ganar
    if (this.levelMusic && this.levelMusic.isPlaying) {
        this.levelMusic.stop();
    }

    const victoryMusic = this.sound.add('victory_music');
    victoryMusic.play();
    victoryMusic.once('complete', () => {
    this.jugador.play('mario_victory', true);
    setTimeout(() => {
        this.doubleEndTransition(()=>{
            this.safeSceneTransition('LevelSelection');
        });
    }, 1000);
    });
}
shutdown() {
    // Limpiar explícitamente todos los recursos
    if (this.levelMusic && this.levelMusic.isPlaying) {
        this.levelMusic.stop();
        this.levelMusic.destroy();
    }
    
    // Limpiar todas las referencias
    this.jugador = null;
    this.map = null;
    this.timerEvent?.remove();
    
    // Limpiar grupos
    this.goombas?.clear(true, true);
    this.koopas?.clear(true, true);
    this.piranhas?.clear(true, true);
    this.pokeys?.clear(true, true);
    this.powerups?.clear(true, true);
    this.hammers?.clear(true, true);
    
    // Limpiar todas las tareas pendientes
    this.time.removeAllEvents();
    this.tweens.killAll();
    
    // Restablecer estado
    this.endTimer = true;
    this.enPausa = false;
}
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

        // Config rebotes por primera vez
        hammer._bounces = 0;
        hammer._maxBounces = 3;

        // Manejar colisiones
       hammer.setOnCollide((collision) => {
            if (hammer.used) return; // si ya no hace daño, ignorar

            const bodyA = collision.bodyA;
            const bodyB = collision.bodyB;
            const other = (bodyA === hammer.body) ? bodyB : bodyA;

            const otherGO = other?.gameObject;

            // 🔹 Interface común de enemigos
            if (otherGO && otherGO.isEnemy && typeof otherGO.die === 'function') {
                otherGO.die(DIE_TYPES.HAMMER);
            }

            // Rebote solo contra bloques u objetos estáticos
            if (other && other.isStatic) {
                hammer._bounces++;

                if (hammer._bounces >= hammer._maxBounces) {
                    hammer.used = true;        // ya no hace daño
                    hammer.setBounce(0);       // sin rebote

                    // Desaparecer después de 0.3s
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