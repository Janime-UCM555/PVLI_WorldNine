import Button from '../../gameObjects/UI/Button.js';
import TransitionCode from '../../gameObjects/UI/Transition.js'
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

        this.load.audio('coin_sound', 'assets/sonidos/SE/Items/Monedas/coin.wav');

        this.load.image('TitleName', 'assets/web/TituloPNG.png');
    }

    create(){
         
        if (window.updateWebStatus) {
            window.updateWebStatus({
            sceneKey: this.level, 
            purpleCoins: this.purpleCoinScore ?? 0
        });
        }

    TransitionCode.invoke(this, this.cameras.main, 1000,{x: this.cameras.main.width/2, y:  this.cameras.main.height/2} , 0, this.cameras.main.width, ()=>{});

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

    this.title = this.add.sprite(this.cameras.main.width/2,this.cameras.main.height/3, 'TitleName');
    this.title.setScale(0.8);

    // Para que las estrellas cubran toda la pantalla
    this.stars.setDisplaySize(width, height);

    // this.mario = this.add.sprite(this.cameras.main.width - 50, this.cameras.main.height - 50, 'mario_walk');
    // this.mario.play('mario_walk');

    this.mario2 = this.add.sprite(this.cameras.main.width - 100, this.cameras.main.height - 50, 'mario_run');
    this.mario2.play('mario_run');

    this.mario3 = this.add.sprite(this.cameras.main.width - 150, this.cameras.main.height - 50, 'mario_jump');
    this.mario3.play('mario_jump');

    this.mario4 = this.add.sprite(this.cameras.main.width - 200, this.cameras.main.height - 50, 'mario_hurt');
    this.mario4.play('mario_hurt');

    this.mario5 = this.add.sprite(this.cameras.main.width - 250, this.cameras.main.height - 50, 'mario_throw');
    this.mario5.play('mario_throw');

    // Música de fondo del menú
    if (!this.menuMusic || !this.menuMusic.isPlaying) {
        this.menuMusic = this.sound.add('menu_music', { loop: true, volume: 1 });
        this.menuMusic.play();
    }



    this.buttonMove = new Button(this, 0, this.cameras.main.height/5, 'Jugar',() =>{
        if (this.menuMusic && this.menuMusic.isPlaying) {
            this.menuMusic.stop();
        }
        this.sound.play('coin_sound', { volume: 0 });
        this.buttonMove.input.enabled = false;
        TransitionCode.invoke(this, this.cameras.main, 1000,{x: this.cameras.main.width/2, y:  this.cameras.main.height/2}, 1500, 0,
        ()=>{this.scene.launch('Nivel_D');
            this.scene.stop();
        });
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
        // this.mario.setPosition(width - 50, height - 50);
        // this.mario2.setPosition(width - 100, height - 50);
        // this.mario3.setPosition(width - 150, height - 50);
        // this.mario4.setPosition(width - 200, height - 50);
        // this.mario5.setPosition(width - 250, height - 50);

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
       
    }
}

export default MainMenu;