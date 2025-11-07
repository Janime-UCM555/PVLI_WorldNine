const B_SPACING = 100 ;

class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
          const isPages = /github\.io$/.test(location.hostname);
  // Ej.: https://user.github.io/tu-repo/  (o http://localhost:xxxx/… en local)
  const absoluteBase =
    location.origin +
    location.pathname
      // si estás en /tu-repo/index.html -> lo deja en /tu-repo/
      .replace(/index\.html?$/i, '')
      // si estás en /tu-repo/subcarpeta/archivo.html -> lo deja en /tu-repo/subcarpeta/
      .replace(/[^/]*$/, '');

  // En Pages usamos URL absoluta; en local también funciona
  this.load.setBaseURL(absoluteBase);
  // Todo lo que cargues a partir de aquí será relativo a /assets/
  this.load.setPath('assets/');
        this.load.image('star_pattern', 'GameSprites/Precarga/star_pattern.png');

        // Goomba
        this.load.spritesheet('Gomb_Bite', 'GameSprites/Characters/Enemigos/Goomba/Gomb_Bite.png', {
            frameWidth: 32,
            frameHeight: 30
        });
        this.load.image('Gomb_Stomp', 'GameSprites/Characters/Enemigos/Goomba/Gomb_Stomp.png');
        this.load.spritesheet('Gomb_Walk', 'GameSprites/Characters/Enemigos/Goomba/Gomb_Walk.png', {
            frameWidth: 30,
            frameHeight: 30
        });
        this.load.spritesheet('gombrome_walk', 'GameSprites/Characters/Enemigos/Goomba/GombRome_Walk.png', {
            frameWidth: 30,
            frameHeight: 30
        });
        this.load.spritesheet('GombRome_Bite', 'GameSprites/Characters/Enemigos/Goomba/GombRome_Bite.png', {
            frameWidth: 32,
            frameHeight: 30
        });
        this.load.image('GombRome_Stomp', 'GameSprites/Characters/Enemigos/Goomba/GombRome_Stomp.png');
        this.load.spritesheet('GombRome_Walk', 'GameSprites/Characters/Enemigos/Goomba/GombRome_Walk.png', {
            frameWidth: 30,
            frameHeight: 30
        });

        // Koopa
        this.load.image('Koopa_idle_R', 'GameSprites/Characters/Enemigos/Koopa/Koopa_idle_R.png');
        this.load.image('Koopa_idle', 'GameSprites/Characters/Enemigos/Koopa/Koopa_idle.png');
        this.load.image('Koopa_shell', 'GameSprites/Characters/Enemigos/Koopa/Koopa_shell.png');
        this.load.spritesheet('Koopa_walk_R', 'GameSprites/Characters/Enemigos/Koopa/Koopa_walk_R.png', {
            frameWidth: 41,
            frameHeight: 60
        });
        this.load.spritesheet('Koopa_walk', 'GameSprites/Characters/Enemigos/Koopa/Koopa_walk.png', {
            frameWidth: 41,
            frameHeight: 50
        });

        // Mario
        this.load.spritesheet('mario_run', 'GameSprites/Characters/Mario/Mario_run.png', {
            frameWidth: 32,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_jump', 'GameSprites/Characters/Mario/Mario_jump.png', {
            frameWidth: 48,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_stop', 'GameSprites/Characters/Mario/Mario_no_movement.png', {
            frameWidth: 32,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_hurt', 'GameSprites/Characters/Mario/Mario_hurt.png', {
            frameWidth: 48,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_victory', 'GameSprites/Characters/Mario/Mario_victory.png', {
            frameWidth: 48,
            frameHeight: 56,
        });
        this.load.spritesheet('mario_fall', 'GameSprites/Characters/Mario/Mario_fall.png', {
            frameWidth: 48,
            frameHeight: 56
        });
        this.load.spritesheet('Mario_walk', 'GameSprites/Characters/Mario/Mario_walk.png', {
            frameWidth: 32,
            frameHeight: 56
        });

          this.load.spritesheet('mario_throw', 'GameSprites/Characters/Mario/Mario_hammer_throw.png', {
            frameWidth: 48,
            frameHeight: 55,
        });

        //PowerUps
        this.load.image('star', 'GameSprites/PowerUps/star.png');
        this.load.image('hammer', 'GameSprites/PowerUps/hammer.png');
        this.load.image('double_jump', 'GameSprites/PowerUps/double_jump.png');
        this.load.image('dash', 'GameSprites/PowerUps/dash.png');
        this.load.image('jump_boots', 'GameSprites/PowerUps/jump_boots.png');
        this.load.image('mushroom', 'GameSprites/PowerUps/mushroom.png');

        // Blocks
        this.load.image('block?', 'GameSprites/Items/blockint.png');
        this.load.image('block', 'GameSprites/Items/blockBreakable.png');

        // Tilesets
        this.load.image('mi_tileset', 'GameSprites/Tilesets/base_tileset.png');
        this.load.image('bg_tileset', 'GameSprites/Tilesets/Rome_BG.png');
        this.load.spritesheet('barra_tileset', 'GameSprites/Items/barraFin.png', {
            frameWidth: 64,
            frameHeight: 32
        });
        this.load.spritesheet('coin_tileset', 'GameSprites/Items/Coins.png', {
            frameWidth: 32,
            frameHeight: 32
        });

        //Logo
        this.load.image('TitleName', 'web/TituloPNG.png');

        // Sonidos
        this.load.audio('MarioYell', 'sonidos/MarioYell.mp3');
        this.load.audio('coin_sound', 'sonidos/SE/Items/Monedas/coin.wav');
        this.load.audio('purple_coin_sound', 'sonidos/SE/Items/Monedas/purpleCoin.wav');
        this.load.audio('purple_coin_all_sound', 'sonidos/SE/Items/Monedas/purpleCoinAll.wav');
        this.load.audio('salto', 'sonidos/SE/Mario/Acciones/salto.wav');
        this.load.audio('aplastar', 'sonidos/SE/Mario/Acciones/Stomp.wav');
        this.load.audio('muerte', 'sonidos/SE/Mario/Acciones/Muerte.wav');
        this.load.audio('PowerUp', 'sonidos/SE/Items/PowerUps/PowerUp.wav');
        this.load.audio('PowerDown', 'sonidos/SE/Items/PowerUps/PowerDown.wav');
        this.load.audio('paso1', 'sonidos/SE/Mario/Acciones/pisadaBloque1.wav');
        this.load.audio('paso2', 'sonidos/SE/Mario/Acciones/pisadaBloque2.wav');
        this.load.audio('starJump', 'sonidos/SE/Mario/Acciones/saltoEstrella.wav');
        this.load.audio('starEnding', 'sonidos/SE/Items/PowerUps/estrellaSeAcaba.wav');
        this.load.audio('BrickBlock', 'sonidos/SE/Items/Bloques/BrickBlock.wav');
        this.load.audio('Bump', 'sonidos/SE/Items/Bloques/Bump.wav');

        // Música
        this.load.audio('level_music', 'sonidos/BGM/level_theme.mp3');
        this.load.audio('menu_music', 'sonidos/BGM/menu_theme.mp3');
        this.load.audio('victory_music', 'sonidos/BGM/Nivel_Completado.wav');
        this.load.audio('starman', 'sonidos/BGM/Starman.wav');

        // Menu SFX
        this.load.audio('iris-out', 'sonidos/SE/MenuSFX/smw_goal_iris-out.wav');



        this.load.on('complete', () => {
            // Se cambia a la escena del menú pricipal medio segundo después de terminar la precarga
            this.time.delayedCall(500, () => {
                // this.scene.start('MainMenu');
                this.showPlayButton();
            });
        });
    }
    showPlayButton()
    {
        const button = this.add.text(this.cameras.main.width/2, this.cameras.main.height/2, 'Play Game', {
            fontFamily: 'chlorinap',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center',
            fixedWidth: 260,
            backgroundColor: '#444545'
        }).setPadding(32).setOrigin(0.5);


        button.setInteractive({ useHandCursor: true });

        button.on('pointerover', () => {
            button.setBackgroundColor('#8d8d8d');
        });

        button.on('pointerout', () => {
            button.setBackgroundColor('#444545');
        });
        button.on('pointerdown', ()=>
        {
            this.scene.launch('MainMenu');
            this.scene.stop();
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