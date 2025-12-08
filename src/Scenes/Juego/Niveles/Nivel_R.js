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
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON('map', 'MapaDeTiled/ElMapa.json');
        this.score=0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
    }
    create(){
        super.create();
        // Música de fondo del nivel
        if (!this.levelMusic || !this.levelMusic.isPlaying) {
            this.levelMusic = this.sound.add('level_music', { loop: true, volume: 1 });
            this.levelMusic.play();
        }

    }

ganasPartida() {
    this.endTimer=true;

    this.moveCameraToBottomRight();

    // Destruir todos los Goombas
    this.goombas.getChildren().forEach(goomba => {
        if (goomba.safeDestroy && !goomba.shouldBeDestroyed) {
            goomba.safeDestroy();
        }
    });

    // Destruir todos los Koopas
    this.koopas.getChildren().forEach(koopa => {
        if (koopa.safeDestroy && !koopa.shouldBeDestroyed) {
            koopa.safeDestroy();
        }
    });

    // Destruir todas las plantas piraña
    this.piranhas.getChildren().forEach(piranha => {
        if (piranha.safeDestroy && !piranha.shouldBeDestroyed) {
            piranha.safeDestroy();
        }
    });

    this.pokeys.getChildren().forEach(pokey => {
        if (pokey.safeDestroy && !pokey.shouldBeDestroyed) {
            pokey.safeDestroy();
        }
    });

    this.jugador.win();
    this.jugador.play('mario_stop', true);

    // Detener música de nivel al ganar
    if (this.levelMusic && this.levelMusic.isPlaying) {
        this.levelMusic.stop();
    }

    const victoryMusic = this.sound.add('victory_music');
    victoryMusic.play();
    victoryMusic.once('complete', () => {
    this.jugador.play('mario_victory', true);
    setTimeout(() => {
        this.doubleEndTransition(
            ()=>{this.scene.launch('MainMenu');
            this.scene.stop();});        
    }, 1000);
    });
}

timerMethod ()
{
    let timer = 60;
    this.endTimer = false;
    this.timerEvent = this.time.addEvent({
    delay: 1000,
    loop: true,
    callback: () => {
        if (!this.endTimer)
        {
            this.textTimer.setText(timer.toString().padStart(2, '0'));
            if (timer == 0) {
                this.endTimer=true;
                this.sound.play('muerte');
                this.jugador.hurt();
                this.jugador.setStatic(true);
                this.doubleEndTransition(
                ()=>{this.scene.launch('MainMenu');
                this.scene.stop();});
            }
            if (!this.jugador.isInBubble) {
                timer = (timer - 1 + 60) % 60; // reinicia a 60
            }
        }
        else{
            timer = 0;
            this.textTimer.setText(timer.toString().padStart(2, '0'));
        }
    },
    });

    // Eventos para limpiar listeners al cerrar la escena
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    this.timerEvent?.remove(false);
    });
}
}

export default Nivel_R;