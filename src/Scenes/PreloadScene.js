class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        this.load.image('star_pattern', 'assets/GameSprites/Precarga/star_pattern.png');

        // Goomba
        this.load.spritesheet('Gomb_Bite', 'assets/GameSprites/Characters/Enemigos/Goomba/Gomb_Bite.png', {
            frameWidth: 32,
            frameHeight: 30
        });
        this.load.image('Gomb_Stomp', 'assets/GameSprites/Characters/Enemigos/Goomba/Gomb_Stomp.png');
        this.load.spritesheet('Gomb_Walk', 'assets/GameSprites/Characters/Enemigos/Goomba/Gomb_Walk.png', {
            frameWidth: 30,
            frameHeight: 30
        });
        this.load.spritesheet('gombrome_walk', 'assets/GameSprites/Characters/Enemigos/Goomba/GombRome_Walk.png', {
            frameWidth: 30,
            frameHeight: 30
        });
        this.load.spritesheet('GombRome_Bite', 'assets/GameSprites/Characters/Enemigos/Goomba/GombRome_Bite.png', {
            frameWidth: 32,
            frameHeight: 30
        });
        this.load.image('GombRome_Stomp', 'assets/GameSprites/Characters/Enemigos/Goomba/GombRome_Stomp.png');
        this.load.spritesheet('GombRome_Walk', 'assets/GameSprites/Characters/Enemigos/Goomba/GombRome_Walk.png', {
            frameWidth: 30,
            frameHeight: 30
        });

        // Koopa
        this.load.image('Koopa_idle_R', 'assets/GameSprites/Characters/Enemigos/Koopa/Koopa_idle_R.png');
        this.load.image('Koopa_idle', 'assets/GameSprites/Characters/Enemigos/Koopa/Koopa_idle.png');
        this.load.image('Koopa_shell', 'assets/GameSprites/Characters/Enemigos/Koopa/Koopa_shell.png');
        this.load.spritesheet('Koopa_walk_R', 'assets/GameSprites/Characters/Enemigos/Koopa/Koopa_walk_R.png', {
            frameWidth: 41,
            frameHeight: 60
        });
        this.load.spritesheet('Koopa_walk', 'assets/GameSprites/Characters/Enemigos/Koopa/Koopa_walk.png', {
            frameWidth: 41,
            frameHeight: 50
        });

        // Mario
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
        this.load.spritesheet('Mario_walk', 'assets/GameSprites/Characters/Mario/Mario_walk.png', {
            frameWidth: 32,
            frameHeight: 56
        });

        //PowerUps
        this.load.image('mushroom', '../../../assets/GameSprites/PowerUps/mushroom.png');

        // Tilesets
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

        // Sonidos
        this.load.audio('MarioYell', 'assets/sonidos/MarioYell.mp3');
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

        this.load.on('complete', () => {
            // Se cambia a la escena del menú pricipal medio segundo después de terminar la precarga
            this.time.delayedCall(500, () => {
                this.scene.start('MainMenu');
            });
        });
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        this.stars = this.add.tileSprite(
            0,
            0,
            width,
            height,
            'star_pattern'
        );
        this.stars.setOrigin(0, 0);
        
        // Para que las estrellas cubran toda la pantalla
        this.stars.setDisplaySize(width, height);
        
        // Texto de carga
        this.add.text(width / 2, height / 2, 'CARGANDO', {
            fontFamily: 'chlorinap',
            fontSize: '32px',
            fill: '#ffffffff'
        }).setOrigin(0.5);
    }

    update(time, delta) {
        // Se mueven las estrellas de izquierda a derecha y de arriba a abajo
        if (this.stars) {
            this.stars.tilePositionX -= 0.05;
            this.stars.tilePositionY -= 0.015;
        }
    }
}

export default PreloadScene;