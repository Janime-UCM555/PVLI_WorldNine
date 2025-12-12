import SceneBlocks from "./SceneBlocks.js";
import{
    CATEGORY_PLAYER,
    CATEGORY_SENSOR
} from "../collisionCategories.js"

/**
 * Clase que representa un objeto de impulso/propulsión para el jugador
 * Existen tres tipos con diferentes fuerzas de impulso:
 * - ImpulsoB (Bajo): Impulso pequeño (-10 velocidad Y)
 * - ImpulsoM (Medio): Impulso medio (-15 velocidad Y)
 * - ImpulsoA (Alto): Impulso grande (-20 velocidad Y)
 * @extends SceneBlocks
 */
export class Impulse extends SceneBlocks {
    /**
     * Constructor del objeto de impulso
     * @param {Phaser.Scene} scene - La escena donde se crea el impulso
     * @param {Object} obj - Objeto con datos del tilemap
     * @param {number} obj.x - Posición X
     * @param {number} obj.y - Posición Y
     * @param {number} obj.width - Ancho del sensor
     * @param {number} obj.height - Alto del sensor
     * @param {string} obj.name - Tipo de impulso ('ImpulsoB', 'ImpulsoM', 'ImpulsoA')
     */
    constructor(scene, obj) {
        super(scene, obj, 'CoinPassS');

        /** 
         * Tipo de impulso (ImpulsoB, ImpulsoM o ImpulsoA)
         * @type {string}
         */
        this.type = obj.name;
        
        /** 
         * Indica si el jugador está actualmente en el área del impulso
         * @type {boolean}
         */
        this.hasPlayer = false;
        
        this.setBody({
            type: 'rectangle',
            width: obj.width * 2,
            height: obj.height * 2.5,
            y: this.y-30,
        });

        this.setSensor(true);
        this.setIgnoreGravity(true);
        this.setCollidesWith([CATEGORY_PLAYER]);
        this.setCollisionCategory([CATEGORY_SENSOR]);

        // Configurar animación según el tipo
        if (this.type === 'ImpulsoB')
            this.play('sunB_move');
        else if (this.type === 'ImpulsoM')
            this.play('sunM_move');
        else
            this.play('sunA_move');

        this.setUpCollisions();
    }

    /**
     * Actualización por frame - aplica el impulso si se cumplen las condiciones
     * @param {number} time - Tiempo total del juego
     * @param {number} delta - Delta time
     */
    update(time, delta)
    {
        if (this.hasPlayer && this.scene.jugador.canSunJump) {
            this.impulsePlayer(this.type);
        }
    }

    /**
     * Aplica el impulso vertical al jugador según el tipo
     * Reproduce el sonido correspondiente y establece cooldown de 1 segundo
     * @param {string} type - Tipo de impulso ('ImpulsoB', 'ImpulsoM', 'ImpulsoA')
     * @private
     */
    impulsePlayer(type)
    {
        let player = this.scene.jugador.body;
        const M = Phaser.Physics.Matter.Matter;

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
        this.scene.time.delayedCall(1000, ()=>{this.setCollidesWith([CATEGORY_PLAYER])});
    }

    /**
     * Configura el sistema de colisiones del impulso
     * Detecta entrada y salida del jugador en el área de impulso
     * @private
     */
    setUpCollisions()
    {
        this.setOnCollide((data)=>
        {
            const { bodyA, bodyB } = data;

            const player = (bodyA.label === "Mario") ? bodyA : 
                           (bodyB.label === "Mario") ? bodyB : null;

            if (player) {
                player.inImpulse=true;
                this.scene.jugador.inImpulse = true;
                if (this.scene.jugador.canSunJump)
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