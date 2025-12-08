import { DIE_TYPES } from '../../../gameObjects/Enemies/Goomba.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';
import { POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
import GameScenes from './GameScenes.js'

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
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON('map', 'MapaDeTiled/TestObjetos.json');
        this.score=0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.enPausa = false;
    }

    create(){
        super.create();
        spawnPowerUp(this, 300, 600, POWERUP_TYPES.HAMMER);
    }

    
    ganasPartida() {
        this.endTimer=true;

        this.moveCameraToBottomRight();

        this.jugador.win();
        this.jugador.play('mario_stop', true);

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
        // graphics.lineStyle(1, 0xffffff, 1);
        // graphics.lineBetween(posUI, 0,posUI, 600);
        // graphics.setScrollFactor(0);
        const posUI = this.cameras.main.centerX+this.cameras.main.centerX/2; // Posición UI por la derecha

        const fontSize = 29; // 50 / 1.65 ≈ 29
        document.fonts.load('32px aku-kamu').then(() => {

            this.fpsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -',{fontFamily: 'aku-kamu'})
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

            this.timerMethod();
        });
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
                    this.doubleEndTransition(()=>{this.scene.launch('MainMenu');
                this.scene.stop();});
                }
                if (!this.jugador.isInBubble && !this.enPausa) {
                    this.textTimer.setFill('#ffffffff');
                    timer = (timer - 1 + 60) % 60; // reinicia a 60
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
   

requestHammer(player) {
    let hammer = this.hammers.getChildren().find(h => !h.active);

    if (!hammer) {
        hammer = this.matter.add.sprite(player.x, player.y, 'hammer');
        hammer.setCircle(8);
        hammer.setBounce(0.8);
        hammer.setIgnoreGravity(false);
        hammer.setFixedRotation();
        hammer.isHammer = true;
        hammer.used = false;
        hammer.setDepth(6);

        // Config rebotes por primera vez
        hammer._bounces = 0;
        hammer._maxBounces = 3;

        // Manejar colisiones
       hammer.setOnCollide((collision) => {
            if (hammer.used) return; // si ya no hace daño, ignorar

            const bodyA = collision.bodyA;
            const bodyB = collision.bodyB;
            const other = (bodyA === hammer.body) ? bodyB : bodyA;

            const otherGO = other?.gameObject;

            // 🔹 Interface común de enemigos
            if (otherGO && otherGO.isEnemy && typeof otherGO.die === 'function') {
                otherGO.die(DIE_TYPES.HAMMER);
            }

            // Rebote solo contra bloques u objetos estáticos
            if (other && other.isStatic) {
                hammer._bounces++;

                if (hammer._bounces >= hammer._maxBounces) {
                    hammer.used = true;        // ya no hace daño
                    hammer.setBounce(0);       // sin rebote

                    // Desaparecer después de 0.3s
                    this.time.delayedCall(300, () => {
                        this.recycleHammer(hammer);
                    });
                }
            }
        });

        this.hammers.add(hammer);
    }

    hammer.used = false;
    hammer._bounces = 0;
    hammer.setBounce(0.4);
    hammer.setIgnoreGravity(false);
    hammer.setActive(true);
    hammer.setVisible(true);
    hammer.setVelocity(0, 0);
    hammer.setAngularVelocity(0);
    hammer.setDepth(6);

    return hammer;
}


recycleHammer(hammer) {
    if (!hammer) return;

    hammer.used = false;
    hammer._bounces = 0;
    hammer.setActive(false);
    hammer.setVisible(false);
    hammer.setVelocity(0, 0);
    hammer.setAngularVelocity(0);
    hammer.setPosition(-1000, -1000);
}
}

export default Nivel_TO;