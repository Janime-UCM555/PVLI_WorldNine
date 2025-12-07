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
import GameScenes from './GameScenes.js'

class Nivel_R extends GameScenes
{
    constructor(){
        super('Nivel_R', 'bg_tileset');
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

ganasPartida(player, barra) {
    this.increaseScore(Math.round(barra.y * 10), 'score');
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
    barra.destroy();
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

createText()
{
    // Este gráfico representa la línea dónde se alinea la UI por la derecha

    // var graphics = this.add.graphics();

    const posUI = this.cameras.main.centerX+this.cameras.main.centerX/2; // Posición UI por la derecha
    // graphics.lineStyle(1, 0xffffff, 1);
    // graphics.lineBetween(posUI, 0,posUI, 600);
    // graphics.setScrollFactor(0);

    const fontSize = 29; // 50 / 1.65 ≈ 29

    this.fpsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '00',{fontFamily: 'aku-kamu'})
    .setOrigin(-2,5)
    .setStroke('#000000ff', 6)
    .setFill('#38b762ff')
    .setFontSize(fontSize + 'px')
    .setDepth(10)
    // .setText("60")
    .setScrollFactor(0);


    this.textTimer = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '00',{fontFamily: 'aku-kamu'})
    .setOrigin(0.5,5)
    .setStroke('#000000ff', 6)
    .setFill('#ffffffff')
    // .setText("60")
    .setDepth(10)
    .setFontSize(fontSize + 'px')
    .setScrollFactor(0)



    this.textScore = this.add.text(posUI, this.cameras.main.centerY,"".padStart(10,"0"),{fontFamily: 'aku-kamu'})
    .setOrigin(1,5)
    .setStroke('#000000ff', 6)
    .setFill('#ffffffff')
    .setDepth(10)
    .setFontSize(fontSize + 'px')
    .setScrollFactor(0);
    // textScore.setShadow(10, 10, 'rgba(0,0,0,0.5)', 10); 
    // this.textScore.setText("".padStart(10,"0"))

    this.textCoins = this.add.text(posUI, this.cameras.main.centerY, "".padStart(2,"0"),{fontFamily: 'aku-kamu'})
    .setOrigin(1,4)
    .setStroke('#000000ff', 6)
    .setFill('#DBC716')
    // .setText("".padStart(2,"0"))
    .setDepth(10)
    .setFontSize(fontSize + 'px')
    .setScrollFactor(0);
    // this.textCoins.setText("".padStart(2,"0"));

    this.textPurpleCoins = this.add.text(posUI, this.cameras.main.centerY,"".padStart(1,"0"),{fontFamily: 'aku-kamu'})
    .setOrigin(1,3)
    .setFontSize(fontSize + 'px')
    .setAlign('center')
    .setStroke('#000000ff', 6)
    .setFill('#621C87')
    .setDepth(10)
    .setScrollFactor(0);

    // this.textPurpleCoins.setText("".padStart(1,"0"));

    this.timerMethod();
    // this.ui.add([this.fpsText,this.textPurpleCoins,this.textCoins,this.textScore,this.textTimer]);
}

timerMethod ()
{
    let timer =60;
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