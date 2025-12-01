class Fin extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture, frame, speed, range)
    {
        super(scene, x, y, texture, frame);
        
        scene.add.existing(this);
        scene.matter.add.gameObject(this);
        // scene.physics.add.existing(this);
        
        // Propiedades esenciales
        this.speed = speed;
        this.iniY = y;
        this.range = range;
        this.direction = -1;

        // this.body.setAllowGravity(false);
        // this.body.setImmovable(true);
        this.setStatic(true);

        // this.body.setSize(
        //     32,
        //     1000
        // );
        // this.body.setOffset(
        //     0,
        //     -500
        // );
        this.setBody({
            type: 'rectangle',
            width: 32,
            height: 1000
        });
        this.setOrigin(0.5,0.5);
        this.body.position.t -=500;
        const sx = this.width/2;
        const sy = this.height/2;
        const w = this.width;
        const h = this.height;
        const M = Phaser.Physics.Matter.Matter;
        // this.endBody = M.Bodies.rectangle(sx,sy, w * 0.75, 100, 1);
    }
    update (time, delta)
    {
        this.y = this.iniY + Math.sin(time / this.speed/1.2) * this.range; 
        // Entre 1.2 para que no vaya tan rápido
    }
}
export default Fin;