import Button from '../gameObjects/Button.js';
const B_SPACING = 100 ;
class NivelScene extends Phaser.Scene
{
    constructor(){
        super({key:'NivelScene'});
    }

    init(){

    }
    
    preload(){
        
        this.load.spritesheet('mario_run', '../../../assets/GameSprites/Characters/Mario/Mario_run.png', {
            frameWidth: 32,
            frameHeight: 55,
        });

        
        this.load.tilemapTiledJSON('map', '../../../src/Scenes/maps/desert.tmj');
        this.load.image('tiles', '../../../src/Scenes/maps/tmw_desert_spacing.png'); // Patrones
    }

    create(){
    this.map = this.make.tilemap({ 
        key: 'map', 
        tileWidth: 32, 
        tileHeight: 32 
    });
    const tileset1 = this.map.addTilesetImage('Desert', 'tiles');
    // this.ground = this.map.createLayer('Ground', tileset1);

    // const tileset = map.addTilesetImage('MapaTiles', 'tiles', 16, 16);
    // const backgroundLayer = map.createLayer('CapaSuelo', tileset);






    this.anims.create({
      key: 'mario_run',
      frames: this.anims.generateFrameNumbers('mario_run', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
    this.mario = this.add.sprite(this.cameras.main.width - 50, this.cameras.main.height - 50, 'mario_run');
    this.mario.play('mario_run');


    this.buttonPrueba = new Button(this, 0, 0,'Prueba',() =>{
        this.scene.launch('MapScene');
        this.scene.stop();
    });

    this.ui = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2);
    
    this.ui.add([
        //Añadir aqui los elementos de la ui
        this.buttonPrueba
    ])
    }
}

export default NivelScene;