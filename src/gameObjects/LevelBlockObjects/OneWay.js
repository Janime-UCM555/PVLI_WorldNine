import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_FALLOFF,
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
import SceneBlocks from "./SceneBlocks.js";

export class OneWay extends SceneBlocks {
    /**
     * @param {scene} scene 
     * @param {gameObject} obj 
     */
    constructor(scene, obj) {
        super(scene, obj, 'Resume');
        this.setBody({
            type: 'rectangle',
            width: obj.width * 2,
            height: obj.height,
        });
        this.setStatic(true);
        this.setSensor(false);
        this.setCollisionCategory([CATEGORY_TERRAIN]);
        this.setCollidesWith([CATEGORY_ENEMY]);
        const sensorHeight = 20;
        const x = this.x;
        const y = this.y - this.height * 2 + sensorHeight;

        const sensor = this.scene.matter.add.rectangle(x, y, obj.width, 5, {
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
    setUpCollisions() {
        const handle = (event, bodyA, bodyB) => {
            // if(!bodyA.gameObject || bodyB.gameObject)
            // {
            //     return;
            // }
            if (!this.hasPlayer &&((bodyA.label === "oneWay"  &&bodyB.label === "Mario") ||
                (bodyB.label === "oneWay" && bodyA.label === "Mario" )))
            {
                // if (this.scene.jugador.body.velocity.y > 0 && this.scene.jugador.body.position.y < this.y)
                // {
                    this.hasPlayer = true;
                    this.setCollidesWith([CATEGORY_ENEMY, CATEGORY_PLAYER]);
                    // this.scene.time.delayedCall(300, () => {
                    // this.hasPlayer=false;
                    // this.setCollidesWith([CATEGORY_ENEMY]);});
                    // }
            }
        }
        const exitHandle = (event, bodyA, bodyB) => {
            if (this.hasPlayer)
            {
                this.hasPlayer=false;
                this.setCollidesWith([CATEGORY_ENEMY]);
            }
        }
        this.scene.matter.world.on('collisionstart', handle);
        this.scene.matter.world.on('collisionend', exitHandle);
    }
}
export default OneWay;