import Button from '../gameObjects/Button.js';

const B_SPACING = 100 ;

class NivelScene extends Phaser.Scene
{
    constructor(){
        super({key:'NivelScene'});
        this.score = 0;
    }

    init(){}
    
    preload(){
        // this.load.tilemapTiledJSON('map', '../../../src/Scenes/maps/desert.tmj');
        // this.load.image('tiles', '../../../src/Scenes/maps/tmw_desert_spacing.png'); // Patrones

        this.load.tilemapTiledJSON('map1', '../../../TestMapaTiled/ElMapa.json');
        this.load.image('tiles1', '../../../assets/GameSprites/Tilesets/base_tileset.png'); // Patrones
        this.load.image('tileBG', '../../../assets/GameSprites/Tilesets/Rome_BG.png');
        this.score = 0;
    }

    create(){
        // this.map = this.make.tilemap({ 
        //     key: 'map', 
        //     tileWidth: 32, 
        //     tileHeight: 32 
        // });
        // const tileset1 = this.map.addTilesetImage('Desert', 'tiles');
        // this.ground = this.map.createLayer('Ground', tileset1);
        let textScore;

        this.map1 = this.make.tilemap({ 
        key: 'map1', 
        tileWidth: 32, 
        tileHeight: 32 
        });
        const tileset2 = this.map1.addTilesetImage('MapaTiles', 'tiles1');
        const bgTileset = this.map1.addTilesetImage('bg', 'tileBG');
        
        this.bg = this.map1.createLayer('CapaFondo', bgTileset);
        this.ground2 = this.map1.createLayer('CapaSuelo', tileset2);
        this.blocks = this.map1.createLayer('CapaBloques', tileset2);
        this.deco = this.map1.createLayer('CapaDecoraciones', tileset2);

        this.mario = this.add.sprite(this.cameras.main.width - 550, this.cameras.main.height - 550, 'mario_run');
        this.mario.play('mario_run');


        this.buttonPrueba = new Button(this, 0, 0,'Prueba',() =>{
            this.scene.launch('MapScene');
            this.scene.stop();
        });

        this.buttonScore = new Button(this, 0, -B_SPACING,'Subescore',() =>{
        if (this.score < 9999999999)
        {
            this.score += 100;
            textScore.setText("".padStart( 10 - this.score.toString().length,"0")+this.score);
        }
        else{
            textScore.setText(9999999999);
        }
        // textScore.setText(score.padStart(10,"0"));
        });

        this.ui = this.add.container(this.cameras.main.width/2, this.cameras.main.height/2);
        
        this.ui.add([
            //Añadir aqui los elementos de la ui
            this.buttonPrueba,
            this.buttonScore,
        ])


        let textTimer = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -');
        textTimer.setOrigin(0.5,-0.5);
        textTimer.setFont('Arial Black');
        textTimer.setFontSize(50);
        textTimer.setAlign('center');
        textTimer.setStroke('#ffffffff', 6)
        textTimer.setFill('#000000ff');
        textTimer.setText("60");
        textTimer.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);


        textScore = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -');
        textScore.setOrigin(0.5,-1.5);
        textScore.setFont('Arial Black');
        textScore.setFontSize(50);
        textScore.setAlign('center');
        textScore.setStroke('#ffffffff', 6)
        textScore.setFill('#000000ff');
        textScore.setText("".padStart(10,"0"));
        textScore.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5); 

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
}
export default NivelScene;