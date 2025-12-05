import SceneBlocks from "./SceneBlocks.js";
import{
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
export class Spikes extends SceneBlocks {
    constructor(scene, obj) {
        // Pasamos el origin correcto ANTES de crear el body
        super(scene, obj, 'spikes');

        this.setSensor(false);
        this.setStatic(true);
        // Aplicamos rotación 
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

    setUpCollisions()
    {
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            // detectar si el jugador cae encima
            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player && !this.scene.jugador.isBeingPushed &&
                !this.scene.jugador.isInvulnerable && !this.scene.jugador.isInvincible)
            {
                let playerGame = this.scene.jugador;
                if (!playerGame.isSuperSize && !this.scene.endTimer) 
                {
                    this.scene.sound.play('muerte');

                    // Detener cualquier movimiento de Mario antes de la burbuja
                    playerGame.setVelocity(0, 0);
                    if (playerGame.body) {
                        playerGame.body.velocity.x = 0;
                        playerGame.body.velocity.y = 0;
                    }

                    if (playerGame.bubblesLeft > 0) {
                        playerGame.Bubble(); // Entra en burbuja
                    } else {
                        this.scene.doubleEndTransition(()=>{this.scene.scene.launch('MainMenu');
                        this.scene.scene.stop();});
                        this.scene.jugador.hurt();
                    }
                } else {
                    // Colisión lateral
                    let pushDirection = 0; // Determinar dirección del empuje
                    playerGame.takeDamage(pushDirection);
                }
            }
        });
    }
}
export default Spikes;