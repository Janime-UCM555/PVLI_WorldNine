import Button from '../gameObjects/Button.js';
const B_SPACING = 100 ;
class MapScene extends Phaser.Scene
{
    constructor(){
        super({key:'MapScene'});
    }

    init(){

    }
    
    preload(){
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

    this.mario = this.add.sprite(this.cameras.main.width - 50, this.cameras.main.height - 50, 'mario_walk');
    this.mario.play('mario_Walk');

    this.buttonMove = new Button(this, 0, -B_SPACING, 'Move',() =>{
        this.scene.launch('MovimientoScene');
        this.scene.stop();
    })

    this.buttonPrueba = new Button(this, 0, 0,'Prueba',() =>{
        this.scene.launch('MainMenu');
        this.scene.stop();
    });

    this.buttonFullScreen = new Button(this, 0, B_SPACING, "Pantalla \nCompleta",
        () => this.scale.toggleFullscreen()
    );

    this.ui = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2);
    
    this.ui.add([
        //Añadir aqui los elementos de la ui
        this.buttonFullScreen,
        this.buttonPrueba,
        this.buttonMove
    ])

    this.scale.on('resize', (gameSize) => {this.UIResize(gameSize.width, gameSize.height)});
    this.scale.on('enterFullscreen', () => {this.UIResize(this.scale.gameSize.width, this.scale.gameSize.height)});
    this.scale.on('leaveFullscreen', () => {this.UIResize(this.scale.gameSize.width, this.scale.gameSize.height)});

    }

    UIResize(width, height){
        this.ui.setPosition(width / 2, height / 2);
        this.mario.setPosition(width - 50, height - 50);
    }
}

export default MapScene;