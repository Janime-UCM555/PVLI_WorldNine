import Button from '../gameObjects/Button.js';
import Mario from '../gameObjects/Mario.js';
import Fin from '../gameObjects/BarraFin.js';
import Goomba from '../gameObjects/Goomba.js';
import Koopa from '../gameObjects/Koopa.js';
import PiranhaPlant from '../gameObjects/PiranhaPlant.js';
import Pokey from '../gameObjects/Pokey.js';
import TransitionCode from '../gameObjects/Transition.js'
import { PowerUp, POWERUP_TYPES } from '../gameObjects/PowerUps.js';
import { DIE_TYPES } from "../gameObjects/Goomba.js";
class BossJ extends Phaser.Scene
{
    constructor(){
        super({key:'BossJ'});
    }
    
    
    init(){
//
    }

    preload(){
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON('map', 'MapaDeTiled/BossJupiter.json');
        this.score=0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.enPausa = false;
        this.bloquePausaActivo = null;
        this.impulsoActivo = null;
        // this.load.bitmapFont('UIFont', 'assets/web/sugo_pro_display/Sugo_pro_by_Zetafonts.png',
        // 'assets/web/sugo_pro_display/Sugo-Pro-Classic-Bold-trial.ttf');

        // function loadFont(name, url) {
        //     var newFont = new FontFace(name, `url(${url})`);
        //     newFont.load().then(function (loaded) {
        //         document.fonts.add(loaded);
        //     }).catch(function (error) {
        //         return error;
        //     });
        // }

        // Crear animaciones
        this.createAnimations();
    }

