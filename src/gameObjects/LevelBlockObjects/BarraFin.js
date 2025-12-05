import{
    CATEGORY_PLAYER,
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
import SceneBlocks from "./SceneBlocks.js";
export class Fin extends SceneBlocks
{
    /**
     * 
     * @param {scene} scene 
     * @param {gameObject} obj 
     */
    constructor(scene, obj)
    {
        super(scene, obj, 'barra_tileset');
        

        this.speed = 600;
        this.y= obj.y+100;
        // this.x= obj.x;
        this.iniY = this.y;
        this.range = 100;
        this.direction = -1;

        // Cuerpo rectangular
        this.setRectangle(32, 1000, { 
            isStatic: true, 
            isSensor: true, 
            chamfer: { radius: 0 },
            ignoreGravity: true
        });
        this.setOrigin(0.5, 0.5);

        this.setCollisionCategory(CATEGORY_TERRAIN);
        this.setCollidesWith([CATEGORY_PLAYER]);

        this.setUpCollisions();
    }
    update (time, delta)
    {
        this.y = this.iniY + Math.sin(time / this.speed/1.2) * this.range; 
        // Entre 1.2 para que no vaya tan rápido
    }
    setUpCollisions()
    {
        // Al detectar una colisión (con el jugador) se invoca el 
        // ganaspartida
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            // detectar si el jugador cae encima
            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player && this.scene) {
                this.scene.ganasPartida(player, this);
            }
        });
    }
    

}
export default Fin;