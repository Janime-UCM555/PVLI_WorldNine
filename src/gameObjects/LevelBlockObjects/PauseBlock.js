import SceneBlocks from "./SceneBlocks.js";
import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_FALLOFF,
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
/**
 * Bloque que pausa al jugador hasta que salte
 * Útil para crear puntos de espera o sincronización en el nivel
 * @extends SceneBlocks
 */
export class PauseBlock extends SceneBlocks {
    /**
     * Constructor del bloque de pausa
     * @param {Phaser.Scene} scene - La escena donde se crea el bloque
     * @param {Object} obj - Objeto con datos del tilemap
     * @param {number} obj.x - Posición X
     * @param {number} obj.y - Posición Y
     * @param {number} obj.width - Ancho del bloque
     * @param {number} obj.height - Alto del bloque
     */
    constructor(scene, obj) {
        super(scene, obj, 'Resume');

        /** 
         * Indica si el jugador está actualmente sobre el bloque
         * @type {boolean}
         */
        this.hasPlayer = false;
        this.setBody({
            type: 'rectangle',
            width: obj.width,
            height: obj.height,
        });

        this.setStatic(true);
        this.setSensor(false);

        this.setCollisionCategory(CATEGORY_TERRAIN);
        this.setCollidesWith([CATEGORY_PLAYER, CATEGORY_ENEMY, CATEGORY_POWERUP]);
        this.setUpCollisions();
    }

    /**
     * Configura el sistema de colisiones para activar la pausa
     * @private
     */
    setUpCollisions()
    {        
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player && !this.hasPlayer) {
                const activarPausa = () => {
                    this.scene.jugador.stop();
                    this.scene.jugador.setVelocity(0,0);
                    this.hasPlayer = true;
                    this.scene.enPausa = true;
                    this.setTexture('Pause');
                    this.scene.sound.play('PauseBlq');
                };
                const player = this.scene?.jugador.body;
                if (player.velocity.y > 0 && player.position.y < this.body.position.y - 5)
                {activarPausa();}
            }
        });
    }

    /**
     * Actualización por frame - maneja la liberación de la pausa
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    update(time, delta) {
        if (this.scene.enPausa)
        {
            let player = this.scene.jugador;
            if (player.isJumping) {
                this.setTexture('Resume');
                player.resume();
                this.scene.enPausa = false;
                this.hasPlayer = false;
            } else {
                player.setVelocity(0, 0);
            }
        }
    }
}
export default PauseBlock;