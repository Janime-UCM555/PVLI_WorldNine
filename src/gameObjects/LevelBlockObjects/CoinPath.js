import{
    CATEGORY_PLAYER,
    CATEGORY_TERRAIN
} from "../collisionCategories.js";
import Coins from "./Coins.js";
import SceneBlocks from "./SceneBlocks.js";
/**
 * Tipos de CoinPath:
 * - PasoMonedasAr: Arriba
 * - PasoMonedasDer: Derecha
 * - PasoMonedasArDer: Arriba Derecha 
 * - PasoMonedasAbDer: Abajo Derecha
 */
export class CoinPath extends SceneBlocks {
    /**
     * @param {scene} scene 
     * @param {gameObject} obj 
     */
    constructor(scene, obj) {
        super(scene, obj, 'CoinPassD');

        this.setStatic(true);
        this.setSensor(true);
    
        let tex = 'CoinPassD';
        this.type = obj.name;
        if (this.type === 'PasoMonedasAr' || this.type === 'PasoMonedasDer') 
        { tex = 'CoinPassS'; }

        this.setTexture(tex);
        this.setRotation(Phaser.Math.DegToRad(obj.rotation));

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

            if (player) {
                // 5 monedas en
                // Arriba Recto por defecto
                let coinDistanceX = 10;
                let coinDistanceY = -40;
                if(this.type === "PasoMonedasAbDer") 
                { // Abajo Derecha
                    // 5 monedas Abajo Diagonal
                    coinDistanceX = 20;
                    coinDistanceY = 40;
                }
                else if(this.type === "PasoMonedasArDer") 
                { // Arriba Derecha
                    coinDistanceX = 20;
                    coinDistanceY = -40;
                }
                else if(this.type === "PasoMonedasDer") 
                { // Derecha Recto
                    coinDistanceX = 40;
                    coinDistanceY = 0;
                }
                this.spawnCoins(coinDistanceX,coinDistanceY,this);
            }
        });
    }
    spawnCoins(distX, distY, blockPass)
    {
        this.scene.sound.play('coinPath');
        blockPass.setTint(Phaser.Display.Color.GetColor(140, 140, 140, 0.5));
        blockPass.setCollidesWith([]);
        const center = blockPass.getCenter();
        const delay = 50;
        // 4 monedas 
        for (let i=0; i < 5; ++i)
        {
            this.scene.time.delayedCall(delay*i,()=> { this.delayedCoins(center,distX,distY, i)}, [], this);
        }
    }
    delayedCoins(center, distX, distY, i)
    {
        const x = center.x + i * distX;
        const y = center.y + i * distY;

        const coinData = {
            x,
            y,
            width: 16,
            height: 16,
            name: "coin"
        };

        const coin = new Coins(this.scene, coinData);
    }

}
export default CoinPath;