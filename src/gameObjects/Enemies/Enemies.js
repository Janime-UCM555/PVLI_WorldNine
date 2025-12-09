import{
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_POWERUP,
    CATEGORY_TERRAIN,
    CATEGORY_FALLOFF
} from "../collisionCategories.js"
export class Enemies extends Phaser.GameObjects.Sprite {
    /**
   * @param {Phaser.Scene} scene
   * @param {number} x
   * @param {number} y
   * @param {texture} texture
   * @param {number} frame 
   */
    constructor(scene, x, y, texture, frame, speed, currentScene, type) {
        super(scene, x, y, texture, frame, speed, currentScene, type); // Llama al constructor padre (GameObjectsSprite)

        this.scene = scene;
        this.speed = speed; // Velocidad del Goomba
        this.sceneType = currentScene; // Detecta cada escena en la que está
        this.isAlive = true; // Estado de vivo o muerto
        this.currentlyVisible = false; // Estado actual de visibilidad
        this.shouldBeDestroyed = false; // Control de destrucción
        this.isEnemy = true; // Marca como enemigo
        this.label=type; // el tipo de enemigo

        scene.add.existing(this);
        scene.matter.add.gameObject(this);

        this.setDepth(2);
        this.setCollisionCategory([CATEGORY_ENEMY]);
        this.setCollidesWith([CATEGORY_PLAYER,CATEGORY_TERRAIN, CATEGORY_ENEMY]);
        this.sensorConfig();
        // this.setIgnoreGravity(true);
        // this.setFixedRotation();
        // this.setSize(obj.width, obj.height);

        // this.friction = 0;
        // this.frictionStatic = 0;
        // this.frictionAir = 0;
        // this.restitution = 0;
        
        // this.setUpCollisions();
    }
    sensorConfig()
    {
        this.blocked= {
            left: false,
            right: false,
        };
        this.numTouching= {
            left: 0,
            right: 0,
        }; 
    }
    /**
     * Esto funciona como un virtual void _ _ _ const = 0; en c++
     * Se tiene que definir en todas las subclases
     */
    // setUpCollisions()
    // {
    //     throw new Error("setUpCollisions() must be implemented by subclass");
    // }

    
    // Verificar visibilidad
    checkVisibility() {
        if (this.shouldBeDestroyed) return false;
        
        const camera = this.scene.cameras.main;
        const margin = 50;
        
        const isVisible = 
            this.x >= camera.scrollX - margin && 
            this.x <= camera.scrollX + camera.width + margin && 
            this.y >= camera.scrollY - margin && 
            this.y <= camera.scrollY + camera.height + margin;
        
        return isVisible;
    }

    safeDestroy() {
        if (this.shouldBeDestroyed) return;
        
        this.shouldBeDestroyed = true;
        this.isAlive = false;
        
        // Detener todas las físicas inmediatamente
        if (this.body) {
            this.setVelocity(0, 0);
            this.body.enable = false;
        }

        if(this.bodySegments)
        {
            // Destruir todos los sprites
            this.bodySegments.forEach(segment => segment.destroy());
            if (this.head) this.head.destroy();
        }

        // Cancelar todos los tweens
        this.scene.tweens.killTweensOf(this);
        
        // Detener animaciones
        if (this.anims) {
            this.anims.stop();
        }
        
        this.setVisible(false);
        this.setActive(false);
        this.destroy();
    }
}
export default Enemies;