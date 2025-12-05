import{
    CATEGORY_PLAYER,
} from "../collisionCategories.js"
import SceneBlocks from "./SceneBlocks.js";
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
    constructor(scene, obj) {
        super(scene, obj, 'CoinPassD');

        this.setStatic(true);
        this.setSensor(true);

        // this.setCollisionCategory(CATEGORY_FALLOFF);
        this.setCollidesWith([CATEGORY_PLAYER]);
        this.setOrigin(0.5,0.5);
            
        // if (this.body) this.body = null;
        this.type = obj.name;

        if (this.type === 'purple') {
            this.play('coin_purple_spin');
            this.coinValue = 500;
        } else {
            this.play('coin_gold_spin');
            this.coinValue = 100;
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

            if (player && this.active && !this.collected) {
                this.collectCoin(player);
                this.collected = true;
            }
        });
    }
    collectCoin(player)
    {
        this.scene.increaseScore(this.coinValue, 'score');
        if (this.coinValue === 500)
        {
            this.scene.increaseScore(1, 'purple_coin');
        }
        else
        {
            this.scene.increaseScore(this.coinValue / 100, 'coins');
        }
        this.destroy();
    }
}
export default Coins;