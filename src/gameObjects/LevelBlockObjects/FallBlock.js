/**
 * Importación de las categorías de colisión correspondientes
 * @module collisionCategories
 */
import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_FALLOFF,
    CATEGORY_TERRAIN
} from "../collisionCategories.js"

/**
 * Importación de la clase madre
 * @module SceneBlocks
 */
import SceneBlocks from "./SceneBlocks.js";

/**
 * Clase que representa un bloque que al pasar Mario por encima se cae al cabo de un tiempo
 * @extends SceneBlocks
 */
export class FallBlock extends SceneBlocks {
    /**
     * Constructor del FallBlock
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
            width: obj.width * 1,
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

    /**
     * Configura las colisiones para que se caigan al cabo de un tiempo si Mario pasa por encima
     * @private
     */
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
                this.scene.time.delayedCall(200, () => {
                    this.scene.time.delayedCall(200, () => {
                    this.fallActive = true;
                    });
                    this.setTexture("fallOffBlock2");
                });
            }
        });
        const isPlayer = body => body.label === "Mario";

        this.scene.matter.world.on("collisionstart", (event, bodyA, bodyB) => {
            if (((bodyA.label === "oneWay"  && bodyA === this.sensor && isPlayer(bodyB)) ||
                (bodyB.label === "oneWay"  && bodyB=== this.sensor&& isPlayer(bodyA) )))
            {
                const player = this.scene.jugador.body;
                if (player.velocity.y > 0 && player.position.y < this.body.position.y - 5)
                {
                    this.setCollidesWith([CATEGORY_ENEMY, CATEGORY_PLAYER]);
                    // this.scene?.jugador.setVelocityX(-0.1);
                    this.hasPlayer = true;
                }

            }
        });

        this.scene.matter.world.on("collisionend", (event, bodyA, bodyB) => {
            if ((bodyA === this.sensor && isPlayer(bodyB)) ||
                (bodyB === this.sensor && isPlayer(bodyA)))
            {
                this.hasPlayer = false;
                this.setCollidesWith([CATEGORY_ENEMY]);
            }
        });
    }

    /**
     * Restaura el bloque si se ha caído.
     * Si se está cayendo actualiza su posición.
     * @param {number} time - Tiempo total transcurrido
     * @param {number} delta - Tiempo desde el último frame
     */
    update(time, delta) {
        // this.fallBlock.getChildren().forEach(block => {
        if (this.x < this.scene.cameras.scrollX || this.y > this.scene.map.heightInPixels + 50)
        {
            this.setCollidesWith([CATEGORY_ENEMY, CATEGORY_PLAYER, CATEGORY_POWERUP]);
            this.y = this.startPosY;
            this.fallActive = false;
            this.setTexture('fallOffBlock1'); // Cambiar textura a bloque inicial
        }
        else if (this.fallActive) {
            // block.velocityY += 0.05;
            this.setCollidesWith([CATEGORY_PLAYER]);
            this.y += 5*(delta/16.66);
        }
        // });  >
    }
}
export default FallBlock;