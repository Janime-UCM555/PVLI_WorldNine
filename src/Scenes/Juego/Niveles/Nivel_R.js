// import Button from '../../../gameObjects/UI/Button.js';
// import Mario from '../../../gameObjects/Player/Mario.js';
// import Fin from '../../../gameObjects/LevelBlockObjects/BarraFin.js';
// import Goomba from '../../../gameObjects/Enemies/Goomba.js';
// import Koopa from '../../../gameObjects/Enemies/Koopa.js';
// import PiranhaPlant from '../../../gameObjects/Enemies/PiranhaPlant.js';
// import Pokey from '../../../gameObjects/Enemies/Pokey.js';
// import TransitionCode from '../../../gameObjects/UI/Transition.js'
// import { PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
// import { DIE_TYPES } from '../../../gameObjects/Enemies/Goomba.js';
import GameScenes from '../GameScenes.js'

class Nivel_R extends GameScenes
{
    constructor(){
        super('Nivel_R', ()=>
            {
            const tilesetBG = this.map.addTilesetImage('bg', 'bg_tileset');

            // Capa de suelo
            const bgLayer = this.map.createLayer('CapaFondo', tilesetBG, 0, 0);
            }, false);
    }
    
    init(){

    }

    preload(){
        this.load.tilemapTiledJSON('map', 'MapaDeTiled/ElMapa.json');
        this.score=0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.timer = 60;
    }
    create(){
        super.create();
        // Música de fondo del nivel
        if (!this.levelMusic || !this.levelMusic.isPlaying) {
            this.levelMusic = this.sound.add('level_music', { loop: true, volume: 1 });
            this.levelMusic.play();
        }
    }
}

export default Nivel_R;