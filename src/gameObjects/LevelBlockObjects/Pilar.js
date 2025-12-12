import{
    CATEGORY_PLAYER,
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
import SceneBlocks from "./SceneBlocks.js";

/**
 * Clase que representa un pilar/columna móvil que avanza automáticamente
 * Al colisionar con el jugador, causa muerte instantánea y reinicia el nivel
 * Útil para crear desafíos de tiempo o persecución
 * @extends SceneBlocks
 */
export class Pilar extends SceneBlocks
{
    /**
     * Constructor del pilar
     * @param {Phaser.Scene} scene - La escena donde se crea el pilar
     * @param {number} x - Posición X inicial
     * @param {number} y - Posición Y inicial
     * @param {string} texture - Clave de la textura/animación del pilar
     */
    constructor(scene,x,y, texture)
    {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setDisplaySize(300,300);

        this.setBody({
            type: 'rectangle',
            x: x,
            y: y,
            width: 700,
            height:this.scene.cameras.main.height*1.5,
        });
        this.setSensor(true);
        this.setFixedRotation(true);
        this.setIgnoreGravity(true);
        this.play(texture);
        this.setCollidesWith(CATEGORY_PLAYER);
        
        /** 
         * Velocidad horizontal del pilar (píxeles por frame)
         * @type {number}
         */
        this.velocidadPilar = 4.5;

        this.setUpCollisions();
    }

    /**
     * Actualización por frame - mueve el pilar horizontalmente
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    update (time, delta)
    {
        this.setVelocityX(this.velocidadPilar);
    }

    /**
     * Configura el sistema de colisiones con el jugador
     * Al colisionar, causa muerte instantánea y reinicia el nivel
     * @private
     */
    setUpCollisions()
    {
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player && !this.scene.endTimer) {
                this.scene.jugador.hurt();
                this.scene.sound.play('StormSound');
                this.scene.endTimer=true;
                this.scene.jugador.setStatic(true);
                this.scene.doubleEndTransition(()=>{
                    this.scene.scene.restart();
                });
            }
        });
    }
}
export default Pilar;