import Button from '../gameObjects/Button.js';
const B_SPACING = 100 ;
class MainMenu extends Phaser.Scene
{
    constructor(){
        super({key:'MainMenu'});
    }

    init(){

    }
    
    preload(){
        this.load.image('menu_pattern', 'assets/GameSprites/Precarga/menu_pattern.jpg');
        this.load.spritesheet('mario_walk', '../../../assets/GameSprites/Characters/Mario/Mario_walk.png', {
            frameWidth: 32,
            frameHeight: 55,
        });
        
        this.load.spritesheet('mario_run', '../../../assets/GameSprites/Characters/Mario/Mario_run.png', {
            frameWidth: 32,
            frameHeight: 55,
        });

        this.load.spritesheet('mario_jump', '../../../assets/GameSprites/Characters/Mario/Mario_jump.png', {
            frameWidth: 45,
            frameHeight: 55,
        });

        this.load.spritesheet('mario_hurt', '../../../assets/GameSprites/Characters/Mario/Mario_hurt.png', {
            frameWidth: 45,
            frameHeight: 55,
        });
        
        this.load.spritesheet('mario_throw', '../../../assets/GameSprites/Characters/Mario/Mario_hammer_throw.png', {
            frameWidth: 48,
            frameHeight: 55,
        });
    }

    create(){

    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    this.stars = this.add.tileSprite(
        0,
        0,
        width,
        height,
        'menu_pattern'
    );
    this.stars.setOrigin(0, 0);
        
    // Para que las estrellas cubran toda la pantalla
    this.stars.setDisplaySize(width, height);

      this.anims.create({
      key: 'mario_Walk',
      frames: this.anims.generateFrameNumbers('mario_walk', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'mario_Run',
      frames: this.anims.generateFrameNumbers('mario_run', { start: 0, end: 3 }),
      frameRate: 12,
      repeat: -1
    });
    this.anims.create({
      key: 'mario_Jump',
      frames: this.anims.generateFrameNumbers('mario_jump', { start: 0, end: 1 }),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'mario_Hurt',
      frames: this.anims.generateFrameNumbers('mario_hurt', { start: 0, end: 0 }),
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'mario_Throw',
      frames: this.anims.generateFrameNumbers('mario_throw', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });

    this.mario = this.add.sprite(this.cameras.main.width - 50, this.cameras.main.height - 50, 'mario_walk');
    this.mario.play('mario_Walk');

    this.mario2 = this.add.sprite(this.cameras.main.width - 100, this.cameras.main.height - 50, 'mario_run');
    this.mario2.play('mario_Run');

    this.mario3 = this.add.sprite(this.cameras.main.width - 150, this.cameras.main.height - 50, 'mario_jump');
    this.mario3.play('mario_Jump');

    this.mario4 = this.add.sprite(this.cameras.main.width - 200, this.cameras.main.height - 50, 'mario_hurt');
    this.mario4.play('mario_Hurt');

    this.mario5 = this.add.sprite(this.cameras.main.width - 250, this.cameras.main.height - 50, 'mario_throw');
    this.mario5.play('mario_Throw');



    this.buttonMove = new Button(this, 0, -B_SPACING + B_SPACING/2, 'Jugar',() =>{
        this.scene.launch('MovimientoScene');
        this.scene.stop();
    })

    // this.buttonPrueba = new Button(this, 0, 0,'Prueba',() =>{
    //     this.scene.launch('NivelScene');
    //     this.scene.stop();
    // });

    this.buttonFullScreen = new Button(this, 0, B_SPACING / 2, "Pantalla \nCompleta",
        () => this.scale.toggleFullscreen()
    );

    this.ui = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2);
    
    this.ui.add([
        //Añadir aqui los elementos de la ui
        this.buttonFullScreen,
        // this.buttonPrueba,
        this.buttonMove
    ])

    this.scale.on('resize', (gameSize) => {this.UIResize(gameSize.width, gameSize.height)});
    this.scale.on('enterFullscreen', () => {this.UIResize(this.scale.gameSize.width, this.scale.gameSize.height)});
    this.scale.on('leaveFullscreen', () => {this.UIResize(this.scale.gameSize.width, this.scale.gameSize.height)});
    }

    UIResize(width, height){
        this.ui.setPosition(width / 2, height / 2);
        this.mario.setPosition(width - 50, height - 50);
        this.mario2.setPosition(width - 100, height - 50);
        this.mario3.setPosition(width - 150, height - 50);
        this.mario4.setPosition(width - 200, height - 50);
        this.mario5.setPosition(width - 250, height - 50);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
        this.scale.off(Phaser.Scale.Events.RESIZE, this.UIResize, this);
        this.scale.off(Phaser.Scale.Events.ENTER_FULLSCREEN, undefined, this);
        this.scale.off(Phaser.Scale.Events.LEAVE_FULLSCREEN, undefined, this);
        
        // Ajustar world bounds
        if(this.physics?.world) this.physics.world.setBounds(0, 0, width, height);
  });
        
    }
        update(time, delta) {
        // Se mueven las estrellas de izquierda a derecha y de arriba a abajo
        if (this.stars) {
            this.stars.tilePositionX -= 0.05;
            this.stars.tilePositionY -= 0.015;
        }
    }
}

export default MainMenu;