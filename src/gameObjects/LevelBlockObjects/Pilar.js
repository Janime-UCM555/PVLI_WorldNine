import{
    CATEGORY_PLAYER,
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
import SceneBlocks from "./SceneBlocks.js";
export class Pilar extends SceneBlocks
{
    /**
     * 
     * @param {scene} scene 
     * @param {gameObject} obj 
     */
    constructor(scene,x,y, texture)
    {
        super(scene, x, y, texture);
        scene.add.existing(this);
        this.setDisplaySize(300,300);

        this.setBody({
            type: 'rectangle',
            x: x,
            y: y,
            width: 700,
            height:this.scene.cameras.main.height*1.5,
        });
        this.setSensor(true);
        this.setFixedRotation(true);
        this.setIgnoreGravity(true);
        this.play(texture);
        this.setCollidesWith(CATEGORY_PLAYER);
        
        this.velocidadPilar = 4.5;

        this.setUpCollisions();
    }
    update (time, delta)
    {
        this.setVelocityX(this.velocidadPilar);
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

            if (player && !this.scene.endTimer) {
                this.scene.jugador.hurt();
                this.scene.sound.play('StormSound');
                this.scene.endTimer=true;
                this.scene.jugador.setStatic(true);
                this.scene.doubleEndTransition(()=>{
                    this.scene.scene.restart();
                });
            }
        });
    }
    

}
export default Pilar;