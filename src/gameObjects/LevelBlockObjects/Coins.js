/**
 * Importación de las categorías de colisión correspondientes
 * @module collisionCategories
 */
import{
    CATEGORY_PLAYER,
    CATEGORY_SENSOR,
} from "../collisionCategories.js"

/**
 * Importación de la clase madre
 * @module SceneBlocks
 */
import SceneBlocks from "./SceneBlocks.js";

/**
 * Importación de las monedas del nivel
 * @module Scenes/Juego/GameScenes
 */
import { purpleCoinsByLevel, collectedPurpleCoinsByLevel } from "../../Scenes/Juego/GameScenes.js";

/**
 * Clase que representa una moneda coleccionable en el juego
 * Las monedas pueden ser doradas (100 puntos) o moradas (500 puntos).
 * Las monedas moradas se guardan en localStorage y persisten entre sesiones.
 * @extends SceneBlocks
 */
export class Coins extends SceneBlocks {
    /**
     * Constructor de la moneda
     * @param {Phaser.Scene} scene - La escena donde se crea la moneda
     * @param {Object} obj - Objeto con datos del tilemap (posición, nombre, etc.)
     * @param {number} obj.x - Posición X de la moneda
     * @param {number} obj.y - Posición Y de la moneda
     * @param {string} obj.name - Tipo de moneda ('purple' o 'gold')
     * @param {number} obj.id - ID único de la moneda en el mapa
     * @param {boolean} [collected=false] - Si la moneda morada ya fue recolectada anteriormente
     * 
     * @example
     * // Crear una moneda dorada
     * const goldCoin = new Coins(this, { x: 100, y: 200, name: 'gold', id: 1 });
     * 
     * @example
     * // Crear una moneda morada ya recolectada (aparece semi-transparente)
     * const purpleCoin = new Coins(this, { x: 150, y: 250, name: 'purple', id: 2 }, true);
     */
    constructor(scene, obj, collected = false) {
        super(scene, obj, 'CoinPassD');

        this.setStatic(false);
        this.setSensor(true);
        this.setIgnoreGravity(true);

        this.setCollidesWith([CATEGORY_PLAYER]);
        this.setCollisionCategory([CATEGORY_SENSOR]);
        this.setOrigin(0.5,0.5);
            
        /** 
         * Tipo de moneda ('purple' o 'gold')
         * @type {string}
         */
        this.type = obj.name;

        /** 
         * Indica si la moneda morada ya fue recolectada
         * @type {boolean}
         */
        this.collected = collected;

        this.body.label = "Coins";
        
        /** 
         * ID único de la moneda en el tilemap (para tracking de monedas moradas)
         * @type {number}
         */
        this.sourceId = obj.id;

        if (this.type === 'purple') {
            this.play('coin_purple_spin');
            /** 
             * Valor en puntos de la moneda
             * @type {number}
             */
            this.coinValue = 500;
            
            // Si ya fue recolectada, mostrarla semi-transparente
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

    /**
     * Configura el sistema de detección de colisiones con el jugador
     * Define el callback que se ejecuta cuando el jugador toca la moneda
     * @private
     */
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

    /**
     * Maneja la lógica de recolección de la moneda
     * 
     * Para monedas doradas:
     * - Otorga 100 puntos
     * - Incrementa contador de monedas en 1
     * 
     * Para monedas moradas:
     * - Otorga 500 puntos
     * - Incrementa contador de monedas moradas (solo si no estaba recolectada)
     * - Guarda en localStorage la información de recolección
     * - Actualiza la interfaz web si está disponible
     * 
     * @param {MatterJS.BodyType} player - Cuerpo físico del jugador que recolecta la moneda
     */
    collectCoin(player)
    {
        this.scene.increaseScore(this.coinValue, 'score');
        if (this.coinValue === 500)
        {
            // Solo incrementar contador si es la primera vez que se recolecta
            if(!this.collected) {
                this.scene.increaseScore(1, 'purple_coin');
            }
            else{
                this.scene.increaseScore(0, 'purple_coin');
            }

            // Guardar progreso en localStorage
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
            
            // Actualizar la interfaz web si está disponible
            if (window.updateWebStatus) {
                window.updateWebStatus({
                    sceneKey: this.scene.level,
                    purpleCoins: this.scene.purpleCoinScore || 0
                });
            }
        }
        else
        {
            // Moneda dorada: incrementar contador de monedas normales
            this.scene.increaseScore(this.coinValue / 100, 'coins');
        }
        this.destroy();
    }
}
export default Coins;