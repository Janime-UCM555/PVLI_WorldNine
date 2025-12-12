import SceneBlocks from "./SceneBlocks.js";
import{
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
/**
 * Clase que representa pinchos peligrosos
 * Causan daño o muerte al jugador al contacto, dependiendo del tamaño del jugador
 * Soporta rotación y volteo para colocación flexible
 * @extends SceneBlocks
 */
export class Spikes extends SceneBlocks {
    /**
     * Constructor de los pinchos
     * @param {Phaser.Scene} scene - La escena donde se crean los pinchos
     * @param {Object} obj - Objeto con datos del tilemap
     * @param {number} obj.x - Posición X
     * @param {number} obj.y - Posición Y
     * @param {number} obj.rotation - Rotación en grados
     * @param {boolean} obj.flippedHorizontal - Si está volteado horizontalmente
     * @param {boolean} obj.flippedVertical - Si está volteado verticalmente
     */
    constructor(scene, obj) {
        super(scene, obj, 'spikes');

        this.setSensor(false);
        this.setStatic(true);

        // Aplicar rotación y volteo
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
        this.setCollisionCategory(CATEGORY_TERRAIN);
    }

    /**
     * Configura el sistema de colisiones con el jugador
     * Si el jugador es pequeño, muere o entra en burbuja
     * Si es grande, pierde el power-up
     * @private
     */
    setUpCollisions()
    {
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player && !this.scene.jugador.isBeingPushed &&
                !this.scene.jugador.isInvulnerable && !this.scene.jugador.isInvincible)
            {
                let playerGame = this.scene.jugador;
                if (!playerGame.isSuperSize && !this.scene.endTimer) 
                {
                    this.scene.sound.play('muerte');

                    playerGame.setVelocity(0, 0);
                    if (playerGame.body) {
                        playerGame.body.velocity.x = 0;
                        playerGame.body.velocity.y = 0;
                    }
                    if (!this.scene.isBoss)
                    {
                        if (this.scene?.jugador.bubblesLeft > 0) {
                            this.scene?.jugador.Bubble();
                        } else {
                            this.scene?.jugador.hurt();
                            this.scene?.jugador.setStatic(true);
                            this.body.collisionFilter.mask = 0;
                            this.setStatic(true);
                            this.scene.doubleEndTransition(()=>{this.scene.scene.launch('MainMenu');
                                this.scene.scene.stop();});
                        }
                    }
                    else
                    {
                        this.scene?.jugador.hurt();
                        this.scene.endTimer=true;
                        this.scene.jugador.setStatic(true);
                        this.scene.doubleEndTransition(()=>{
                            this.scene.scene.restart();
                        });
                    }
                } else {
                    let pushDirection = 0;
                    playerGame.takeDamage(pushDirection);
                }
            }
        });
    }
}
export default Spikes;