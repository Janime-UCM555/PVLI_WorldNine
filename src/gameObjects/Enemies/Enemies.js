// export class SceneBlocks extends Phaser.Physics.Matter.Sprite {
//     /**
//    * @param {Phaser.Scene} scene
//    * @param {gameObject} obj
//    * @param {texture} texture
//    */
//     constructor(scene, obj, texture) {

//         const x = obj.x + obj.width / 2;
//         const y = obj.y - obj.height / 2;
//         super(scene.matter.world, x, y, texture);

//         this.scene = scene;
//         this.obj = obj;

//         scene.add.existing(this);
//         this.setIgnoreGravity(true);
//         this.setFixedRotation();
//         this.setSize(obj.width, obj.height);

//         this.friction = 0;
//         this.frictionStatic = 0;
//         this.frictionAir = 0;
//         this.restitution = 0;
        
//         this.setUpCollisions();
//     }
//     /**
//      * Esto funciona como un virtual void _ _ _ const = 0; en c++
//      * Se tiene que definir en todas las subclases
//      */
//     setUpCollisions()
//     {
//         throw new Error("setUpCollisions() must be implemented by subclass");
//     }
// }
// export default SceneBlocks;