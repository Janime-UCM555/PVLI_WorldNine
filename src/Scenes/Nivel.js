import Button from '../gameObjects/Button.js';
import Mario from '../gameObjects/Mario.js';
import Fin from '../gameObjects/BarraFin.js';
import Goomba from '../gameObjects/Goomba.js';
import Koopa from '../gameObjects/Koopa.js';
import PiranhaPlant from '../gameObjects/PiranhaPlant.js';
import Pokey from '../gameObjects/Pokey.js';
import { PowerUp, POWERUP_TYPES } from '../gameObjects/PowerUps.js';
import { DIE_TYPES } from "../gameObjects/Goomba.js";
class Nivel_T extends Phaser.Scene
{
    constructor(){
        super({key:'Nivel_T'});
    }
    
    init(){

    }

    preload(){
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON('map', 'MapaDeTiled/ElMapa.json');
        this.score=0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
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

        
        // Capa de suelo
        const bgLayer = this.map.createLayer('CapaFondo', tilesetBG, 0, 0);
        const decorationsLayer = this.map.createLayer('CapaDecoraciones', tileset, 0, 0);
        const blocks = this.map.getObjectLayer('Bloques').objects;
        const coins = this.map.getObjectLayer('Monedas').objects;
        const enemies = this.map.getObjectLayer('Enemigos').objects;
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



        this.jugador = new Mario(this, 25, 625, 'mario_run', 3.5, -3.75, true);

        // Forzar la inicialización de animaciones
        if (this.anims.exists('mario_run')) {
            this.jugador.play('mario_run');
        }
        const frontLayer = this.map.createLayer('CapaFrente', tileset, 0, 0);
        
        // Crear bloques a partir de objetos Tiled
        this.blocks = this.add.group();
        blocks.forEach(obj => {
            // Coordenadas de Tiled → Phaser
            const x = obj.x + obj.width / 2;
            const y = obj.y - obj.height / 2;
            // Propiedades del objeto en Tiled → convertir a objeto plano
            const props = {};
            obj.properties?.forEach(p => props[p.name] = p.value);

            // Si tiene propiedad 'texture', úsalo
            if(props.Breakable){
                props.texture = 'block';
            }
            else{
                props.texture = 'block?';
            }

            const tex = props.texture || 'bloque'; // si no tiene, usa la por defecto

            // Crear sprite con esa textura
            const block = this.matter.add.sprite(x, y, tex);
            this.add.existing(block, true);

            //Ajustar el hitbox al tamaño del objeto
            block.setSize(obj.width, obj.height);
            block.setIgnoreGravity(true);
            block.friction = 0;
            block.frictionStatic = 0;
            block.frictionAir = 0;
            block.restitution = 0;
            block.setStatic(true);
            // block.setFixedRotation();
            //Guardar sus props para blockHit()
            block._props = props;

            block.setCollisionCategory(CATEGORY_TERRAIN);
            block.setCollidesWith([CATEGORY_ENEMY, CATEGORY_PLAYER]);
            this.blocks.add(block);
        });

        this.coinsGroup = this.add.group();
        for (const coinObj of coins)
        {
            const coin = this.coinsGroup.create(coinObj.x, coinObj.y, 'coin_tileset');
            coin.setOrigin(0, 1);
            // Desactivar cualquier cuerpo físico que pueda haberse creado automáticamente
            if (coin.body) {
                coin.destroy();
                coin.body = null;
            }
            const coinType = coinObj.name;
            if (coinType === 'purple') {
                coin.play('coin_purple_spin');
                coin.coinValue = 500;
            } else {
                coin.play('coin_gold_spin');
                coin.coinValue = 100;
            }
        }
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
            else if (enemie.name === 'Pokey')
            {
                const segments = enemie.properties?.find(p => p.name === 'segments')?.value || 5;
                const pokey = new Pokey(this, enemie.x, enemie.y, segments);
                this.pokeys.add(pokey);
                // pokey.setDepth(2);
                
            }

            this.hammers = this.add.group();
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
        // this.buttonPrueba = new Button(this, 0, 0,'Prueba',() =>{
        //     this.transition('MainMenu'); // Llamar a la transición cuando se acaba el tiempo
        // });

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
            this.openSceneTransition();
        }
        this.irisSound = this.sound.add('iris-out');