    create(){
        // this.cameras.main.setZoom(2);
        // Crear mapa desde Tiled
        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('MapaTiles', 'mi_tileset');
        const tilesetBG = this.map.addTilesetImage('bg', 'bg_tileset');

        //Máscaras de colisión
        const CATEGORY_PLAYER  = 0x0001;
        const CATEGORY_ENEMY   = 0x0002;
        const CATEGORY_POWERUP = 0x0003;
        const CATEGORY_TERRAIN = 0x0004;
        const CATEGORY_FALLOFF = 0x0005;

        
        // Capa de suelo
        const bgLayer = this.map.createLayer('CapaFondo', tilesetBG, 0, 0);
        // const decorationsLayer = this.map.createLayer('CapaDecoraciones', tileset, 0, 0);
        const blocks = this.map.getObjectLayer('Bloques').objects;
        const fallBlocks = this.map.getObjectLayer('FallOffs').objects;
        const spikesL = this.map.getObjectLayer('Pinchos').objects;
        const pausaL = this.map.getObjectLayer('PauseBlocks').objects;
        const OneWayL = this.map.getObjectLayer('OneWays').objects;
        const impulsosL = this.map.getObjectLayer('Impulsos').objects;
        const coinPathL = this.map.getObjectLayer('CaminoMonedas').objects;

        const coins = this.map.getObjectLayer('Monedas').objects;
        // const enemies = this.map.getObjectLayer('Enemigos').objects;
        this.groundLayer = this.map.createLayer('CapaSuelo', tileset, 0, 0);
        this.groundLayer.setDepth(1);
        // this.groundLayer.setCollisionMask(0x0001);
        const barraFinLayer = this.map.getObjectLayer('BarraFin').objects;

            
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



        this.jugador = new Mario(this, 25, 625, 'mario_run', 5, -3.75, true, true);
        this.jugador.setDepth(3);

        // Forzar la inicialización de animaciones
        if (this.anims.exists('mario_panicrun')) {
            this.jugador.play('mario_panicrun');
        }
        const frontLayer = this.map.createLayer('CapaFrente', tileset, 0, 0);

        this.fallBlock = this.createTiledObjects(fallBlocks, {
            texture: 'fallOffBlock1',
            name: 'BloqueCae',
            category: CATEGORY_FALLOFF,
            extra: (b) => {
                b.fallActive = false;
                b.startPosY = b.y;
                b.setCollidesWith([CATEGORY_ENEMY]);

                const sensorHeight = 80;
                const x = b.x;
                const y = b.y - b.height * 2 + sensorHeight / 2;
                const sensor = this.matter.add.rectangle(x, y, b.width, 5, {
                    isSensor: true,
                    // staticBody: true,
                    // isStatic: true
                });
                sensor.name = "oneway";
                
                sensor.blockTop = b;
                sensor.ignoreGravity = true;

                sensor.collisionFilter = {
                    category: CATEGORY_TERRAIN,
                    mask: CATEGORY_PLAYER
                };

                b.sensor = sensor;
            }
        });
        this.spikes = this.createTiledObjects(spikesL, {
            texture: 'spikes',
            name: 'spikes'
        });
        this.pausa = this.createTiledObjects(pausaL, {
            texture: 'Resume',
            name: 'pausa',
            extra: b => b.hasPlayer = false
        });
        this.impulsos = this.createTiledObjects(impulsosL, {
            // sensor: true,
            // staticBody: true,
            extra: (block, obj) => {
                const type = obj.name;
                block.hasPlayer = false;
                block.setBody({
                    type: 'rectangle',
                    width: obj.width * 2,
                    height: obj.height * 2,
                    // staticBody: true,
                    // isStatic: true
                });
                block.setSensor(true);
                block.setStatic(true);

                if (type === 'ImpulsoB') { block.play('sunB_move'); block.name = 'impulsoB'; }
                else if (type === 'ImpulsoM') { block.play('sunM_move'); block.name = 'impulsoM'; }
                else { block.play('sunA_move'); block.name = 'impulsoA'; }
            }
        });
        this.coinPath = this.createTiledObjects(coinPathL, {
            sensor: true,
            staticBody: true,
            extra: (block, obj) => {
                let tex = 'CoinPassD';
                let name = "pathAbD";

                if (obj.name === 'PasoMonedasArDer') name = "pathArD";
                else if (obj.name === 'PasoMonedasAr') { tex = 'CoinPassS'; name = "pathAr"; }
                else if (obj.name === 'PasoMonedasDer') { tex = 'CoinPassS'; name = "pathD"; }

                block.setTexture(tex);
                block.name = name;
                block.setRotation(Phaser.Math.DegToRad(obj.rotation));
            }
        });

        this.oneway = this.createTiledObjects(OneWayL, {
            texture: 'Resume',
            collidesWith: [CATEGORY_ENEMY],
            extra: (block, obj) => {

                const sensorHeight = 80;
                const x = block.x;
                const y = block.y - block.height * 2 + sensorHeight / 2;

                const sensor = this.matter.add.rectangle(x, y, obj.width, 5, {
                    isSensor: true,
                    // staticBody: true,
                    // isStatic: true
                });

                sensor.name = "oneway";
                sensor.blockTop = block;
                sensor.ignoreGravity = true;

                sensor.collisionFilter = {
                    category: CATEGORY_TERRAIN,
                    mask: CATEGORY_PLAYER
                };

                block.sensor = sensor;
            }
        });
        this.blocks = this.createTiledObjects(blocks, {
            extra: (block, obj) => {
                const props = {};
                obj.properties?.forEach(p => props[p.name] = p.value);

                const tex = props.Breakable ? 'block' : 'block?';
                block.setTexture(tex);

                block._props = props;
            }
        });

        this.coinsGroup = this.add.group();
        coins.forEach(o => {
            const coin = this.coinsGroup.create(o.x, o.y, 'coin_tileset').setOrigin(0, 1);
            
            if (coin.body) coin.body = null;

            if (o.name === 'purple') {
                coin.play('coin_purple_spin');
                coin.coinValue = 500;
            } else {
                coin.play('coin_gold_spin');
                coin.coinValue = 100;
            }
        });



        for (const barraPart of barraFinLayer)
        {
            this.barraFin = new Fin(
            this,
            barraPart.x + 32,
            barraPart.y, 
            'barra_tileset',
            0,
            600,
            80
            );
            this.barraFin.setCollisionCategory(CATEGORY_TERRAIN);
            this.barraFin.setCollidesWith([CATEGORY_PLAYER]);
        }
        

        // Grupo de Goombas - Añadidos manualmente
        // this.goombas = this.add.group();
        
        //Posiciones manuales para los Goombas
        // const goombaPositions = [
        //     { x: 450, y: 625 },   // Primer Goomba
        //     { x: 500, y: 625 },   // Segundo Goomba
        //     { x: 800, y: 500 },   // Tercer Goomba
        //     { x: 1200, y: 500 },  // Cuarto Goomba
        //     { x: 1750, y: 500 }   // Quinto Goomba
        // ];

        // for (const pos of goombaPositions) {
        //     const goomba = new Goomba(this, pos.x, pos.y, 'gombrome_walk', .50, true);
        //     // Iniciar todos los Goombas moviéndose hacia la derecha
        //     goomba.direction = 1;
        //     this.goombas.add(goomba);
        // }
        this.setupCollisions();

        this.powerups = this.add.group();



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
        // this.spawnPowerUp(200, 600, POWERUP_TYPES.HAMMER);
        // this.spawnPowerUp(220, 600, POWERUP_TYPES.STAR);


        const enemies = this.map.getObjectLayer('Enemigos').objects;
        this.goombas = this.add.group();
        this.koopas = this.add.group();
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
        }

