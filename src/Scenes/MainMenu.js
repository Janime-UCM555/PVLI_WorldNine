import Button from '../gameObjects/Button.js';
class PlaySceneTest extends Phaser.Scene
{
    constructor(){
        super({key:'PlaySceneTest'});
    }

    init(){

    }
    
    preload(){
        this.load.spritesheet('lakitu', '../../../assets/sprites/Nintendo_64_-_Paper_Mario_-_Enemies_-_Lakitu-removebg-preview.png', {
            frameWidth: 32,
            frameHeight: 32,
        });
    }

    create(){
      this.anims.create({
      key: 'lakitu_fly',
      frames: this.anims.generateFrameNumbers('lakitu', { start: 0, end: 10 }),
      frameRate: 1,
      repeat: -1
    });

    const lakitu = this.add.sprite(400, 300, 'lakitu');
    lakitu.play('lakitu_fly');

    this.buttonPrueba = new Button(this, this.cameras.main.width/2 ,this.cameras.main.height/2,'Prueba',() =>{
        console.log('Prueba')
    });
    }
}

export default PlaySceneTest;