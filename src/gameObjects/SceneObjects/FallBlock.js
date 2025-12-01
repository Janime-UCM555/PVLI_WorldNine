export class FallBlock extends TiledObject {
    constructor(scene, obj) {
        super(scene, obj, 'fallOffBlock1');

        this.name = "BloqueCae";
        this.fallActive = false;
        this.startPosY = this.y;

        this.setStatic(true);
        this.setSensor(false);

        this.setCollisionCategory(CATEGORY_FALLOFF);
        this.setCollidesWith([CATEGORY_PLAYER]);
    }
}
export default FallBlock;