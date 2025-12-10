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
        super(scene, obj);
        const M = Phaser.Physics.Matter.Matter;
        const body = M.Bodies.rectangle(
            obj.width,
            obj.height,
            {
                chamfer: { radius: 10 }
            }
        );
        this.setExistingBody(body);
        // this.setPosition(obj.x, obj.y);
        // const frame = obj.gid - this.scene.tile.firstgid;
        // this.setTexture('mi_tileset',frame);
        this.slop = 0;
        this.setStatic(true);
        this.setSensor(false);
        this.setCollisionCategory([CATEGORY_TERRAIN]);
        this.setCollidesWith([CATEGORY_ENEMY]);
        const sensorHeight = 20;
        const x = this.x;
        const y = this.y - this.height/2 - 2;


        const sensor = this.scene.matter.add.rectangle(x, y, this.width, 10, {
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
            if (!this.hasPlayer &&((bodyA.label === "oneWay"  && bodyA === this.sensor && bodyB.label === "Mario") ||
                (bodyB.label === "oneWay"  && bodyB=== this.sensor&& bodyA.label === "Mario" )))
            {
                const player = this.scene.jugador.body;
                if (player.velocity.y > 0 && player.position.y < this.body.position.y - 20)
                {
                    this.setCollidesWith([CATEGORY_ENEMY, CATEGORY_PLAYER]);
                    // this.scene?.jugador.setVelocityX(-0.1);
                    this.hasPlayer = true;
                }

            }
        }
        const handleExit = (event, bodyA, bodyB) => {
            if (this.hasPlayer && ((bodyA.label === "oneWay" && bodyA === this.sensor && bodyB.label === "Mario") ||
                (bodyB.label === "oneWay" && bodyB === this.sensor && bodyA.label === "Mario")))
            {
                this.hasPlayer = false;
                this.setCollidesWith([CATEGORY_ENEMY]);
            }
        }
        this.scene.matter.world.on('collisionend', handleExit);
        this.scene.matter.world.on('collisionstart', handle);
    }
}
export default OneWay;