import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_FALLOFF
} from "../collisionCategories.js"
import SceneBlocks from "./SceneBlocks.js";

export class FallBlock extends SceneBlocks {
    /**
     * @param {scene} scene 
     * @param {gameObject} obj 
     */
    constructor(scene, obj) {
        super(scene, obj, 'fallOffBlock1');

        this.name = "BloqueCae";
        this.fallActive = false;
        this.startPosY = this.y;

        this.setStatic(true);
        this.setSensor(false);

        this.setCollisionCategory([CATEGORY_FALLOFF]);
        this.setCollidesWith([CATEGORY_PLAYER, CATEGORY_ENEMY, CATEGORY_POWERUP]);
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
                this.setCollidesWith([CATEGORY_PLAYER]);
                // activar caída con delay
                this.scene.time.delayedCall(150, () => {
                    this.fallActive = true;
                    this.setTexture("fallOffBlock2");
                });
            }
        });
    }
    update(time, delta) {
        // this.fallBlock.getChildren().forEach(block => {
        if (this.fallActive) {
            // block.velocityY += 0.05;
            this.y += 5*(delta/16.66);
        }
        if (this.x < this.scene.cameras.scrollX || this.y > this.scene.map.heightInPixels + 50)
        {
            this.y = this.startPosY;
            this.fallActive = false;
            this.setTexture('fallOffBlock1'); // Cambiar textura a bloque inicial
        }
        // });  >
    }
}
export default FallBlock;