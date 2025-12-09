import GameScenes from '../GameScenes.js'
import { PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';

class Nivel_D extends GameScenes
{
    constructor(){
        super('Nivel_D', ()=>
            {
            const tilesetBGD = this.map?.addTilesetImage('bg', 'bg_tileset_D');
            const tilesetBGP = this.map?.addTilesetImage('Pyramid_BG', 'bg_tileset_P');
            // Capa de suelo
            const bgLayer = this.map?.createLayer('CapaFondo', [tilesetBGD, tilesetBGP], 0, 0);
            }, false);
    }

    init(){
//
    }

    preload(){
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON('map', 'MapaDeTiled/MapaDesierto.json');
        this.score=0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.enPausa = false;
        this.bloquePausaActivo = null;
        this.impulsoActivo = null;
    }
   create(){
        super.create();
        // Música de fondo del nivel
        if ((!this.levelMusic || !this.levelMusic.isPlaying) && !this.endTimer) {
            this.levelMusic = this.sound.add('Desierto', { loop: true, volume: 1 });
            this.levelMusic.play();
        }
        else if(this.levelMusic){
            this.levelMusic.stop();
        }
        spawnPowerUp(this,50, 625, POWERUP_TYPES.HAMMER);
   }

    ganasPartida() {
        this.endTimer=true;

        this.moveCameraToBottomRight();

        this.jugador.win();
        // barra.destroy();
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
        let timer = 80;
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
                    this.doubleEndTransition(()=>{this.scene.launch('MainMenu');
                this.scene.stop();});
                }
                if (!this.jugador.isInBubble && !this.enPausa) {
                    this.textTimer.setFill('#ffffffff');
                    timer -=1; //(timer - 1 + 60) % 60; // reinicia a 60
                }
                else{
                    this.textTimer.setFill('#cececeff');
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

export default Nivel_D;