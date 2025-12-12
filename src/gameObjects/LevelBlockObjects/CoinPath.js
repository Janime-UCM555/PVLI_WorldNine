/**
 * Importación de las monedas
 * @module Coins
 */
import Coins from "./Coins.js";

/**
 * Importación de la clase madre
 * @module SceneBlocks
 */
import SceneBlocks from "./SceneBlocks.js";

/**
 * Importación de las categorías de colisión correspondientes
 * @module collisionCategories
 */
import{
    CATEGORY_PLAYER,
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
/**
 * Bloque especial que genera un camino de monedas al ser activado por el jugador
 * Tipos disponibles:
 * - PasoMonedasAr: Monedas hacia arriba
 * - PasoMonedasDer: Monedas hacia la derecha
 * - PasoMonedasArDer: Monedas diagonal arriba-derecha
 * - PasoMonedasAbDer: Monedas diagonal abajo-derecha
 * @extends SceneBlocks
 */
export class CoinPath extends SceneBlocks {
    /**
     * Constructor del bloque CoinPath
     * @param {Phaser.Scene} scene - La escena donde se crea el bloque
     * @param {Object} obj - Objeto con datos del tilemap
     * @param {number} obj.x - Posición X
     * @param {number} obj.y - Posición Y
     * @param {string} obj.name - Tipo de camino (PasoMonedasAr, PasoMonedasDer, etc.)
     * @param {number} obj.rotation - Rotación del objeto en grados
     * @param {boolean} obj.flippedHorizontal - Si está volteado horizontalmente
     * @param {boolean} obj.flippedVertical - Si está volteado verticalmente
     */
    constructor(scene, obj) {
        super(scene, obj, 'CoinPassD');

        this.setStatic(false);
        this.setSensor(true);
        this.setIgnoreGravity(true);

        let tex = 'CoinPassD';
        /** 
         * Tipo de camino de monedas
         * @type {string}
         */
        this.type = obj.name;
        if (this.type === 'PasoMonedasAr' || this.type === 'PasoMonedasDer') 
        { tex = 'CoinPassS'; }
        this.label = "CoinPath";
        this.setTexture(tex);
        this.setDepth(3);

        // Aplicar rotación según configuración del tilemap
        const angle = obj.rotation;
        this.setRotation(Phaser.Math.DegToRad(angle));
        this.setFlipX(obj.flippedHorizontal || false);
        this.setFlipY(obj.flippedVertical || false);
        if (angle === 90 || angle === -270) {
            this.y += this.height;
        }
        else if (angle === 180 || angle === -180) {
            this.x -= this.width;
            this.y += this.height;
        }
        else if (angle=== 270 || angle === -90) {
            this.x -= this.width;
        }
        this.setUpCollisions();
    }

    /**
     * Configura el sistema de colisiones para activar el camino de monedas
     * @private
     */
    setUpCollisions()
    {        
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player) {
                // Configurar dirección del camino según el tipo
                let coinDistanceX = 10;
                let coinDistanceY = -40;
                if(this.type === "PasoMonedasAbDer") 
                {
                    coinDistanceX = 20;
                    coinDistanceY = 40;
                }
                else if(this.type === "PasoMonedasArDer") 
                {
                    coinDistanceX = 20;
                    coinDistanceY = -40;
                }
                else if(this.type === "PasoMonedasDer") 
                {
                    coinDistanceX = 40;
                    coinDistanceY = 0;
                }
                this.spawnCoins(coinDistanceX,coinDistanceY,this);
            }
        });
    }

    /**
     * Genera el camino de 5 monedas en la dirección especificada
     * @param {number} distX - Distancia horizontal entre monedas
     * @param {number} distY - Distancia vertical entre monedas
     * @param {Phaser.GameObjects.Sprite} blockPass - Referencia al bloque que genera las monedas
     * @private
     */
    spawnCoins(distX, distY, blockPass)
    {
        this.scene.sound.play('coinPath');
        blockPass.setTint(Phaser.Display.Color.GetColor(140, 140, 140, 0.5));
        blockPass.setCollidesWith([]);
        const center = blockPass.getCenter();
        const delay = 50;

        for (let i=0; i < 5; ++i)
        {
            this.scene.time.delayedCall(delay*i,()=> { this.delayedCoins(center,distX,distY, i)}, [], this);
        }
    }

    /**
     * Crea una moneda individual con delay
     * @param {Object} center - Centro del bloque
     * @param {number} center.x - Posición X del centro
     * @param {number} center.y - Posición Y del centro
     * @param {number} distX - Distancia X desde el centro
     * @param {number} distY - Distancia Y desde el centro
     * @param {number} i - Índice de la moneda (0-4)
     * @private
     */
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