import SceneBlocks from "./SceneBlocks.js";
import spawnPowerUp from "../PowerUps/PowerUpSpawn.js";
import{
    CATEGORY_PLAYER,
    CATEGORY_TERRAIN
} from "../collisionCategories.js"
import { POWERUP_TYPES } from "../PowerUps/PowerUps.js";
export class Block extends SceneBlocks {
    /**
     * 
     * @param {scene} scene 
     * @param {gameObject} obj 
     */
    constructor(scene, obj) {
        const props = {};
        obj.properties?.forEach(p => props[p.name] = p.value);

        const texture = props.Breakable ? 'block' : 'block?';

        super(scene, obj, texture);

        const sensor = this.scene.matter.add.rectangle(obj.x, obj.y, obj.width/2, obj.height*0.5, { 
            isStatic: true, 
            isSensor: true, 
            chamfer: { radius: 0 },
            ignoreGravity: true
        });
        sensor.collisionFilter = {
            category: CATEGORY_TERRAIN,
            mask: CATEGORY_PLAYER
        };

        this.sensor = sensor;

        this.setStatic(true);
        this.setSensor(false);
        this.setCollisionCategory(CATEGORY_TERRAIN);
        
        this._props = props;
        this.setUpCollisions();
    }
    blockHit(player) {
        // Lógica al golpear un bloque
        const props = this._props;

        if (props.Breakable && player.isSuperSize) {
            this.scene.sound.play('BrickBlock');
            this.destroy();
            // this.sound.play('block_break');
            return;
        }
        else
        {
            this.scene.sound.play('Bump')
        }
        if (props)
        {
            if (props.Spawn){
                // Spawn power-up
                if(player.isSuperSize){
                    spawnPowerUp(this.scene, this.x + this.width / 2, this.y - this.height, props.PowerUp, props.PowerUp);
                    // this.sound.play('powerup_appears');
                }
                else
                {
                    spawnPowerUp(this.scene,this.x + this.width / 2, this.y - this.height, POWERUP_TYPES.MUSHROOM, 'mushroom');
                }

                this._props.Spawn = false; // Evitar respawn

                this.setTexture('blockempty'); // Cambiar textura a bloque vacío
            }
        }
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
                if (player.gameObject.body.velocity.y > 0){ //|| player.gameObject.getCenter().y < bodyB.bounds.max.y){
                    return; // Solo al golpear desde abajo
                } 
                // const aim = this.findSpawnBlockAbovePlayer(this.jugador, 20, 20); // (toleranciaX, toleranciaY)
                // const target = aim || bodyB.gameObject; // prioriza spawn si hay uno “casi”
                this.blockHit(this.scene?.jugador);
            }
        });
    }
}
export default Block;