import Button from '../gameObjects/Button.js';
import Mario from '../gameObjects/Mario.js';
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
        this.load.image('coin_tileset', '../../../assets/GameSprites/Items/Coins.png');
        this.load.image('bg_tileset', '../../../assets/GameSprites/Tilesets/Rome_BG.png');

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
    }

    create(){
        // Crear mapa desde Tiled
        this.map = this.make.tilemap({ key: 'map', tileWidth: 32, tileHeight: 32 });
        const tileset = this.map.addTilesetImage('MapaTiles', 'mi_tileset');
        const tilesetCoins = this.map.addTilesetImage('Monedas', 'coin_tileset');
        const tilesetBG = this.map.addTilesetImage('bg', 'bg_tileset');
        
        // Capa de suelo
        const bgLayer = this.map.createLayer('CapaFondo', tilesetBG, 0, 0);
        const decorationsLayer = this.map.createLayer('CapaDecoraciones', tileset, 0, 0);
        const groundLayer = this.map.createLayer('CapaSuelo', tileset, 0, 0);
        const coinLayer = this.map.createLayer('Capa monedas', tilesetCoins, 0, 0);
        const blockLayer = this.map.createLayer('CapaBloques', tileset, 0, 0);

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