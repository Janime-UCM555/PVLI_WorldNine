class Fin extends Phaser.GameObjects.Sprite
{
    constructor(scene, x, y, texture, frame, speed, range)
    {
        super(scene, x, y, texture, frame);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Propiedades esenciales
        this.speed = speed;
        this.iniY = y;
        this.range = range;
        this.direction = -1;

        this.body.setAllowGravity(false);
        this.body.setImmovable(true);

        this.body.setSize(
            32,
            1000
        );
        
        this.body.setOffset(
            0,
            -500
        );
    }
    update (time, delta)
    {
        this.y = this.iniY + Math.sin(time / this.speed) * this.range;
    }
}
export default Fin;