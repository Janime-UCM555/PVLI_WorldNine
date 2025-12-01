const CLASS_MAP = {
    Bloques: Block,
    FallOffs: FallBlock,
    Pinchos: Spike,
    PauseBlocks: PausaBlock,
    Impulsos: Impulso,
    CaminoMonedas: CoinPath,
    Monedas: Coin,
    BarraFin: Fin
};

export class SceneBlocks extends Phaser.Physics.Matter.Sprite {
    
    constructor(scene, obj, texture) {
        const x = obj.x + obj.width / 2;
        const y = obj.y - obj.height / 2;
        super(scene.matter.world, x, y, texture);

        this.scene = scene;
        this.obj = obj;

        scene.add.existing(this);

        this.setIgnoreGravity(true);
        this.setFixedRotation();
        this.setSize(obj.width, obj.height);

        this.friction = 0;
        this.frictionStatic = 0;
        this.frictionAir = 0;
        this.restitution = 0;
    }
}
export default SceneBlocks;