        // Crear pilar como un rectángulo de Matter
        this.pilar = this.matter.add.rectangle(-950, 625, 500, this.cameras.main.height*1.5, {
            isStatic: false,    // se puede mover
            label: "Muerte",
            frictionAir: 0.0,   // sin resistencia de aire
            inertia: Infinity,  // evita rotaciones
            friction: 0,
            restitution: 0,
            ignoreGravity:true,
            isSensor:true
        });
        // Convertirlo en un sprite visible (opcional)
        this.pilarSprite = this.add.rectangle(200, 300, 40, 120, 0x5555ff);
        this.matter.add.gameObject(this.pilarSprite, this.pilar);

        // Velocidad hacia la derecha
        this.velocidadPilar = 4.5;
    }

    createTiledObjects(list, config = {}) {

        //Máscaras de colisión
        const CATEGORY_PLAYER  = 0x0001;
        const CATEGORY_ENEMY   = 0x0002;
        const CATEGORY_POWERUP = 0x0003;
        const CATEGORY_TERRAIN = 0x0004;
        const CATEGORY_FALLOFF = 0x0005;    
        // Parámetros con valores por defecto
        const {
            texture = null,
            name = null,
            depth = 2,
            category = CATEGORY_TERRAIN,
            collidesWith = [CATEGORY_PLAYER, CATEGORY_ENEMY],
            staticBody = true,
            sensor = false,
            extra = () => {}
        } = config;

        const group = this.add.group();

        list.forEach(obj => {

            const x = obj.x + obj.width / 2;
            const y = obj.y - obj.height / 2;

            // Crear sprite
            const sprite = this.matter.add.sprite(x, y, texture);
            sprite.setDepth(depth);

            if (name) sprite.name = name;

            // Propiedades básicas del cuerpo
            sprite.setIgnoreGravity(true);
            sprite.setStatic(staticBody);
            sprite.setSensor(sensor);
            sprite.setFixedRotation();
            sprite.setSize(obj.width, obj.height);

            sprite.friction = 0;
            sprite.frictionStatic = 0;
            sprite.frictionAir = 0;
            sprite.restitution = 0;

            // Colisiones
            sprite.setCollisionCategory(category);
            sprite.setCollidesWith(collidesWith);

            // Config extra personalizada para cada tipo de bloque
            extra(sprite, obj);

            group.add(sprite);
        });

        return group;
    }


    createAnimations() {
        this.anims.create({
            key: 'sunB_move',
            frames: this.anims.generateFrameNumbers('Impulsos', { start: 0, end: 1 }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'sunM_move',
            frames: this.anims.generateFrameNumbers('Impulsos', { start: 3, end: 4 }),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'sunA_move',
            frames: this.anims.generateFrameNumbers('Impulsos', { start: 6, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'coin_gold_spin',
            frames: this.anims.generateFrameNumbers('coin_tileset', { start: 0, end: 8 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'coin_purple_spin',
            frames: this.anims.generateFrameNumbers('coin_tileset', { start: 9, end: 17 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'mario_run',
            frames: this.anims.generateFrameNumbers('mario_run', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_panicrun',
            frames: this.anims.generateFrameNumbers('mario_panicrun', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_idle',
            frames: this.anims.generateFrameNumbers('mario_idle', { start: 0, end: 2 }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_jump',
            frames: this.anims.generateFrameNumbers('mario_jump', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_panicjump',
            frames: this.anims.generateFrameNumbers('mario_panicjump', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_fall',
            frames: this.anims.generateFrameNumbers('mario_fall', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_panicfall',
            frames: this.anims.generateFrameNumbers('mario_panicfall', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'mario_hurt',
            frames: this.anims.generateFrameNumbers('mario_hurt', { start: 0, end: 0 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'mario_stop',
            frames: this.anims.generateFrameNumbers('mario_stop', { start: 0, end: 0 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'mario_victory',
            frames: this.anims.generateFrameNumbers('mario_victory', { start: 0, end: 0 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'mario_bubble',
            frames: this.anims.generateFrameNumbers('mario_bubble', {start: 0, end: 0}),
            frameReate: 8,
            repeat: -1
        })

        this.anims.create({
            key: 'mario_throw',
            frames: this.anims.generateFrameNumbers('mario_throw', {start: 0, end: 3}),
            frameReate: 8,
            repeat: 0
        })

        this.anims.create({
            key: 'gombrome_walk',
            frames: this.anims.generateFrameNumbers('gombrome_walk', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Koopa_walk_R',
            frames: this.anims.generateFrameNumbers('Koopa_walk_R', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
    }
    
    setupCollisions() {
        //Máscaras de colisión
        const CATEGORY_PLAYER  = 0x0001;
        const CATEGORY_ENEMY   = 0x0002;
        const CATEGORY_POWERUP = 0x0003;
        const CATEGORY_TERRAIN = 0x0004;
        const CATEGORY_FALLOFF = 0x0005;
        const M = Phaser.Physics.Matter.Matter;
        // Colisión con barra final
        const handle = (event, bodyA, bodyB) => {
            // if(!bodyA.gameObject || bodyB.gameObject)
            // {
            //     return;
            // }
            if (bodyA.gameObject == this.jugador && bodyB.gameObject == this.barraFin
                || bodyB.gameObject == this.jugador && bodyA.gameObject == this.barraFin)
            {
                this.ganasPartida(this.jugador, this.barraFin);
            }

            if (bodyA.gameObject == this.jugador && this.jugador.body.velocity.y > 0&& bodyB.gameObject && bodyB.gameObject.name == "BloqueCae")
            {
                bodyB.gameObject.setCollidesWith([CATEGORY_PLAYER]);
                this.time.delayedCall(150, () => {
                    bodyB.gameObject.fallActive=true;
                    bodyB.gameObject.setTexture('fallOffBlock2'); // Cambiar textura a bloque vacío
                });
            }
            if (bodyA.gameObject == this.jugador && bodyB.gameObject && bodyB.gameObject.name == "pausa" && !bodyB.gameObject.hasPlayer)
            {
                this.bloquePausaActivo = bodyB.gameObject;
                const activarPausa = () => {
                    this.jugador.stop();
                    this.jugador.setVelocity(0,0);
                    bodyB.gameObject.hasPlayer = true;
                    this.enPausa = true;
                    bodyB.gameObject.setTexture('Pause');
                    this.sound.play('PauseBlq');
                };
                if (this.jugador.getCenter().x < bodyB.bounds.max.x) {
                    this.time.delayedCall(90, activarPausa);
                } else {
                    activarPausa();
                }
            }
            if (bodyA.gameObject == this.jugador && bodyB.gameObject && bodyB.gameObject.name == "spikes" &&
                !this.jugador.isInvincible)
               // && !this.jugador.isBeingPushed && !this.jugador.isInvulnerable && !this.jugador.isInvincible)
            {
                const player = this.jugador;
                if (!player.isSuperSize && !this.scene.endTimer) 
                {
                    this.sound.play('muerte');

                    // Detener cualquier movimiento de Mario antes de la burbuja
                    player.setVelocity(0, 0);
                    if (player.body) {
                        player.body.velocity.x = 0;
                        player.body.velocity.y = 0;
                    }

                    this.doubleEndTransition(()=>{
                    this.scene.restart();});
                    player.hurt();
                    player.setStatic(true);
                } else {
                    // Colisión lateral
                    let pushDirection = 0; // Determinar dirección del empuje
                    player.takeDamage(pushDirection);
                }
            }
            if ((bodyA.gameObject == this.jugador &&bodyB.gameObject?.name=="pathAr") ||
            (bodyB.gameObject == this.jugador && bodyA.gameObject?.name=="pathAr")) 
            {
                const coinDistanceX = 10;
                const coinDistanceY = -40;
                let blockPass;
                if (bodyB.gameObject?.name == "pathAr")
                {
                    blockPass = bodyB.gameObject;
                }
                else{
                    blockPass = bodyA.gameObject;
                }
                this.spawnCoins(coinDistanceX,coinDistanceY,blockPass);
            }
            if ((bodyA.gameObject == this.jugador && bodyB.gameObject?.name=="pathAbD") ||
            (bodyB.gameObject == this.jugador && bodyA.gameObject?.name=="pathAbD")) 
            {
                // 4 monedas Abajo Diagonal
                const coinDistanceX = 20;
                const coinDistanceY = 40;
                let blockPass;
                if (bodyB.gameObject?.name == "pathAbD")
                {
                    blockPass = bodyB.gameObject;
                }
                else{
                    blockPass = bodyA.gameObject;
                }
                this.spawnCoins(coinDistanceX,coinDistanceY,blockPass);
            }
            if ((bodyA.gameObject == this.jugador && bodyB.gameObject?.name=="pathArD") ||
                (bodyB.gameObject == this.jugador && bodyA.gameObject?.name=="pathArD")) 
            {
                // 4 monedas Arriba Diagonal
                const coinDistanceX = 20;
                const coinDistanceY = -40;
                const scene = this;
                let blockPass;
                if (bodyB.gameObject?.name == "pathArD")
                {
                    blockPass = bodyB.gameObject;
                }
                else{
                    blockPass = bodyA.gameObject;
                }
                this.spawnCoins(coinDistanceX,coinDistanceY,blockPass);
            }
            if ((bodyA.gameObject == this.jugador && bodyB.gameObject?.name=="pathD") ||
                (bodyB.gameObject == this.jugador && bodyA.gameObject?.name=="pathD")) 
            {
                // 4 monedas Derecha
                const coinDistanceX = 40;
                const coinDistanceY = 0;
                let blockPass;
                if (bodyB.gameObject?.name == "pathD")
                {
                    blockPass = bodyB.gameObject;
                }
                else{
                    blockPass = bodyA.gameObject;
                }
                this.spawnCoins(coinDistanceX,coinDistanceY,blockPass);
            }
            if ((bodyA.gameObject == this.jugador &&bodyB.gameObject?.name=="impulsoA") ||
            (bodyB.gameObject == this.jugador && bodyA.gameObject?.name=="impulsoA")) 
            {
                // console.log(this.jugador.jumpRequested);
                if (bodyA.gameObject?.name == "impulsoA")
                {
                    this.impulsoActivo = bodyA.gameObject;
                }
                else{
                    this.impulsoActivo = bodyB.gameObject;
                }
                if (this.jugador.jumpRequested || this.jugador.jumpHeld)
                {
                    this.sound.play('ImpA');
                    this.impulsoActivo = null;
                    M.Body.setVelocity(this.jugador.body, { x: this.jugador.body.velocity.x, y: -10 });
                }
            }
            if ((bodyA.gameObject == this.jugador && bodyB.gameObject?.name=="impulsoM") ||
            (bodyB.gameObject == this.jugador && bodyA.gameObject?.name=="impulsoM")) 
            {
                // console.log(this.jugador.jumpRequested);
                if (bodyA.gameObject?.name == "impulsoM")
                {
                    this.impulsoActivo = bodyA.gameObject;
                }
                else{
                    this.impulsoActivo = bodyB.gameObject;
                }
                if (this.jugador.jumpRequested || this.jugador.jumpHeld)
                {
                    this.sound.play('ImpM');
                    this.impulsoActivo = null;
                    M.Body.setVelocity(this.jugador.body, { x: this.jugador.body.velocity.x, y: -7 });
                }
            }
            if ((bodyA.gameObject == this.jugador && bodyB.gameObject?.name=="impulsoB") ||
                (bodyB.gameObject == this.jugador && bodyA.gameObject?.name=="impulsoB")) 
            {                
                // console.log(this.jugador.jumpRequested)
                if (bodyA.gameObject?.name == "impulsoB")
                {
                    this.impulsoActivo = bodyA.gameObject;
                }
                else{
                    this.impulsoActivo = bodyB.gameObject;
                }
                if (this.jugador.jumpRequested || this.jugador.jumpHeld)
                {
                    this.sound.play('ImpB');
                    this.impulsoActivo = null;
                    M.Body.setVelocity(this.jugador.body, { x: this.jugador.body.velocity.x, y: -5 });
                }
            }
            if ((bodyA.name === "oneway" &&  bodyA.isSensor &&bodyB.gameObject === this.jugador) ||
                (bodyB.name === "oneway"&& bodyB.isSensor && bodyA.gameObject === this.jugador ))
            {
                const sensor  = bodyA.name=="oneway"  ? bodyA : bodyB;

                const activarOneWay = () => {
                    sensor.blockTop.setCollidesWith([CATEGORY_ENEMY, CATEGORY_PLAYER]);
                };
                if (/*this.jugador.body.velocity.y > 0 &&*/ this.jugador.body.position.y < sensor.position.y)
                activarOneWay();
            }
            if(bodyA.gameObject == this.jugador && bodyB.gameObject && bodyB.gameObject._props) 
            {
                if (!(this.jugador.body.velocity.y < 0 && this.jugador.getCenter().y > bodyB.bounds.max.y)){
                    return; // Solo al golpear desde abajo
                } 
                const aim = this.findSpawnBlockAbovePlayer(this.jugador, 20, 20); // (toleranciaX, toleranciaY)
                const target = aim || bodyB.gameObject; // prioriza spawn si hay uno “casi”
                this.blockHit(this.jugador, target);
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
            if(bodyA.label == "Mario" && bodyB.label=="Muerte"||
                bodyB.label == "Mario" && bodyA.label=="Muerte" && !this.endTimer)
            {
                this.jugador.hurt();
                this.endTimer=true;
                this.jugador.setStatic(true);
                this.doubleEndTransition(()=>{this.scene.restart()});
            }
        }
        const exitHandle = (event, bodyA, bodyB) => {
            if ((bodyA.name === "oneway" &&  bodyA.isSensor &&bodyB.gameObject === this.jugador) ||
                (bodyB.name === "oneway"&& bodyB.isSensor && bodyA.gameObject === this.jugador ))
            {
                const sensor  = bodyA.name=="oneway"  ? bodyA : bodyB;
                
                sensor.blockTop.setCollidesWith([CATEGORY_ENEMY]);
            }
        }
        this.matter.world.on('collisionstart', handle);
        // this.matter.world.off('collisionexit', exitHandle);
        this.matter.world.on('collisionend', exitHandle);
        this.matter.world.on('collisionactive', handle);
    }

    spawnCoins(distX, distY, blockPass)
    {
        blockPass.setTint(Phaser.Display.Color.GetColor(140, 140, 140, 0.5));
        blockPass.setCollidesWith([]);
        const center = blockPass.getCenter();
        const delay = 50;
        // 4 monedas 
        for (let i=0; i < 4; ++i)
        {
            this.time.delayedCall(delay*i,()=> { this.delayedCoins(center,distX,distY, i)}, [], this);
        }
    }

    delayedCoins(center, distX, distY, i)
    {
        const coin = this.coinsGroup.create(center.x+i*distX, center.y+i*distY, 'coin_tileset');
        coin.setOrigin(0.5);
        // Desactivar cualquier cuerpo físico que pueda haberse creado automáticamente
        if (coin.body) {
            coin.destroy();
            coin.body = null;
        }
        coin.play('coin_gold_spin');
        coin.coinValue = 100;
    }

    findSpawnBlockAbovePlayer(player, toleranciaX = 16, toleranciaY = 10) {
        let best = null;
        let bestDx = Infinity;
        this.blocks.getChildren().forEach(
        block => {
            const props = block._props || {};
            if (!props.spawn) return;
            // condiciones: está por encima del player y cerca en X/Y
                const dx = Math.abs(block.x - player.x);
                const isAbove = player.y > block.y;
                const closeX = dx <= (block.displayWidth / 2 + toleranciaX);
                const closeY = ( this.jugador.getCenter().y <= bodyB.bounds.max.y + toleranciaY);
                if (isAbove && closeX && closeY) {
                    if (dx < bestDx) { bestDx = dx; best = b; }
                }
        });
        return best;
    }
    blockHit(player, block) {
        // Lógica al golpear un bloque
        const props = block._props;
        if (props)
        {
            if (props.Breakable && player.isSuperSize) {
                this.sound.play('BrickBlock');
                block.destroy();
                // this.sound.play('block_break');
                return;
            }
            else
            {
                this.sound.play('Bump')
            }

            if (props.Spawn){
                // Spawn power-up
                if(player.isSuperSize){
                    this.spawnPowerUp(block.x + block.width / 2, block.y - block.height, props.PowerUp, props.PowerUp);
                    // this.sound.play('powerup_appears');
                }
                else
                {
                    this.spawnPowerUp(block.x + block.width / 2, block.y - block.height, POWERUP_TYPES.MUSHROOM, 'mushroom');
                }

            block._props.Spawn = false; // Evitar respawn

            block.setTexture('blockempty'); // Cambiar textura a bloque vacío
            }
        }
    }


    collectCoin(player, coin) {
        coin.destroy();
        this.increaseScore(coin.coinValue, 'score');
        if (coin.coinValue === 500)
        {
            this.increaseScore(1, 'purple_coin');
        }
        else
        {
            this.increaseScore(coin.coinValue / 100, 'coins');
        }
    }

    ganasPartida(player, barra) {
        this.increaseScore(Math.round(barra.y * 10), 'score');
        this.endTimer=true;

        this.moveCameraToBottomRight();

        this.jugador.win();
        barra.destroy();
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
            this.doubleEndTransition(
                ()=>{this.scene.launch('MainMenu');
                        this.scene.stop();});
        }, 1000);
        });
    }

    doubleEndTransition(callback)
    {
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

        const posUI = this.cameras.main.centerX+this.cameras.main.centerX/2; // Posición UI por la derecha
        // graphics.lineStyle(1, 0xffffff, 1);
        // graphics.lineBetween(posUI, 0,posUI, 600);
        // graphics.setScrollFactor(0);

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

        // this.textPurpleCoins.setText("".padStart(1,"0"));

        // this.ui.add([this.fpsText,this.textPurpleCoins,this.textCoins,this.textScore,this.textTimer]);
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
                    this.doubleEndTransition(()=>{
                this.scene.restart();});
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

    update(time, delta) {
        const dt = delta / 16.666;
        if (!this.fpsText || !this.fpsText.scene || this.fpsText._destroyed) return;

        if (!this.endTimer)
        {
            this.fpsText?.setText(Math.floor(this?.game?.loop?.actualFps));
            // Actualizar jugador
            this.jugador.update(time,delta);

            // Actualizar objetos
            this.updateObjects(time, delta);

            if (this.pokeys) {
                this.pokeys.getChildren().forEach(pokey => {
                    pokey.update(time, delta);
                });
            }

            if (this.fallBlock)
            {
                this.fallBlock.getChildren().forEach(block => {
                    if (block.fallActive) {
                        // block.velocityY += 0.05;
                        block.y += 5*dt;
                    }
                    if (block.x < this.cameras.scrollX || block.y > this.map.heightInPixels + 50)
                    {
                        block.y = block.startPosY;
                        block.fallActive = false;
                        block.setTexture('fallOffBlock1'); // Cambiar textura a bloque inicial
                    }
                });
            }
            if (this.pausa && this.enPausa && this.bloquePausaActivo) {
                const block = this.bloquePausaActivo;
                if (this.jugador.isJumping) {
                    // Reanudar al jugador
                    this.jugador.setVelocityY(-6);
                    this.jugador.resume(); // Si tienes animaciones pausadas
                    this.enPausa = false;

                    // Restaurar bloque
                    if (block) {
                        block.hasPlayer = false;
                        block.setTexture('Resume'); // Cambiar textura a bloque vacío
                    }

                    this.bloquePausaActivo = null;
                } else {
                    // Mientras está en pausa, mantener al jugador detenido
                    this.jugador.setVelocity(0, 0);
                }
            }
            if(this.impulsoActivo)
            {
                if (this.jugador.isJumping || this.jugador.jumpHeld || this.jugador.jumpRequested) {
                    const M = Phaser.Physics.Matter.Matter;
                    if (this.impulsoActivo.name == "impulsoB")
                    {
                        this.sound.play('ImpB');
                        M.Body.setVelocity(this.jugador.body, { x: this.jugador.body.velocity.x, y: -5 });
                    }
                    else if (this.impulsoActivo.name == "impulsoM")
                    {
                        this.sound.play('ImpM');
                        M.Body.setVelocity(this.jugador.body, { x: this.jugador.body.velocity.x, y: -10 });
                    }
                    else{
                        this.sound.play('ImpA');
                        M.Body.setVelocity(this.jugador.body, { x: this.jugador.body.velocity.x, y: -15 });
                    }
                    this.impulsoActivo = null;
                }
            }


            // Posicionar bien la cámara respecto al jugador
            this.jugador.centerCameraOnPlayer();

            // Detección manual de monedas
            this.checkCoinCollection();

            // Comprobar si el jugador se ha caído
            this.checkPlayerFell();

                // Movimiento continuo hacia la derecha
            Phaser.Physics.Matter.Matter.Body.setVelocity(this.pilar, {
                x: this.velocidadPilar,
                y: this.pilar.velocity.y
            });
        }
        else{
            this.pilar.collisionFilter.mask= 0;
        }
    }

    // Actualizar objetos
    updateObjects(time, delta) {
        // Actualizar barra final
        if (this.barraFin) {
            this.barraFin.update(time, delta);
        }
                // Actualizar Goombas
        if (this.goombas) {
            this.goombas.getChildren().forEach(goomba => {
                goomba.update(time, delta);
            });
        }
    
        // Actualizar Koopas
        if (this.koopas) {
            this.koopas.getChildren().forEach(koopa => {
                koopa.update(time, delta);
            });
        }
    }

    // Verificar si el jugador se ha caído
    checkPlayerFell() {
        if (this.jugador.y > this.map.heightInPixels + 50 && !this.jugador.isInBubble && !this.endTimer) {
            this.endTimer = true;
            this.sound.play('muerte');
            this.jugador.y = this.map.heightInPixels + 45;
            this.jugador.hurt();
            this.doubleEndTransition(()=>{
                this.scene.restart();});
        }
    }

    // Detección manual de recolección de monedas
    checkCoinCollection() {
        const playerBounds = this.jugador.getBounds();
    
        this.coinsGroup.getChildren().forEach(coin => {
            if (coin.active && !coin.collected) {
                const coinBounds = coin.getBounds();
            
                // Verificar superposición
                if (!this.jugador.isInBubble && Phaser.Geom.Rectangle.Overlaps(playerBounds, coinBounds)) {
                    this.collectCoin(this.jugador, coin);
                    coin.collected = true;
                }
            }
        });
    }

    // Spawner simple (tu PowerUp ya añade físicas y movimiento)
    spawnPowerUp(x, y, type) {
        let power = new PowerUp(this, x, y, type, type, 0)
        power.setVelocityX(power.body.velocity.x * 0.09315); // Salir del bloque hacia arriba
        power.setVelocityY(-power.body.velocity.x/2);
        this.powerups.add(power);
        return this.powerups;
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

export default BossJ;