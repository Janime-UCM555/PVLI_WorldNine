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
        this.load.image('Mario_bubble', 'assets/GameSprites/Characters/Mario/Mario_bubble.png');
        this.load.spritesheet('Mario_fall', 'assets/GameSprites/Characters/Mario/Mario_fall.png', {
            frameWidth: 48,
            frameHeight: 56
        });
        this.load.spritesheet('Mario_hammer_throw', 'assets/GameSprites/Characters/Mario/Mario_hammer_throw.png', {
            frameWidth: 48,
            frameHeight: 56
        });
        this.load.image('Mario_hurt', 'assets/GameSprites/Characters/Mario/Mario_hurt.png');
        this.load.spritesheet('Mario_jump', 'assets/GameSprites/Characters/Mario/Mario_jump.png', {
            frameWidth: 48,
            frameHeight: 56
        });
        this.load.spritesheet('Mario_run', 'assets/GameSprites/Characters/Mario/Mario_run.png', {
            frameWidth: 32,
            frameHeight: 56
        });
        this.load.spritesheet('Mario_walk', 'assets/GameSprites/Characters/Mario/Mario_walk.png', {
            frameWidth: 32,
            frameHeight: 56
        });

        // Tilesets
        this.load.spritesheet('base_tileset', 'assets/GameSprites/Tilesets/base_tileset.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        this.load.image('Rome_BG', 'assets/GameSprites/Tilesets/Rome_BG.png');

        // Sonidos
        this.load.audio('MarioYell', 'assets/sonidos/MarioYell.mp3');

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