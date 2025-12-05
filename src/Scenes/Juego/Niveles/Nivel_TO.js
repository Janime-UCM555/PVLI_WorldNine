import Button from '../../../gameObjects/UI/Button.js';
import Mario from '../../../gameObjects/Player/Mario.js';
import Fin from '../../../gameObjects/LevelBlockObjects/BarraFin.js';
import Goomba from '../../../gameObjects/Enemies/Goomba.js';
import Koopa from '../../../gameObjects/Enemies/Koopa.js';
import PiranhaPlant from '../../../gameObjects/Enemies/PiranhaPlant.js';
import Pokey from '../../../gameObjects/Enemies/Pokey.js';
import TransitionCode from '../../../gameObjects/UI/Transition.js'
import SceneBlocks from '../../../gameObjects/LevelBlockObjects/SceneBlocks.js';
import Block from '../../../gameObjects/LevelBlockObjects/BreakBlock.js';
import PauseBlock from '../../../gameObjects/LevelBlockObjects/PauseBlock.js';
import OneWay from '../../../gameObjects/LevelBlockObjects/OneWay.js';
import Spikes from '../../../gameObjects/LevelBlockObjects/Spikes.js';
import Coins from '../../../gameObjects/LevelBlockObjects/Coins.js';
import Impulse from '../../../gameObjects/LevelBlockObjects/Impulse.js';
import CoinPath from '../../../gameObjects/LevelBlockObjects/CoinPath.js';
import FallBlock from '../../../gameObjects/LevelBlockObjects/FallBlock.js';
import spawnPowerUp from "../../../gameObjects/PowerUps/PowerUpSpawn.js"
import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_TERRAIN,
    CATEGORY_FALLOFF
} from "../../../gameObjects/collisionCategories.js"

import { PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import Star from '../../../gameObjects/PowerUps/Star.js';
import { DIE_TYPES } from '../../../gameObjects/Enemies/Goomba.js';

const M = Phaser.Physics.Matter.Matter;
/**
 * Pillamos el nombre del default después de pillar en nombre de la capa
 */
const CLASS_MAP = {
    Bloques: Block,
    FallOffs: FallBlock,
    OneWays: OneWay,
    Pinchos: Spikes,
    PauseBlocks: PauseBlock,
    Impulsos: Impulse,
    CaminoMonedas: CoinPath,
    Monedas: Coins,
    BarraFin: Fin,
};
class Nivel_TO extends Phaser.Scene
{
    constructor(){
        super({key:'Nivel_TO'});
    }
    
    init(){
//
    }

    preload(){
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON('map', 'MapaDeTiled/TestObjetos.json');
        this.score=0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.enPausa = false;
    }

    create(){
        // this.cameras.main.setZoom(2);
        // Crear mapa desde Tiled
        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('MapaTiles', 'mi_tileset');
        const tilesetBG = this.map.addTilesetImage('bg', 'bg_tileset');

        // Capa de suelo
        const bgLayer = this.map.createLayer('CapaFondo', tilesetBG, 0, 0);
        // const decorationsLayer = this.map.createLayer('CapaDecoraciones', tileset, 0, 0);
        // aquí llamarás al factory
        this.fallBlock  = this.createObjectsFromLayer('FallOffs');
        this.spikes     = this.createObjectsFromLayer('Pinchos');
        this.impulsos   = this.createObjectsFromLayer('Impulsos');

        this.blocks = this.createObjectsFromLayer('Bloques');
        this.pausa = this.createObjectsFromLayer('PauseBlocks');
        this.oneWay = this.createObjectsFromLayer('OneWays');
        this.coinPath = this.createObjectsFromLayer('CaminoMonedas');

        this.coins = this.createObjectsFromLayer('Monedas');
        // const enemies = this.map.getObjectLayer('Enemigos').objects;
        this.groundLayer = this.map.createLayer('CapaSuelo', tileset, 0, 0);
        this.groundLayer.setDepth(1);
        this.barraFinLayer = this.createObjectsFromLayer('BarraFin');

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

        

        this.jugador = new Mario(this, 25, 625, 'mario_run', 3.5, -3.75, true, false);
        this.jugador.setDepth(3);

        // Forzar la inicialización de animaciones
        if (this.anims.exists('mario_run')) {
            this.jugador.play('mario_run');
        }
        const frontLayer = this.map.createLayer('CapaFrente', tileset, 0, 0);
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

        // Música de fondo del nivel
        if (!this.levelMusic || !this.levelMusic.isPlaying) {
            this.levelMusic = this.sound.add('level_music', { loop: true, volume: 1 });
            this.levelMusic.play();
        }

        var openedScene = false;
        if (!openedScene)
        {
            this.jugador.setStatic(true);
            TransitionCode.invoke(this, this.cameras.main, 1000,this.jugador.getCenter(), 0, 120, ()=>{
                transition2();
            });
            const transition2 = () => {
                TransitionCode.invoke(this, this.cameras.main, 600,this.jugador.getCenter(), 120, this.cameras.main.width,
                ()=>{
                    this.openedScene=true;
                    this.jugador.setStatic(false);
                    this.jugador.resume(); // Reanudar movimiento
                });
            }
        }
        this.irisSound = this.sound.add('iris-out');

        // Quitamos la colisión con los bordes del mapa
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, 0, false, false, false, false);
        this.createText();  
        // this.spawnPowerUp(this, 200, 600, POWERUP_TYPES.HAMMER);


        const enemies = this.map.getObjectLayer('Enemigos').objects;
        this.goombas = this.add.group();
        this.koopas = this.add.group();
        this.piranhas = this.add.group();
        for (const enemie of enemies)
        {
            if (enemie.name === 'Goomba')
            {
                const goomba = new Goomba(
                    this,
                    enemie.x,
                    enemie.y -16, 
                    'gombrome_walk',
                    1.0,
                    true
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
                    'Koopa_walk_R',
                    1,
                    true
                );
                koopa.direction = -1;
                this.koopas.add(koopa);
                koopa.setDepth(2);
                koopa.setCollisionCategory(CATEGORY_ENEMY);
                koopa.setCollidesWith([CATEGORY_PLAYER,CATEGORY_TERRAIN, CATEGORY_ENEMY]);
            }
            else if (enemie.name === 'Piranha')
            {
                // console.log('PIRANYA');
                const piranha = new PiranhaPlant(
                    this,
                    enemie.x + 33,
                    enemie.y - 35, 
                    'Piranha_plant',
                    2000,
                    2000
                );
                this.piranhas.add(piranha);
                piranha.setCollisionCategory(CATEGORY_ENEMY);
                piranha.setCollidesWith([CATEGORY_PLAYER,CATEGORY_TERRAIN, CATEGORY_ENEMY]);
            }
            // else if (enemie.name === 'Pokey')
            // {
            //     const segments = enemie.properties?.find(p => p.name === 'segments')?.value || 5;
            //     const pokey = new Pokey(this, enemie.x, enemie.y, segments, 1);
            //     this.pokeys.add(pokey);
            //     // pokey.setDepth(2);
                
            // }
        }
        this.pokey = new Pokey(this, 400, 300, 5, 0.5);
    }
    createObjectsFromLayer(layerName) {
        const objects = this.map.getObjectLayer(layerName).objects;
        const ClassRef = CLASS_MAP[layerName];

        const group = this.add.group();

        objects.forEach(obj => {
            const instance = new ClassRef(this, obj);
            group.add(instance);
        });

        return group;
    }

    setupCollisions() {
        // Colisión con barra final
        const handle = (event, bodyA, bodyB) => {
            if(!bodyA.gameObject || bodyB.gameObject)
            {
                return;
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

    
    ganasPartida(player, barra) {
        this.increaseScore(Math.round(barra.y * 10), 'score');
        this.endTimer=true;

        this.moveCameraToBottomRight();

        this.jugador.win();
        barra.destroy();
        this.jugador.play('mario_stop', true);

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
        // Detener música de nivel al ganar
        if (this.levelMusic && this.levelMusic.isPlaying) {
            this.levelMusic.stop();
        }

        const victoryMusic = this.sound.add('victory_music');
        victoryMusic.play();
        victoryMusic.once('complete', () => {
        this.jugador.play('mario_victory', true);
        setTimeout(() => {
            this.doubleEndTransition(
                ()=>{this.scene.launch('MainMenu');
                this.scene.stop();});
        }, 1000);
        });
    }

    doubleEndTransition(callback)
    {
        if (this.levelMusic && this.levelMusic.isPlaying) {
            this.levelMusic.stop();
        }
        TransitionCode.invoke(this, this.cameras.main, 1000,this.jugador.getCenter(), this.cameras.main.width, 120,
        ()=>{
            transition2();
            this.sound.play('iris-out')
        });
        const transition2 = () => {
            TransitionCode.invoke(this, this.cameras.main, 1000,this.jugador.getCenter(), 120, 0,
            ()=>{
                callback();
            });
        }
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

    createText()
    {
        // Este gráfico representa la línea dónde se alinea la UI por la derecha

        // var graphics = this.add.graphics();
        // graphics.lineStyle(1, 0xffffff, 1);
        // graphics.lineBetween(posUI, 0,posUI, 600);
        // graphics.setScrollFactor(0);
        const posUI = this.cameras.main.centerX+this.cameras.main.centerX/2; // Posición UI por la derecha

        const fontSize = 29; // 50 / 1.65 ≈ 29
        document.fonts.load('32px aku-kamu').then(() => {

            this.fpsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -',{fontFamily: 'aku-kamu'})
            .setOrigin(-2,5)
            .setStroke('#000000ff', 6)
            .setFill('#38b762ff')
            .setFontSize(fontSize + 'px')
            .setDepth(10)
            // .setText("60")
            .setScrollFactor(0);

            this.textTimer = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '00',{fontFamily: 'aku-kamu'})
            .setOrigin(0.5,5)
            .setStroke('#000000ff', 6)
            .setFill('#ffffffff')
            // .setText("60")
            .setDepth(10)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0)

            this.textScore = this.add.text(posUI, this.cameras.main.centerY,"".padStart(10,"0"),{fontFamily: 'aku-kamu'})
            .setOrigin(1,5)
            .setStroke('#000000ff', 6)
            .setFill('#ffffffff')
            .setDepth(10)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0);
            // textScore.setShadow(10, 10, 'rgba(0,0,0,0.5)', 10); 
            // this.textScore.setText("".padStart(10,"0"))

            this.textCoins = this.add.text(posUI, this.cameras.main.centerY, "".padStart(2,"0"),{fontFamily: 'aku-kamu'})
            .setOrigin(1,4)
            .setStroke('#000000ff', 6)
            .setFill('#DBC716')
            // .setText("".padStart(2,"0"))
            .setDepth(10)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0);
            // this.textCoins.setText("".padStart(2,"0"));

            this.textPurpleCoins = this.add.text(posUI, this.cameras.main.centerY,"".padStart(1,"0"),{fontFamily: 'aku-kamu'})
            .setOrigin(1,3)
            .setFontSize(fontSize + 'px')
            .setAlign('center')
            .setStroke('#000000ff', 6)
            .setFill('#621C87')
            .setDepth(10)
            .setScrollFactor(0);

            this.timerMethod();
        });
    }

    timerMethod ()
    {
        let timer =60;
        this.endTimer = false;
        this.timerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if (!this.endTimer)
            {
                this.textTimer.setText(timer.toString().padStart(2, '0'));
                if (timer == 0) {
                    this.endTimer=true;
                    this.sound.play('muerte');
                    this.jugador.hurt();
                    this.jugador.setStatic(true);
                    this.doubleEndTransition(()=>{this.scene.launch('MainMenu');
                this.scene.stop();});
                }
                if (!this.jugador.isInBubble && !this.enPausa) {
                    this.textTimer.setFill('#ffffffff');
                    timer = (timer - 1 + 60) % 60; // reinicia a 60
                }
                else{
                    this.textTimer.setFill('#cececeff');
                }
            }
            else{
                timer = 0;
                this.textTimer.setText(timer.toString().padStart(2, '0'));
            }
        },
        });

        // Eventos para limpiar listeners al cerrar la escena
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.timerEvent?.remove(false);
        });
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

    update(time, delta) {
        if (!this.fpsText || !this.fpsText.scene || this.fpsText._destroyed) return;

        if (!this.endTimer)
        {
            this.fpsText?.setText(Math.floor(this?.game?.loop?.actualFps));
            // Actualizar jugador
            this.jugador.update(time,delta);

            // Actualizar objetos
            this.updateObjects(time, delta);

            // Posicionar bien la cámara respecto al jugador
            this.jugador.centerCameraOnPlayer();

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
    }

    // Verificar si el jugador se ha caído
    checkPlayerFell() {
        if (this.jugador.y > this.map.heightInPixels + 50 && !this.jugador.isInBubble && !this.jugador.canDrop && this.jugador.bubblesLeft > 0) {
            this.sound.play('muerte');
            this.jugador.Bubble();
        } else if (this.jugador.y > this.map.heightInPixels + 50 && this.jugador.bubblesLeft <= 0 && !this.jugador.isInBubble) {
            this.sound.play('muerte');
            this.jugador.y = this.map.heightInPixels + 45;
            this.jugador.hurt();
            this.doubleEndTransition(()=>{this.scene.launch('MainMenu');
                this.scene.stop();});
        }
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


    // Comprueba si un objeto se encuentra en un grupo concreto
    isBodyInGroup = (body, group) => {
        // Itera por todos los elementos en el grupo
        for (let i = 0; i < group.getChildren().length; i++) {
            // Compara si el cuerpo de un elemento en el grupo es igual al cuerpo que estamos buscando
            if (group.getChildren()[i].body === body) {
                return true;  // Si se encuentra, devuelve true
            }
        }
        return false;  // Si no se encuentra, devuelve false
    }
}

export default Nivel_TO;