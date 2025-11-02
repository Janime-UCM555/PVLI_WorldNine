import Button from '../gameObjects/Button.js';
import Mario from '../gameObjects/Mario.js';
import Fin from '../gameObjects/BarraFin.js';
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

        this.load.spritesheet('mario_fall', 'assets/GameSprites/Characters/Mario/Mario_fall.png', {
            frameWidth: 48,
            frameHeight: 56
        });

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

    }

    create(){
        // Crear mapa desde Tiled
        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('MapaTiles', 'mi_tileset');
        const tilesetBG = this.map.addTilesetImage('bg', 'bg_tileset');
        
        // Capa de suelo
        const bgLayer = this.map.createLayer('CapaFondo', tilesetBG, 0, 0);
        const decorationsLayer = this.map.createLayer('CapaDecoraciones', tileset, 0, 0);
        const groundLayer = this.map.createLayer('CapaSuelo', tileset, 0, 0);
        const blockLayer = this.map.createLayer('CapaBloques', tileset, 0, 0);
        const coins = this.map.getObjectLayer('Monedas').objects;
        const barraFinLayer = this.map.getObjectLayer('BarraFin').objects;

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

        this.jugador = new Mario(this, 25, 625, 'mario_run', 200, -225, true);
        // Forzar la inicialización de animaciones
        if (this.anims.exists('mario_run')) {
            this.jugador.play('mario_run');
        }

        const frontLayer = this.map.createLayer('CapaFrente', tileset, 0, 0);

        this.coinsGroup = this.physics.add.group();
        for (const coinObj of coins)
        {
            const coin = this.coinsGroup.create(coinObj.x, coinObj.y, 'coin_tileset');
            coin.setOrigin(0, 1);
            coin.body.setAllowGravity(false);
            coin.body.setImmovable(true);
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

        this.physics.add.overlap(
        this.jugador,
        this.coinsGroup,
        this.collectCoin,
        null,
        this
        );

        this.physics.add.overlap(
        this.jugador,
        this.barraFin,
        this.ganasPartida,
        null,
        this
        );

        this.createText();

        // Configurar colisiones
        if (groundLayer) {
            // Establecer las colisiones
            groundLayer.setCollisionByExclusion([-1]);
        
            // Añadir el collider
            this.physics.add.collider(this.jugador, groundLayer);
        }
        if (blockLayer) {
            // Establecer las colisiones
            blockLayer.setCollisionByExclusion([-1]);
        
            // Añadir el collider
            this.physics.add.collider(this.jugador, blockLayer);
        }

        // Configurar mejor los límites del mundo
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.buttonPrueba = new Button(this, 0, 0,'Prueba',() =>{
            this.scene.launch('MainMenu');
            this.scene.stop();
        });

        this.ui = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2);
        this.ui.add([this.buttonPrueba]);
        
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
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
        this.jugador.stop();
        this.jugador.body.setVelocity(0, 0);
        this.increaseScore(Math.round(barra.y * 10), 'score');
        setTimeout(() => {
        this.scene.launch('MainMenu');
        this.scene.stop();
        }, 2000);
    }

    createText()
    {

        let textTimer = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -');
        textTimer.setOrigin(0.5,7);
        textTimer.setFont('sugoDisplay');
        textTimer.setFontSize(50);
        textTimer.setAlign('center');
        textTimer.setStroke('#000000ff', 6)
        textTimer.setFill('#ffffffff');
        textTimer.setText("60");
        textTimer.setScrollFactor(0);
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

        let timer = 60;
        this.timerEvent = this.time.addEvent({
        delay: 1000,
        loop: true,
        callback: () => {
            timer = (timer - 1 + 60) % 60; // reinicia a 60
            textTimer.setText(timer.toString().padStart(2, '0'));
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
            this.coinScore += points;
            if (this.textCoins) {
                this.textCoins.setText(this.coinScore.toString().padStart(2, '0'));
            }
        } else if (type == 'purple_coin'){
            this.purpleCoinScore += points;
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
        this.jugador.resetJumpState(); // Resetear estado de salto
        this.jugador.resume(); // Reanudar movimiento
        if (this.jugador.body) {
            this.jugador.body.setVelocity(0, 0);
        }
        // Asegurar animación correcta al reiniciar
        this.jugador.play('mario_run', true);
    }

    update(time, delta) {
        this.jugador.update(time,delta);
        if (this.barraFin)
        {
            this.barraFin.update(time,delta);
        }
        this.centerCameraOnPlayerX();

        if (this.jugador.y > this.map.heightInPixels + 100) {
            this.playerFell();
        }
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