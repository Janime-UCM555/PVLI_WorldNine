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

    this.load.spritesheet('GombEgypt_Walk', 'GameSprites/Characters/Enemigos/Goomba/GombEgypt_Walk.png', {
        frameWidth: 34,
        frameHeight: 35
    });
    this.load.spritesheet('GombEgypt_Bite', 'GameSprites/Characters/Enemigos/Goomba/GombEgypt_Bite.png', {
        frameWidth: 34,
        frameHeight: 35
    });
    this.load.image('GombEgypt_Stomp', 'GameSprites/Characters/Enemigos/Goomba/GombEgypt_Stomp.png');

    // Koopa
    this.load.image('Koopa_idle', 'GameSprites/Characters/Enemigos/Koopa/Koopa_idle.png');
    this.load.image('Koopa_shell', 'GameSprites/Characters/Enemigos/Koopa/Koopa_shell.png');
    this.load.spritesheet('Koopa_walk', 'GameSprites/Characters/Enemigos/Koopa/Koopa_walk.png', {
        frameWidth: 41,
        frameHeight: 50
    });

    this.load.image('Koopa_idle_R', 'GameSprites/Characters/Enemigos/Koopa/Koopa_idle_R.png');
    this.load.spritesheet('Koopa_walk_R', 'GameSprites/Characters/Enemigos/Koopa/Koopa_walk_R.png', {
        frameWidth: 41,
        frameHeight: 60
    });

    this.load.image('Koopa_idle_E', 'GameSprites/Characters/Enemigos/Koopa/Koopa_idle_E.png');
    this.load.spritesheet('Koopa_walk_E', 'GameSprites/Characters/Enemigos/Koopa/Koopa_walk_E.png', {
        frameWidth: 41,
        frameHeight: 62
    });

    //Planta Piraña
    this.load.image('Piranha_plant', 'GameSprites/Characters/Enemigos/PiranhaPlant/PiranhaPlant_Idle.png');
    this.load.spritesheet('piranha_movement', 'GameSprites/Characters/Enemigos/PiranhaPlant/PiranhaPlant_movement.png', {
        frameWidth: 46,
        frameHeight: 51
    });

    //Pokey
    this.load.spritesheet('pokey', 'GameSprites/Characters/Enemigos/Pokey/Pokey.png', {
        frameWidth: 30,
        frameHeight: 30
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
    this.load.spritesheet('mario_walk', 'GameSprites/Characters/Mario/Mario_walk.png', {
        frameWidth: 32,
        frameHeight: 56
    });
    this.load.spritesheet('mario_throw', 'GameSprites/Characters/Mario/Mario_hammer_throw.png', {
        frameWidth: 48,
        frameHeight: 55,
    });
    this.load.spritesheet('mario_bubble', 'GameSprites/Characters/Mario/Mario_bubble.png', {
        frameWidth: 72,
        frameHeight: 72,
    });
    this.load.spritesheet('mario_idle', 'GameSprites/Characters/Mario/Mario_idle.png', {
        frameWidth: 32,
        frameHeight: 56,
    });
    this.load.spritesheet('mario_panicrun', 'GameSprites/Characters/Mario/Mario_panicrun.png', {
        frameWidth: 44,
        frameHeight: 56,
    });
    this.load.spritesheet('mario_panicjump', 'GameSprites/Characters/Mario/Mario_panicjump.png', {
        frameWidth: 44,
        frameHeight: 56,
    });
    this.load.spritesheet('mario_panicfall', 'GameSprites/Characters/Mario/Mario_panicfall.png', {
        frameWidth: 44,
        frameHeight: 56,
    });

    // Júpiter
    this.load.spritesheet('jupiter_neutral', 'GameSprites/Characters/Bosses/Jupiter/Jupiter_Neutral.png', {
        frameWidth: 39,
        frameHeight: 52,
    });
    this.load.spritesheet('jupiter_attack', 'GameSprites/Characters/Bosses/Jupiter/Jupiter_Attack.png', {
        frameWidth: 39,
        frameHeight: 54,
    });
    this.load.spritesheet('jupiter_tired', 'GameSprites/Characters/Bosses/Jupiter/Jupiter_Tired.png', {
        frameWidth: 40,
        frameHeight: 58,
    });
    this.load.spritesheet('jupiter_dead', 'GameSprites/Characters/Bosses/Jupiter/Jupiter_Dead.png', {
        frameWidth: 39,
        frameHeight: 56,
    });
    this.load.spritesheet('warning_triangle', 'GameSprites/Characters/Bosses/Jupiter/Warning_Triangle.png', {
        frameWidth: 234,
        frameHeight: 226,
    });
    this.load.spritesheet('lightning', 'GameSprites/Characters/Bosses/Jupiter/Lightning.png', {
        frameWidth: 1224,
        frameHeight: 350,
    });

    // Hades
    this.load.spritesheet('Hades', 'GameSprites/Characters/Bosses/Hades/HadesAnim.png', {
        frameWidth: 46,
        frameHeight: 47
    });
    this.load.spritesheet('HadesDead', 'GameSprites/Characters/Bosses/Hades/HadesDeadAnim.png', {
        frameWidth: 44,
        frameHeight: 46
    });
    this.load.spritesheet('WispFire', 'GameSprites/Characters/Bosses/Hades/FuegoFatuoAnim.png', {
        frameWidth: 30,
        frameHeight: 45
    });
    this.load.spritesheet('WispFireFading', 'GameSprites/Characters/Bosses/Hades/FuegoFatuoApagado.png', {
        frameWidth: 32,
        frameHeight: 34
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
    this.load.image('blockempty', 'GameSprites/Items/blockempty.png');
    this.load.image('block', 'GameSprites/Items/blockBreakable.png');

    //FallBlocks
    this.load.image('fallOffBlock1', 'GameSprites/Items/FallOffBlock.png');
    this.load.image('fallOffBlock2', 'GameSprites/Items/FallOffBlock2.png');
    
    //Bloques Pause y Continue
    this.load.image('Pause', 'GameSprites/Items/PauseBlock.png');
    this.load.image('Resume', 'GameSprites/Items/ResumeBlock.png');
    
    //Pinchos
    this.load.image('spikes', 'GameSprites/Items/Spikes.png');

    //CoinPass 2 direcciones
    this.load.image('CoinPassD', 'GameSprites/Items/CoinPassDiagonal.png');
    this.load.image('CoinPassS', 'GameSprites/Items/CoinPassStraight.png');

    //Intensidad soles
    this.load.spritesheet('Impulsos', 'GameSprites/Items/SunIntensity.png', {
        frameWidth: 32,
        frameHeight: 32,
    });

    // Tilesets
    this.load.spritesheet('mi_tileset', 'GameSprites/Tilesets/base_tileset.png',{
        frameWidth:32,
        frameHeight:32
    });
    this.load.image('bg_tileset', 'GameSprites/Tilesets/Rome_BG.png');
    this.load.image('bg_tileset_D', 'GameSprites/Tilesets/Dessert_BG.png');
    this.load.image('bg_tileset_P', 'GameSprites/Tilesets/Pyramid_BG.png');
    this.load.image('bg_tileset_BJ', 'GameSprites/Tilesets/Colosseum_BG.png');
    this.load.image('bg_tileset_Nube', 'GameSprites/Tilesets/Cloud_BG.png');
    this.load.image('bg_tileset_BH', 'GameSprites/Tilesets/Hell_BG.png');
    this.load.spritesheet('barra_tileset', 'GameSprites/Items/barraFin.png', {
        frameWidth: 64,
        frameHeight: 32
    });
    this.load.spritesheet('coin_tileset', 'GameSprites/Items/Coins.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    
    // PilaresBosses
    this.load.spritesheet('pilar_nubeTiles', 'GameSprites/ObjetosBosses/PilarNube.png', {
        frameWidth: 128,
        frameHeight: 126
    });
    this.load.spritesheet('pilar_fuegoTiles', 'GameSprites/ObjetosBosses/PilarFuego.png', {
        frameWidth: 128,
        frameHeight: 126
    });
    this.load.spritesheet('water_tileset', 'GameSprites/Tilesets/Water.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    this.load.image('water', 'GameSprites/Tilesets/Water.png');
    this.load.tilemapTiledJSON('water_ts', 'MapaDeTiled/Water.tsx')

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
    this.load.audio('PauseBlq', 'sonidos/SE/Items/Bloques/PauseBlock.wav');
    this.load.audio('ImpB', 'sonidos/SE/Items/Bloques/ImpulseA.wav');
    this.load.audio('ImpM', 'sonidos/SE/Items/Bloques/ImpulseB.wav');
    this.load.audio('ImpA', 'sonidos/SE/Items/Bloques/ImpulseM.wav');
    this.load.audio('bubblePop', 'sonidos/SE/Mario/Acciones/BubblePop.wav');
    this.load.audio('bubbleCreate', 'sonidos/SE/Mario/Acciones/BubbleCreate.wav');
    this.load.audio('coinPath', 'sonidos/SE/Items/Bloques/CoinPath.wav');
    this.load.audio('JupiterLightningSound', 'sonidos/SE/JupiterSFX/JupiterLightning.wav');
    this.load.audio('StormSound', 'sonidos/SE/JupiterSFX/PilarNube.wav');
    this.load.audio('fallWater', 'sonidos/SE/JupiterSFX/CaeAgua.wav');

    // Música
    this.load.audio('level_music', 'sonidos/BGM/level_theme.mp3');
    this.load.audio('Boss_Jupiter', 'sonidos/BGM/BossJ.mp3');
    this.load.audio('Desierto', 'sonidos/BGM/Desierto.mp3');
    this.load.audio('menu_music', 'sonidos/BGM/menu_theme.mp3');
    this.load.audio('victory_music', 'sonidos/BGM/Nivel_Completado.wav');
    this.load.audio('starman', 'sonidos/BGM/Starman.wav');

        // Menu SFX
        this.load.audio('iris-out', 'sonidos/SE/MenuSFX/smw_goal_iris-out.wav');


        this.load.on('complete', () => {
            // Se cambia a la escena del menú pricipal medio segundo después de terminar la precarga
            this.time.delayedCall(500, () => {
                // this.scene.start('MainMenu');
                document.fonts.load('32px aku-kamu').then(() => {});
                this.showPlayButton();
            });
        });
    }
    createAnimations() {
          this.anims.create({
            key: 'HadesAnim',
            frames: this.anims.generateFrameNumbers('Hades', { start: 0, end: 4 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'HadesDeadAnim',
            frames: this.anims.generateFrameNumbers('HadesDead', { start: 0, end: 2 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'WispFireAnim',
            frames: this.anims.generateFrameNumbers('WispFire', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'WispFireFadingAnim',
            frames: this.anims.generateFrameNumbers('WispFireFading', { start: 0, end: 0 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'pilar_ny',
            frames: this.anims.generateFrameNumbers('pilar_nubeTiles', { start: 0, end: 10 }),
            frameRate: 20,
            repeat: -1
        });
        this.anims.create({
            key: 'pilar_f',
            frames: this.anims.generateFrameNumbers('pilar_fuegoTiles', { start: 0, end: 10 }),
            frameRate: 20,
            repeat: -1
        });
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
            key: 'mario_panicjump',
            frames: this.anims.generateFrameNumbers('mario_panicjump', { start: 0, end: 1 }),
            frameRate: 8,
            repeat: -1
        });
           
        this.anims.create({
            key: 'mario_panicfall',
            frames: this.anims.generateFrameNumbers('mario_panicfall', { start: 0, end: 1 }),
            frameRate: 20,
            repeat: -1
        });
        
        this.anims.create({
            key: 'mario_panicrun',
            frames: this.anims.generateFrameNumbers('mario_panicrun', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'gomb_walk',
            frames: this.anims.generateFrameNumbers('Gomb_Walk', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'gombrome_walk',
            frames: this.anims.generateFrameNumbers('gombrome_walk', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'gombegypt_walk',
            frames: this.anims.generateFrameNumbers('GombEgypt_Walk', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Koopa_walk',
            frames: this.anims.generateFrameNumbers('Koopa_walk', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Koopa_walk_R',
            frames: this.anims.generateFrameNumbers('Koopa_walk_R', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'Koopa_walk_E',
            frames: this.anims.generateFrameNumbers('Koopa_walk_E', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
        });
        this.anims.create({
            key: 'piranha_movement',
            frames: this.anims.generateFrameNumbers('piranha_movement', { start: 0, end: 3 }),
            frameRate: 8,
            repeat: -1
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
        this.createAnimations();
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