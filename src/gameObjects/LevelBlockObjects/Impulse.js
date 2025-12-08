import SceneBlocks from "./SceneBlocks.js";
import{
    CATEGORY_PLAYER,
    CATEGORY_SENSOR
} from "../collisionCategories.js"
export class Impulse extends SceneBlocks {
    /**
   * @param {Phaser.Scene} scene
   * @param {gameObject} obj
   * @param {texture} texture
   */
    constructor(scene, obj) {
        super(scene, obj, 'CoinPassS');

        this.type = obj.name;
        this.hasPlayer = false;
        this.setBody({
            type: 'rectangle',
            width: obj.width * 2,
            height: obj.height * 2.5,
            y: this.y-30,
        });

        this.setSensor(true);
        this.setIgnoreGravity(true);
        // this.setStatic(true);
        this.setCollidesWith([CATEGORY_PLAYER]);
        this.setCollisionCategory([CATEGORY_SENSOR]);

        if (this.type === 'ImpulsoB')
            this.play('sunB_move');
        else if (this.type === 'ImpulsoM')
            this.play('sunM_move');
        else
            this.play('sunA_move');

        this.setUpCollisions();
    }
    update(time, delta)
    {
        if (/*this.scene.jugador.isJumping || this.scene.jugador.jumpHeld ||*/ this.hasPlayer && this.scene.jugador.canSunJump) {
            this.impulsePlayer(this.type);
        }
    }
    impulsePlayer(type)
    {
        // this.scene.jugador.canSunJump = false;
        let player = this.scene.jugador.body;
        const M = Phaser.Physics.Matter.Matter;
        // console.log("WEAWEAAAAA");
        if (type == "ImpulsoB")
        {
            this.scene.sound.play('ImpB');
            M.Body.setVelocity(player, { x: player.velocity.x, y: -10 });
        }
        else if(type == "ImpulsoM")
        {
            this.scene.sound.play('ImpM');
            M.Body.setVelocity(player, { x: player.velocity.x, y: -15 });
        }
        else
        {
            this.scene.sound.play('ImpA');
            M.Body.setVelocity(player, { x: player.velocity.x, y: -20 });
        }
        this.hasPlayer=false;
        // this.setCollidesWith([]);
        this.scene.time.delayedCall(1000, ()=>{this.setCollidesWith([CATEGORY_PLAYER])});
    }
    setUpCollisions()
    {
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            // detectar si el jugador cae encima
            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player) {
                player.inImpulse=true;
                this.scene.jugador.inImpulse = true;
                if (this.scene.jugador.canSunJump) //|| this.scene.jugador.jumpHeld)
                {
                    this.hasPlayer = true;
                    this.impulsePlayer(this.type);
                }
            }
        });
        const exitHandle = () => 
        {
            this.hasPlayer=false;
            this.scene.time.delayedCall(200, ()=>{this.scene.jugador.inImpulse = false;});
        }
        this.scene.matter.world.on('collisionend', exitHandle);
    }
}
export default Impulse;