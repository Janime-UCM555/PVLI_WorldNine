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
 * Clase que representa la barra de meta/finalización del nivel
 * La barra oscila verticalmente y al ser tocada por el jugador,
 * otorga puntos basados en su posición vertical y termina el nivel
 * @extends SceneBlocks
 */
export class Fin extends SceneBlocks
{
    /**
     * Constructor de la barra de fin
     * @param {Phaser.Scene} scene - La escena donde se crea la barra
     * @param {Object} obj - Objeto con datos del tilemap
     * @param {number} obj.x - Posición X inicial
     * @param {number} obj.y - Posición Y inicial
     */
    constructor(scene, obj)
    {
        super(scene, obj, 'barra_tileset');
        
        /** 
         * Velocidad de oscilación (milisegundos por ciclo)
         * @type {number}
         */
        this.speed = 600;
        
        this.y= obj.y-30;
        
        /** 
         * Posición Y inicial de la barra
         * @type {number}
         */
        this.iniY = this.y;
        
        /** 
         * Rango de movimiento vertical (píxeles)
         * @type {number}
         */
        this.range = 100;
        
        /** 
         * Dirección del movimiento (-1 o 1)
         * @type {number}
         */
        this.direction = -1;
        
        this.setDepth(3);

        this.setRectangle(32, 1000, { 
            isStatic: true, 
            isSensor: true, 
            chamfer: { radius: 0 },
            ignoreGravity: true
        });
        this.setOrigin(0.5, 0.5);

        this.setCollisionCategory([CATEGORY_TERRAIN]);
        this.setCollidesWith([CATEGORY_PLAYER]);

        this.setUpCollisions();
    }

    /**
     * Actualización por frame - mueve la barra verticalmente con movimiento sinusoidal
     * @param {number} time - Tiempo total del juego en milisegundos
     * @param {number} delta - Delta time
     */
    update (time, delta)
    {
        this.y = this.iniY + Math.sin(time / this.speed/1.2) * this.range; 
    }

    /**
     * Configura el sistema de colisiones con el jugador
     * Al contacto, calcula puntos basados en la altura y termina el nivel
     * @private
     */
    setUpCollisions()
    {
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player && this.scene) {
                // Puntos basados en la posición Y (más alto = más puntos)
                this.scene.increaseScore(Math.round(this.y * 10), 'score');
                this.scene.ganasPartida();
                this.destroy();
            }
        });
    }
}
export default Fin;