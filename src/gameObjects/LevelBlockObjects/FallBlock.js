import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_FALLOFF,
    CATEGORY_TERRAIN
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
        this.setBody({
            type: 'rectangle',
            width: obj.width * 2,
            height: obj.height,
        });
        this.setStatic(true);
        this.setSensor(false);
        this.setCollisionCategory([CATEGORY_TERRAIN]);
        this.setCollidesWith([CATEGORY_ENEMY]);
        
        this.setStatic(true);
        this.setSensor(false);

        this.setCollisionCategory([CATEGORY_FALLOFF]);
        const sensorHeight = 20;
        const x = this.x;
        const y = this.y - this.height * 2 + sensorHeight;

        const sensor = this.scene.matter.add.rectangle(x, y, obj.width*2, 5, {
            isSensor: true,
            // staticBody: true,
            // isStatic: true
        });
        this.hasPlayer = false;

        sensor.label = "oneWay";
        sensor.ignoreGravity = true;

        sensor.collisionFilter = {
            category: CATEGORY_TERRAIN,
            mask: CATEGORY_PLAYER
        };

        this.sensor = sensor;
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
                this.setCollidesWith([CATEGORY_PLAYER]);
                // activar caída con delay
                this.scene.time.delayedCall(150, () => {
                    this.fallActive = true;
                    this.setTexture("fallOffBlock2");
                });
            }
        });
        const handle = (event, bodyA, bodyB) => {
            // if(!bodyA.gameObject || bodyB.gameObject)
            // {
            //     return;
            // }
            if (!this.hasPlayer &&((bodyA.label === "oneWay"  && bodyA === this.sensor && bodyB.label === "Mario") ||
                (bodyB.label === "oneWay"  && bodyB=== this.sensor&& bodyA.label === "Mario" )))
            {
                if (this.scene.jugador.body.velocity.y > 0 && this.scene.jugador.body.position.y < this.y)
                {
                    this.scene.jugador.setVelocityX(-0.05);
                    if (!this.fallActive)
                    {
                        this.setCollidesWith([CATEGORY_ENEMY, CATEGORY_PLAYER, CATEGORY_POWERUP]);
                    }
                    else{
                        this.setCollidesWith([CATEGORY_PLAYER]);
                    }
                    this.hasPlayer = true;
                }
            }
        }
        this.setOnCollideEnd((data) => {
            this.hasPlayer=false;
            if (!this.fallActive)
            {
                this.setCollidesWith([CATEGORY_ENEMY]);
            }
        });
        this.scene.matter.world.on('collisionstart', handle);
    }
    update(time, delta) {
        // this.fallBlock.getChildren().forEach(block => {
        if (this.fallActive) {
            // block.velocityY += 0.05;
            this.setCollidesWith([CATEGORY_PLAYER]);
            this.y += 5*(delta/16.66);
        }
        if (this.x < this.scene.cameras.scrollX || this.y > this.scene.map.heightInPixels + 50)
        {
            this.setCollidesWith([CATEGORY_ENEMY, CATEGORY_PLAYER, CATEGORY_POWERUP]);
            this.y = this.startPosY;
            this.fallActive = false;
            this.setTexture('fallOffBlock1'); // Cambiar textura a bloque inicial
        }
        // });  >
    }
}
export default FallBlock;