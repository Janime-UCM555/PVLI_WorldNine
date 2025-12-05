import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_FALLOFF,
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
import SceneBlocks from "./SceneBlocks.js";

export class PauseBlock extends SceneBlocks {
    /**
     * @param {scene} scene 
     * @param {gameObject} obj 
     */
    constructor(scene, obj) {
        super(scene, obj, 'Resume');

        this.hasPlayer = false;
        this.setBody({
            type: 'rectangle',
            width: obj.width /3, // Para que se pare un poco centrado
            height: obj.height,
        });

        this.setStatic(true);
        this.setSensor(false);

        this.setCollisionCategory(CATEGORY_TERRAIN);
        this.setCollidesWith([CATEGORY_PLAYER, CATEGORY_ENEMY, CATEGORY_POWERUP]);
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

            if (player && !this.hasPlayer) {
                const activarPausa = () => {
                    this.scene.jugador.stop();
                    this.scene.jugador.setVelocity(0,0);
                    this.hasPlayer = true;
                    this.scene.enPausa = true;
                    this.setTexture('Pause');
                    this.scene.sound.play('PauseBlq');
                };
                
                activarPausa();
            }
        });
    }
    update(time, delta) {
        if (this.scene.enPausa)
        {
            let player = this.scene.jugador;
            if (player.isJumping) {
                // Reanudar al jugador
                this.setTexture('Resume'); // Cambiar textura a bloque vacío
                // player.setVelocityY(-6);
                player.resume(); // Si tienes animaciones pausadas
                this.scene.enPausa = false;

                // Restaurar bloque
                this.hasPlayer = false;
            } else {
                // Mientras está en pausa, mantener al jugador detenido
                player.setVelocity(0, 0);
            }
        }
    }
}
export default PauseBlock;