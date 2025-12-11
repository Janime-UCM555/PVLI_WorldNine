import { DIE_TYPES } from '../../../gameObjects/Enemies/Goomba.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';
import { POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import GameScenes from '../GameScenes.js'

const M = Phaser.Physics.Matter.Matter;

class Nivel_TO extends GameScenes
{
    constructor(){
        super('Nivel_TO', ()=>
            {
            const tilesetBG = this.map.addTilesetImage('bg', 'bg_tileset');

            // Capa de suelo
            const bgLayer = this.map.createLayer('CapaFondo', tilesetBG, 0, 0);
            }, false);
    }
    
    init(){
//
    }

    preload(){
        this.load.tilemapTiledJSON(this.mapKey, 'MapaDeTiled/TestObjetos.json');
        this.score=0;
        this.endTimer=false;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.enPausa = false;
    }

    create(){
        super.create();
        // spawnPowerUp(this, 300, 600, POWERUP_TYPES.HAMMER);
    }
    timerMethod()
    {

    }
}

export default Nivel_TO;