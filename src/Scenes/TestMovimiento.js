import Button from '../gameObjects/Button.js';
import Mario from '../gameObjects/Mario.js';
import Fin from '../gameObjects/BarraFin.js';
import Goomba from '../gameObjects/Goomba.js';
import { PowerUp, POWERUP_TYPES } from '../gameObjects/PowerUps.js';
class MovimientoScene extends Phaser.Scene
{
    constructor(){
        super({key:'MovimientoScene'});
    }
    
    init(){

    }

    preload(){
        this.load.tilemapTiledJSON('map', '../../../TestMapaTiled/ElMapa.json');
        this.load.image('mi_tileset', '../../../assets/GameSprites/Tilesets/base_tileset.png');
        this.load.image('bg_tileset', '../../../assets/GameSprites/Tilesets/Rome_BG.png');

        this.load.spritesheet('barra_tileset', '../../../assets/GameSprites/Items/barraFin.png', {
            frameWidth: 64,
            frameHeight: 32
        });
        this.load.spritesheet('coin_tileset', '../../../assets/GameSprites/Items/Coins.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        this.load.spritesheet('mario_run', '../../../assets/GameSprites/Characters/Mario/Mario_run.png', {
            frameWidth: 32,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_jump', '../../../assets/GameSprites/Characters/Mario/Mario_jump.png', {
            frameWidth: 48,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_stop', '../../../assets/GameSprites/Characters/Mario/Mario_no_movement.png', {
            frameWidth: 32,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_hurt', '../../../assets/GameSprites/Characters/Mario/Mario_hurt.png', {
            frameWidth: 48,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_victory', '../../../assets/GameSprites/Characters/Mario/Mario_victory.png', {
            frameWidth: 48,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_fall', 'assets/GameSprites/Characters/Mario/Mario_fall.png', {
            frameWidth: 48,
            frameHeight: 56
        });

        this.load.spritesheet('gombrome_walk', 'assets/GameSprites/Characters/Enemigos/Goomba/GombRome_Walk.png', {
            frameWidth: 30,
            frameHeight: 30
        });

        this.load.audio('coin_sound', '../../../assets/sonidos/SE/Items/Monedas/coin.wav');
        this.load.audio('purple_coin_sound', '../../../assets/sonidos/SE/Items/Monedas/purpleCoin.wav');
        this.load.audio('purple_coin_all_sound', '../../../assets/sonidos/SE/Items/Monedas/purpleCoinAll.wav');
        this.load.audio('victory_music', '../../../assets/sonidos/BGM/Nivel_Completado.wav');
        this.load.audio('salto', '../../../assets/sonidos/SE/Mario/Acciones/salto.wav');
        this.load.audio('aplastar', '../../../assets/sonidos/SE/Mario/Acciones/Stomp.wav');
        this.load.audio('muerte', '../../../assets/sonidos/SE/Mario/Acciones/Muerte.wav');
        this.load.audio('PowerUp', '../../../assets/sonidos/SE/Items/PowerUps/PowerUp.wav');
        this.load.audio('PowerDown', '../../../assets/sonidos/SE/Items/PowerUps/PowerDown.wav');
        this.load.audio('paso1', '../../../assets/sonidos/SE/Mario/Acciones/pisadaBloque1.wav');
        this.load.audio('paso2', '../../../assets/sonidos/SE/Mario/Acciones/pisadaBloque2.wav');
        this.score=0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;

        // this.load.bitmapFont('UIFont', 'assets/web/sugo_pro_display/Sugo_pro_by_Zetafonts.png',
        // 'assets/web/sugo_pro_display/Sugo-Pro-Classic-Bold-trial.ttf');

        function loadFont(name, url) {
            var newFont = new FontFace(name, `url(${url})`);
            newFont.load().then(function (loaded) {
                document.fonts.add(loaded);
            }).catch(function (error) {
                return error;
            });
        }

        loadFont("super-mario-256", "assets/web/sugo_pro_display/Sugo-Pro-Classic-Bold-trial.ttf");

