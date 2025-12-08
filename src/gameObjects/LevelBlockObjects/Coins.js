import{
    CATEGORY_PLAYER,
} from "../collisionCategories.js"
import SceneBlocks from "./SceneBlocks.js";
import { purpleCoinsByLevel, collectedPurpleCoinsByLevel } from "../../Scenes/Juego/GameScenes.js";
/**
 * Tipos de CoinPath:
 * - PasoMonedasAr: Arriba
 * - PasoMonedasDer: Derecha
 * - PasoMonedasArDer: Arriba Derecha 
 * - PasoMonedasAbDer: Abajo Derecha
 */
export class Coins extends SceneBlocks {
    /**
     * @param {scene} scene 
     * @param {gameObject} obj 
     */
    constructor(scene, obj, collected = false) {
        super(scene, obj, 'CoinPassD');

        this.setStatic(false);
        this.setSensor(true);
        this.setIgnoreGravity(true);

        // this.setCollisionCategory(CATEGORY_FALLOFF);
        this.setCollidesWith([CATEGORY_PLAYER]);
        this.setOrigin(0.5,0.5);
            
        // if (this.body) this.body = null;
        this.type = obj.name;

        this.collected = collected;

         
        this.sourceId = obj.id;

        if (this.type === 'purple') {
            this.play('coin_purple_spin');
            this.coinValue = 500;
            
            if (this.collected) {
                this.setAlpha(0.4);
            }

        } else {
            this.play('coin_gold_spin');
            this.coinValue = 100;
            this.collected = false;
        }

        this.setUpCollisions();
    }
    setUpCollisions()
    {        
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            // detectar al jugador
            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player && this.active) {
                this.collectCoin(player);
            }
        });
    }
    collectCoin(player)
    {
        this.scene.increaseScore(this.coinValue, 'score');
        if (this.coinValue === 500)
        {
            if(!this.collected) {
                this.scene.increaseScore(1, 'purple_coin');
            }
            else{
                this.scene.increaseScore(0, 'purple_coin');
            }

            if(this.scene.level && !this.collected){
                const record = purpleCoinsByLevel[this.scene.level] ?? 0;
                purpleCoinsByLevel[this.scene.level] = Math.max(record, this.scene.purpleCoinScore);
                const arr = collectedPurpleCoinsByLevel[this.scene.level] || (collectedPurpleCoinsByLevel[this.scene.level] = []);
                if (!arr.includes(this.sourceId)) {
                    arr.push(this.sourceId);
                }

                this.collected = true;

                try {
                    localStorage.setItem('w9_purpleCoinsByLevel', JSON.stringify(purpleCoinsByLevel));
                    localStorage.setItem('w9_collectedPurpleCoinsByLevel', JSON.stringify(collectedPurpleCoinsByLevel));
                } catch (e) {
                    console.error("No se pudo guardar en localStorage:", e);
                }
            }
            
            // Actualizar la interfaz web
            if (window.updateWebStatus) {
                window.updateWebStatus({
                    sceneKey: this.scene.level,
                    purpleCoins: this.scene.purpleCoinScore || 0
                });
            }
        }
        else
        {
            this.scene.increaseScore(this.coinValue / 100, 'coins');
        }
        this.destroy();
    }
}
export default Coins;