import GameScenes from '../Niveles/GameScenes.js '

class BossJ extends GameScenes
{
    constructor(){
        super('BossJ', 'bg_tileset');
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
    
   }

    ganasPartida(barra) {
        this.increaseScore(Math.round(barra.y * 10), 'score');
        this.endTimer=true;

        this.moveCameraToBottomRight();

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
        document.fonts.load('32px aku-kamu').then(() => {

            this.fpsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -',{fontFamily: 'aku-kamu'})
            .setOrigin(-2,5)
            .setStroke('#000000ff', 6)
            .setFill('#38b762ff')
            .setFontSize(fontSize + 'px')
            .setDepth(6)
            // .setText("60")
            .setScrollFactor(0);

            this.textTimer = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '00',{fontFamily: 'aku-kamu'})
            .setOrigin(0.5,5)
            .setStroke('#000000ff', 6)
            .setFill('#ffffffff')
            // .setText("60")
            .setDepth(6)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0)

            this.textScore = this.add.text(posUI, this.cameras.main.centerY,"".padStart(10,"0"),{fontFamily: 'aku-kamu'})
            .setOrigin(1,5)
            .setStroke('#000000ff', 6)
            .setFill('#ffffffff')
            .setDepth(6)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0);

            this.textCoins = this.add.text(posUI, this.cameras.main.centerY, "".padStart(2,"0"),{fontFamily: 'aku-kamu'})
            .setOrigin(1,4)
            .setStroke('#000000ff', 6)
            .setFill('#DBC716')
            .setDepth(6)
            .setFontSize(fontSize + 'px')
            .setScrollFactor(0);

            this.textPurpleCoins = this.add.text(posUI, this.cameras.main.centerY,"".padStart(1,"0"),{fontFamily: 'aku-kamu'})
            .setOrigin(1,3)
            .setFontSize(fontSize + 'px')
            .setAlign('center')
            .setStroke('#000000ff', 6)
            .setFill('#621C87')
            .setDepth(6)
            .setScrollFactor(0);

            this.timerMethod();
        });
    }

    timerMethod ()
    {
        let timer =80;
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

export default BossJ;