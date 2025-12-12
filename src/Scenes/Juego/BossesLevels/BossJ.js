import GameScenes from '../GameScenes.js';
import Pilar from '../../../gameObjects/LevelBlockObjects/Pilar.js';
import JupiterBoss from '../../../gameObjects/BossesObjects/JupiterBoss.js';
import spawnPowerUp from '../../../gameObjects/PowerUps/PowerUpSpawn.js';
import { PowerUp, POWERUP_TYPES } from '../../../gameObjects/PowerUps/PowerUps.js';
/**
 * Importación del jugador Mario.
 * @module Player/Mario
 */
import Mario from '../../../gameObjects/Player/Mario.js';
class BossJ extends GameScenes
{
    constructor(){
        super('BossJ', ()=>{
        const tilesetBGD = this.map?.addTilesetImage('Colosseum_BG', 'bg_tileset_BJ');
        const tilesetBGP = this.map?.addTilesetImage('MapaTiles', 'mi_tileset');
            // Capa de suelo
        let bgLayer = this.map?.createLayer('CapaFondo', [tilesetBGD, tilesetBGP], 0, 0);
        bgLayer.setDepth(0);

        const tilesetWater = this.map?.addTilesetImage('Water', 'water');
        const tilesetNube = this.map?.addTilesetImage('Cloud_BG', 'bg_tileset_Nube');
        let frontLayer = this.map?.createLayer('CapaFondo2', [tilesetNube, tilesetWater], 0, 0);
        frontLayer.setDepth(5);
        
        this.jugador = new Mario(this, 75, 600, 'mario_run', 5, -3.75, true, true);
        
        }, true);
    }
    
    init(){
//
    }

    preload(){
        console.log('=== INICIO ===');
        this.load.tilemapTiledJSON(this.mapKey, 'MapaDeTiled/BossJupiter.json');
        this.score=0;
        this.coinScore = 0;
        this.purpleCoinScore = 0;
        this.enPausa = false;
        this.endTimer=false;
        this.bloquePausaActivo = null;
        this.impulsoActivo = null;
    }
   create(){
        super.create();
        // Música de fondo del nivel
        spawnPowerUp(this,40, 600, POWERUP_TYPES.MUSHROOM);
        if ((!this.levelMusic || !this.levelMusic.isPlaying) && !this.endTimer) {
            this.levelMusic = this.sound.add('Boss_Jupiter', { loop: false, volume: 1 });
            this.levelMusic.play();
        }
        else if(this.levelMusic){
            this.levelMusic.stop();
        }
        this.pilar = new Pilar(this,-903,625,'pilar_ny');
        const bossAttacks = this.map.getObjectLayer('ApareceJefe').objects;
        let id = 0;
        let attackZones = [];
        for (const bossAttack of bossAttacks)
        {
            attackZones[id] = {minX: bossAttack.x, maxX:bossAttack.x+1150, id: id};
            ++id;
        }
        this.jupiterBoss = new JupiterBoss(this, 550, 575, {
            player: this.jugador
        }, attackZones);          
        this.time.delayedCall(2000, () => {
            this.jupiterBoss.startBattle();
        });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            if (this.jupiterBoss) {
                this.jupiterBoss.destroy();
            }
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
            this.fpsText = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, '- phaser text stroke -',{fontFamily: 'aku-kamu'})
            .setOrigin(-2,5)
            .setStroke('#000000ff', 6)
            .setFill('#38b762ff')
            .setFontSize(fontSize + 'px')
            .setDepth(6)
            // .setText("60")
            .setScrollFactor(0);

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
    }
    ganasPartida()
    {
        const fadeTween = this.tweens.add({
            targets: this.pilar,
            alpha: 0,
            scaleX: 0.4,
            scaleY: 0.4,
            duration: 1000,
            ease: 'Cubic',
            onComplete: () => {
                // Destruir el pilar cuando esté completamente transparente
                if (this.pilar) {
                    this.pilar.destroy();
                }
            }
        });
        super.ganasPartida();
    }
    // update(time,delta)
    // {
    //     super.update(time,delta);
    //     if (!this.endTimer)
    //     {
    //         // Posicionar bien la cámara respecto al jugador
    //         centerCameraOnPlayer(this,this.jugador,0.55, 0.66);
    //     }
    // }
    timerMethod()
    {
    }
}

export default BossJ;