        // Quitamos la colisión con los bordes del mapa
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels, 0, false, false, false, false);
        this.createText();  
        this.spawnPowerUp(200, 600, POWERUP_TYPES.MUSHROOM);

    }

    createAnimations() {
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
            key: 'mario_idle',
            frames: [{ key: 'mario_run', frame: 0 }],
            frameRate: 1
        });
        this.anims.create({
            key: 'mario_jump',
            frames: this.anims.generateFrameNumbers('mario_jump', { start: 0, end: 1 }),
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
        // Colisión con barra final
        this.matter.world.on('collisionstart', (event, bodyA, bodyB) => {
            if (bodyA.gameObject == this.jugador && bodyB.gameObject == this.barraFin
                || bodyB.gameObject == this.jugador && bodyA.gameObject == this.barraFin)
            {
                this.ganasPartida(this.jugador, this.barraFin);
            }
            if (bodyB.gameObject instanceof PowerUp && bodyA.gameObject == this.jugador ||
                bodyA.gameObject instanceof PowerUp && bodyB.gameObject == this.jugador)// && bodyA.gameObject == this.jugador)
            {
                // console.log('🌵 COLISIÓN CON POWERUPPPPPP DETECTADA');
                if (bodyA.gameObject instanceof PowerUp)
                {
                    bodyA.gameObject.collect(this.jugador);
                }
                else{
                    bodyB.gameObject.collect(this.jugador);
                }
            }
            if(bodyB.gameObject instanceof Goomba && bodyA.gameObject == this.jugador ||
                bodyA.gameObject instanceof Goomba && bodyB.gameObject == this.jugador )
            {
                if (bodyA.gameObject instanceof Goomba)
                {
                    bodyA.gameObject.handlePlayerCollision(this.jugador);
                }
                else{
                    bodyB.gameObject.handlePlayerCollision(this.jugador);
                }
            }
            if(bodyB.gameObject instanceof Goomba && bodyA.gameObject instanceof Goomba || 
                bodyB.gameObject instanceof Koopa && bodyA.gameObject instanceof Goomba ||
                bodyB.gameObject instanceof Koopa && bodyA.gameObject instanceof Koopa)
            {
                bodyA.gameObject.handleEnemyCollision(bodyB.gameObject);
            }
            if(bodyB.gameObject instanceof Koopa && bodyA.gameObject == this.jugador ||
                bodyA.gameObject instanceof Koopa && bodyB.gameObject == this.jugador)
            {
                if (bodyA.gameObject instanceof Koopa)
                {
                    bodyA.gameObject.handlePlayerCollision(this.jugador);
                }
                else{
                    bodyB.gameObject.handlePlayerCollision(this.jugador);
                }
            }
            if(bodyB.gameObject instanceof PiranhaPlant && bodyA.gameObject == this.jugador ||
               bodyA.gameObject instanceof PiranhaPlant && bodyB.gameObject == this.jugador)
            {
                if (bodyA.gameObject instanceof PiranhaPlant)
                {
                    bodyA.gameObject.handlePlayerCollision(this.jugador);
                }
                else{
                    bodyB.gameObject.handlePlayerCollision(this.jugador);
                }
            }
            if(bodyB.gameObject instanceof Pokey && bodyA.gameObject == this.jugador ||
               bodyA.gameObject instanceof Pokey && bodyB.gameObject == this.jugador)
            {
                // console.log('🌵 COLISIÓN CON POKEY DETECTADA');
                if (bodyA.gameObject instanceof Pokey)
                {
                    bodyA.gameObject.handlePlayerCollision(this.jugador);
                }
                else{
                    bodyB.gameObject.handlePlayerCollision(this.jugador);
                }
            }
            // if(bodyA.gameObject instanceof Goomba && bodyB.gameObject == this.groundLayer)
            // {
            //     bodyA.gameObject.handleWallCollision(bodyB.gameObject);
            // }
            if(bodyA.gameObject == this.jugador && bodyB.gameObject && bodyB.gameObject._props) 
            {
                if (!(this.jugador.body.velocity.y < 0 && this.jugador.getCenter().y > bodyB.bounds.max.y)){
                    return; // Solo al golpear desde abajo
                } 
                const aim = this.findSpawnBlockAbovePlayer(this.jugador, 20, 20); // (toleranciaX, toleranciaY)
                const target = aim || bodyB.gameObject; // prioriza spawn si hay uno “casi”
                this.blockHit(this.jugador, target);
            }
        })
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
        this.transition('MainMenu'); // Llamar a la transición cuando se acaba el tiempo
        }, 1000);
        });
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

        this.fpsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -',{fontFamily: 'aku-kamu'})
        .setOrigin(-2,5)
        .setStroke('#000000ff', 6)
        .setFill('#38b762ff')
        .setFontSize(fontSize + 'px')
        .setDepth(10)
        // .setText("60")
        .setScrollFactor(0);


        this.textTimer = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -',{fontFamily: 'aku-kamu'})
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

        // this.textPurpleCoins.setText("".padStart(1,"0"));

        this.timerMethod();
        // this.ui.add([this.fpsText,this.textPurpleCoins,this.textCoins,this.textScore,this.textTimer]);
    }
    
    transition(sceneName)
    {
        // Detener música al salir de la escena
        if (this.levelMusic && this.levelMusic.isPlaying) {
            this.levelMusic.stop();
        }

        const cam = this.cameras.main;

        // Fondo negro que cubrirá todo
        const blackout = this.add.rectangle(0, 0, cam.width, cam.height, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(1000); // Asegura que esté por encima de todo

        // Crear un círculo
        const circle = this.make.graphics({ x: 0, y: 0, add: false });

        // Recogemos la pos del jugador actualmente
        var playerWorld = this.jugador.getCenter();
        // this.jugador.setVelocity(0, 0);
        // this.jugador.setGravityY(-7);
        // this.jugador.body=false;
        this.jugador.setStatic(true);
        var radius = 1500; // Tamaño al principio

        // Dibujar círculo blanco
        circle.fillStyle(0xffffff);
        circle.fillCircle(playerWorld.x,  playerWorld.y, radius);

        // Crear máscara y aplicarla invertida
        const mask = circle.createGeometryMask();
        mask.invertAlpha = true; //ESTA LÍNEA invierte la visibilidad

        blackout.setMask(mask);
        this.tweens.add({
            targets: { r: radius}, 
            r: 120,
            duration: 1000,
            ease: 'Cubic.easeInOut',
            onUpdate: (tween, target) => {
                this.circleMask.clear();
                this.circleMask.fillStyle(0xffffff);
                this.circleMask.fillCircle(playerWorld.x, playerWorld.y, target.r);
            },
            onComplete:()=>
            {
                this.irisSound.play();
                this.tweens.add({
                    targets: { r: 120, py:playerWorld.y}, 
                    r: 0,
                    py: playerWorld.y+10, // Se dirige a los pies el círculo.
                    duration: 1500,
                    ease: 'Cubic.easeInOut',
                    onUpdate: (tween, target) => {
                        // if(this.endTimer && playerWorld.x-(this.cameras.main.width / this.cameras.main.zoom/2)>10)
                        // {
                        //     this.cameras.main.setPosition(
                        //         playerWorld.x-(this.cameras.main.width / this.cameras.main.zoom/2), 
                        //         this.cameras.main.y);
                        // }
                        this.circleMask.clear();
                        this.circleMask.fillStyle(0xffffff);
                        this.circleMask.fillCircle(playerWorld.x, target.py, target.r);
                    },
                    onComplete: () => {
                        this.scene.launch(sceneName);
                        this.scene.stop();
                    }
                });
            }
        });
        // Guardar referencias para otros métodos
        this.circleMask = circle;
        this.blackoutMask = blackout;
    }

    openSceneTransition()
    {
        const cam = this.cameras.main;

        // Recogemos la pos del jugador actualmente
        this.jugador.setStatic(true);
        if(this.jugador)
        {
            var playerWorld = this.jugador.getCenter();
        }
        // Fondo negro que cubrirá todo
        const blackout = this.add.rectangle(0, 0, cam.width, cam.height, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(1000); // Asegura que esté por encima de todo

        // Crear un círculo
        const circle = this.make.graphics({ x: 0, y: 0, add: false });

        var radius = 0; // Tamaño al principio

        // Dibujar círculo blanco
        circle.fillStyle(0xffffff);
        circle.fillCircle(playerWorld.x,  playerWorld.y, radius);

        // Crear máscara y aplicarla invertida
        const mask = circle.createGeometryMask();
        mask.invertAlpha = true; //ESTA LÍNEA invierte la visibilidad

        blackout.setMask(mask);
        this.tweens.add({
            targets: { r: radius}, 
            r: 120,
            duration: 1000,
            ease: 'Cubic.easeInOut',
            onUpdate: (tween, target) => {
                this.circleMask.clear();
                this.circleMask.fillStyle(0xffffff);
                this.circleMask.fillCircle(playerWorld.x, playerWorld.y, target.r);
                // this.jugador.x = 25;
                // this.jugador.y = 625;
                // this.jugador.setVelocity(0, 0);    
            },
            onComplete:()=>
            {
                this.jugador.setStatic(false);
                this.tweens.add({
                    targets: { r: 120, py:playerWorld.y}, 
                    r: Math.max(cam.width*2,cam.height*2),  
                    py: playerWorld.y+10, // Se dirige a los pies el círculo.
                    duration: 1500,
                    ease: 'Cubic.easeInOut',
                    onUpdate: (tween, target) => {
                        this.circleMask.clear();
                        this.circleMask.fillStyle(0xffffff);
                        this.circleMask.fillCircle(playerWorld.x, target.py, target.r);
                    },
                    onComplete: () => {
                        this.openedScene=true;
                        blackout.clearMask(true);
                        if(blackout)
                        {
                            blackout.destroy();
                        }
                        this.jugador.resume(); // Reanudar movimiento
                    }
                });
            }
        });
        // Guardar referencias para otros métodos
        this.circleMask = circle;
        // this.blackoutMask = blackout;
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
                    this.transition('MainMenu'); // Llamar a la transición cuando se acaba el tiempo
                }
                if (!this.jugador.isInBubble) {
                    timer = (timer - 1 + 60) % 60; // reinicia a 60
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
        this.fpsText.setText( Math.floor(this.game.loop.actualFps));

        if (!this.endTimer)
        {
            // Actualizar jugador
            this.jugador.update(time,delta);

            // Actualizar objetos
            this.updateObjects(time, delta);

            if (this.pokeys) {
                this.pokeys.getChildren().forEach(pokey => {
                    pokey.update(time, delta);
                });
            }

            // Posicionar bien la cámara respecto al jugador
            this.jugador.centerCameraOnPlayer();

            // Detección manual de monedas
            this.checkCoinCollection();

            // Comprobar si el jugador se ha caído
            this.checkPlayerFell();
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
    
        // Actualizar plantas piraña
        if (this.piranhas) {
            this.piranhas.getChildren().forEach(piranha => {
                piranha.update(time, delta);
            });
        }
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
            this.transition('MainMenu');
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

export default Nivel_T;