        this.load.image('mushroom', '../../../assets/GameSprites/PowerUps/mushroom.png');
    }

    create(){
        // Crear mapa desde Tiled
        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('MapaTiles', 'mi_tileset');
        const tilesetBG = this.map.addTilesetImage('bg', 'bg_tileset');
        
        // Capa de suelo
        const bgLayer = this.map.createLayer('CapaFondo', tilesetBG, 0, 0);
        const decorationsLayer = this.map.createLayer('CapaDecoraciones', tileset, 0, 0);
        this.groundLayer = this.map.createLayer('CapaSuelo', tileset, 0, 0);
        this.blockLayer = this.map.createLayer('CapaBloques', tileset, 0, 0);
        const coins = this.map.getObjectLayer('Monedas').objects;
        const barraFinLayer = this.map.getObjectLayer('BarraFin').objects;

        if (this.groundLayer) {
            this.groundLayer.setCollisionByProperty({ collides: true });
        }
        if (this.blockLayer) {
            this.blockLayer.setCollisionByProperty({ collides: true });
        }

        // Crear animaciones
        this.createAnimations();

        this.jugador = new Mario(this, 25, 625, 'mario_run', 200, -225, true);
        // Forzar la inicialización de animaciones
        if (this.anims.exists('mario_run')) {
            this.jugador.play('mario_run');
        }
        const frontLayer = this.map.createLayer('CapaFrente', tileset, 0, 0);

        this.coinsGroup = this.add.group();
        for (const coinObj of coins)
        {
            const coin = this.coinsGroup.create(coinObj.x, coinObj.y, 'coin_tileset');
            coin.setOrigin(0, 1);
            // Desactivar cualquier cuerpo físico que pueda haberse creado automáticamente
            if (coin.body) {
                coin.body.destroy();
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
        }

        // Grupo de Goombas - Añadidos manualmente
        this.goombas = this.physics.add.group();
        
        // Posiciones manuales para los Goombas
        const goombaPositions = [
            { x: 450, y: 625 },   // Primer Goomba
            { x: 500, y: 625 },   // Segundo Goomba
            { x: 800, y: 500 },   // Tercer Goomba
            { x: 1200, y: 500 },  // Cuarto Goomba
            { x: 1750, y: 500 }   // Quinto Goomba
        ];

        for (const pos of goombaPositions) {
            const goomba = new Goomba(this, pos.x, pos.y, 'goombarome_walk', 50, true);
            // Iniciar todos los Goombas moviéndose hacia la derecha
            goomba.direction = 1;
            this.goombas.add(goomba);
        }

        // Configurar las propiedades de física para Goombas
        this.goombas.getChildren().forEach(goomba => {
            if (goomba.body) {
                // Detección de colisiones
                goomba.body.setCollideWorldBounds(false); // No permitir colisión con bordes
                goomba.body.onWorldBounds = true; // Detección de límites del mundo para destrucción
            }
        });


        this.powerups = this.add.group();

        const w = this.cameras.main.width;
        const h = this.cameras.main.height;

        this.spawnPowerUp(300, h - 100, POWERUP_TYPES.MUSHROOM, 'mushroom');

        this.setupCollisions();

        this.physics.add.collider(this.powerups, this.groundLayer);
        this.physics.add.collider(this.powerups, this.blockLayer);

        this.createText();

        // Configurar colisiones
        if (this.groundLayer) {
            // Establecer las colisiones
            this.groundLayer.setCollisionByExclusion([-1]);
        
            // Colisión jugador con suelo
            this.physics.add.collider(this.jugador, this.groundLayer);
            
            // Colisión Goombas con suelo con callback para cambiar dirección
            this.physics.add.collider(this.goombas, this.groundLayer, this.handleGoombaWallCollision, null, this);
        }
        if (this.blockLayer) {
            // Establecer las colisiones
            this.blockLayer.setCollisionByExclusion([-1]);
        
            // Colisión jugador con bloques
            this.physics.add.collider(this.jugador, this.blockLayer);
            
            // Colisión Goombas con bloques con callback para cambiar dirección
            this.physics.add.collider(this.goombas, this.blockLayer, this.handleGoombaWallCollision, null, this);
        }

        // Configurar mejor los límites del mundo
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.buttonPrueba = new Button(this, 0, 0,'Prueba',() =>{
            this.transition('MainMenu'); // Llamar a la transición cuando se acaba el tiempo
        });

        this.ui = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2);
        this.ui.add([this.buttonPrueba]);
        
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
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
            key: 'goombarome_walk',
            frames: this.anims.generateFrameNumbers('gombrome_walk', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
    }
    
    setupCollisions() {
        // Colisión con monedas
        //this.physics.add.overlap(
        //this.jugador,
        //this.coinsGroup,
        //this.collectCoin,
        //null,
        //this
        //);

        // Colisión con barra final
        this.physics.add.overlap(
        this.jugador,
        this.barraFin,
        this.ganasPartida,
        null,
        this
        );

        // Colisión con powerups
        this.physics.add.overlap(
            this.jugador,
            this.powerups,
            (player, pu) => pu.collect(player),
            null,
            this
        );

        // Colisión con Goombas
        this.physics.add.overlap(
            this.jugador,
            this.goombas,
            this.handleMarioGoombaCollision,
            null,
            this
        );

        // Colisión entre Goombas
        this.physics.add.collider(
            this.goombas,
            this.goombas,
            this.handleGoombaGoombaCollision,
            null,
            this
        );
    }

    // Manejar colisiones de Goombas con paredes
    handleGoombaWallCollision(goomba, wall) {
        if (!goomba.isAlive) return;
    
        // Verificar si es una colisión lateral (no desde arriba/abajo)
        const isLateralCollision = 
            (goomba.body.blocked.right && goomba.direction === 1) ||
            (goomba.body.blocked.left && goomba.direction === -1) ||
            (goomba.body.touching.right && goomba.direction === 1) ||
            (goomba.body.touching.left && goomba.direction === -1);

        if (isLateralCollision) {
            // Pequeño retroceso para evitar que se peguen
            const pushBack = 5;
            if (goomba.direction === 1) {
                goomba.x -= pushBack;
            } else {
                goomba.x += pushBack;
            }
        
            goomba.body.updateFromGameObject();
        
            // Cambiar dirección
            goomba.changeDirection();
        }
    }

    handleGoombaGoombaCollision(goomba1, goomba2) {
        // Ignorar si alguno está muerto
        if (!goomba1.isAlive || !goomba2.isAlive) return;

        // Calcular superposición usando getBounds()
        const bounds1 = goomba1.getBounds();
        const bounds2 = goomba2.getBounds();

        const overlapX = Math.min(bounds1.right, bounds2.right) - Math.max(bounds1.left, bounds2.left);

        // Si hay superposición significativa
        if (overlapX > 5) {
            // Separación física inmediata
            const separation = overlapX / 2 + 5;

            // Calcular dirección de la colisión
            const dx = goomba2.x - goomba1.x;

            if (dx > 0) {
                // Goomba2 está a la derecha de Goomba1
                goomba1.x -= separation;
                goomba2.x += separation;
            } else {
                // Goomba1 está a la derecha de Goomba2
                goomba1.x += separation;
                goomba2.x -= separation;
            }
        }

        // Actualizar cuerpos físicos
        goomba1.body.updateFromGameObject();
        goomba2.body.updateFromGameObject();

        // Ambos Goombas cambian de dirección
        goomba1.changeDirection();
        goomba2.changeDirection();
    }

    handleMarioGoombaCollision(mario, goomba) {
        // Ignorar si el Goomba está muerto
        if (!goomba.isAlive) return;

        // Verificar si Mario está cayendo y golpea desde arriba
        if (mario.body.velocity.y > 0 && mario.body.bottom < goomba.body.top + 15) {
            // Mario aplasta al Goomba
            goomba.stomp();
            
            // Pequeño rebote para Mario
            mario.body.setVelocityY(-275);
        } else if (goomba.isAlive && !mario.isBeingPushed && !mario.isInvulnerable) {
            // Colisión lateral
            let pushDirection = 0; // Determinar dirección del empuje

            // Calcular la dirección de la colisión
            if (mario.x < goomba.x) {
                // Goomba está a la derecha de Mario -> empujar a Mario hacia la izquierda
                pushDirection = -1;
            } else {
                // Goomba está a la izquierda de Mario -> empujar a Mario hacia la derecha
                pushDirection = 1;
            }

            const marioWasSuperSize = mario.isSuperSize;
            mario.takeDamage(pushDirection);
            if (!marioWasSuperSize) {
                // Si Mario ha colisionado lateralmente con un Goomba siendo pequeño se reinicia el nivel
                this.sound.play('muerte');
                this.restartLevel();
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
        barra.destroy();
        this.increaseScore(Math.round(barra.y * 10), 'score');
        this.endTimer=true;
        this.jugador.win();
        this.jugador.play('mario_stop', true);
        const victoryMusic = this.sound.add('victory_music');
        victoryMusic.play();
        victoryMusic.once('complete', () => {
        this.jugador.play('mario_victory', true);
        setTimeout(() => {
        this.transition('MainMenu'); // Llamar a la transición cuando se acaba el tiempo
        }, 1000);
        });
    }

    createText()
    {

        this.textTimer = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -');
        this.textTimer.setOrigin(0.5,7);
        this.textTimer.setFont('sugoDisplay');
        this.textTimer.setFontSize(50);
        this.textTimer.setAlign('center');
        this.textTimer.setStroke('#000000ff', 6)
        this.textTimer.setFill('#ffffffff');
        this.textTimer.setText("60");
        this.textTimer.setScrollFactor(0);
        // textTimer.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);


        this.textScore = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -');
        this.textScore.setOrigin(-0.4,7);
        this.textScore.setFont('sugoDisplay');
        this.textScore.setFontSize(50);
        this.textScore.setAlign('center');
        this.textScore.setStroke('#000000ff', 6)
        this.textScore.setFill('#ffffffff');
        this.textScore.setText("".padStart(10,"0"));
        this.textScore.setScrollFactor(0);
        // textScore.setShadow(10, 10, 'rgba(0,0,0,0.5)', 10); 

        this.textCoins = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -');
        this.textCoins.setOrigin(-5.4,6);
        this.textCoins.setFont('sugoDisplay');
        this.textCoins.setFontSize(50);
        this.textCoins.setAlign('center');
        this.textCoins.setStroke('#000000ff', 6)
        this.textCoins.setFill('#DBC716');
        this.textCoins.setText("".padStart(2,"0"));
        this.textCoins.setScrollFactor(0);

        this.textPurpleCoins = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -');
        this.textPurpleCoins.setOrigin(-10.6,5);
        this.textPurpleCoins.setFont('sugoDisplay');
        this.textPurpleCoins.setFontSize(50);
        this.textPurpleCoins.setAlign('center');
        this.textPurpleCoins.setStroke('#000000ff', 6)
        this.textPurpleCoins.setFill('#621C87');
        this.textPurpleCoins.setText("".padStart(1,"0"));
        this.textPurpleCoins.setScrollFactor(0);

        this.timerMethod();
    }
    
    transition(sceneName)
    {
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
                if(this.jugador)
                {
                    playerWorld = this.jugador.getCenter();
                }
                this.circleMask.fillCircle(playerWorld.x, playerWorld.y, target.r);
            },
            onComplete:()=>
            {
                this.tweens.add({
                    targets: { r: 120, py:playerWorld.y}, 
                    r: 0,
                    py: playerWorld.y+10, // Se dirige a los pies el círculo.
                    duration: 1500,
                    ease: 'Cubic.easeInOut',
                    onUpdate: (tween, target) => {
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

    timerMethod ()
    {
        let timer = 60;
        this.endTimer = false;
        this.timerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            if (!this.endTimer)
            {
                this.textTimer.setText(timer.toString().padStart(2, '0'));
                if (timer == 0)
                {
                    this.endTimer=true;
                    this.sound.play('muerte');
                    this.jugador.hurt();  
                    this.transition('MainMenu'); // Llamar a la transición cuando se acaba el tiempo
                }   
                timer = (timer - 1 + 60) % 60; // reinicia a 60
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

    /*marioAnims()
    {
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
    }*/
   
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

    playerFell() {
        this.restartLevel();
    }


    restartLevel() {
        // Reiniciar la escena o reposicionar el jugador
        this.jugador.x = 25;
        this.jugador.y = 625;
        this.jugador.resetStates(); // Resetear estados
        this.jugador.resume(); // Reanudar movimiento
        if (this.jugador.body) {
            this.jugador.body.setVelocity(0, 0);
        }
        // Resetear estado de daño
        this.jugador.isHurt = false;
        // Asegurar animación correcta al reiniciar
        this.jugador.play('mario_run', true);
        // Resetear invulnerabilidad
        this.jugador.isInvulnerable = false;
        this.jugador.setVisible(true);
    }

    update(time, delta) {
        // Actualizar jugador
        this.jugador.update(time,delta);

        // Actualizar barra final
        if (this.barraFin)
        {
            this.barraFin.update(time,delta);
        }

        // Actualizar Goombas
        if (this.goombas) {
            this.goombas.getChildren().forEach(goomba => {
                goomba.update(time, delta);
            });
        }

        // Detección manual de monedas
        this.checkCoinCollection();

        // Posicionar bien la cámara respecto al jugador
        this.centerCameraOnPlayerX();

        // Comprobar si el jugador se ha caído
        if (this.jugador.y > this.map.heightInPixels + 100) {
            this.sound.play('muerte');
            this.playerFell();
        }
    }

    // Detección manual de recolección de monedas
    checkCoinCollection() {
        const playerBounds = this.jugador.getBounds();
    
        this.coinsGroup.getChildren().forEach(coin => {
            if (coin.active && !coin.collected) {
                const coinBounds = coin.getBounds();
            
                // Verificar superposición
                if (Phaser.Geom.Rectangle.Overlaps(playerBounds, coinBounds)) {
                    this.collectCoin(this.jugador, coin);
                    coin.collected = true;
                }
            }
        });
    }

     // Spawner simple (tu PowerUp ya añade físicas y movimiento)
    spawnPowerUp(x, y, type, textureKey) {
        this.powerups.add(new PowerUp(this, x, y, type, textureKey));
        return this.powerups;
    }


    centerCameraOnPlayerX() {
        let targetX = this.jugador.x - this.cameras.main.width / 4;
        targetX = Phaser.Math.Clamp(targetX, 0, this.map.widthInPixels - this.cameras.main.width);
    
        // Suavizado lineal
        this.cameras.main.scrollX = Phaser.Math.Linear(
            this.cameras.main.scrollX,
            targetX,
            0.1
        );
    
        this.cameras.main.scrollY = this.map.heightInPixels / 4;
    }
}

export default MovimientoScene;