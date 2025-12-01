export class Impulso extends TiledObject {
    constructor(scene, obj) {
        super(scene, obj, 'CoinPassS');

        const type = obj.name;
        this.hasPlayer = false;

        this.setBody({
            type: 'rectangle',
            width: obj.width * 3,
            height: obj.height * 3,
        });

        this.setSensor(true);
        this.setStatic(true);

        if (type === 'ImpulsoB')
            this.play('sunB_move');
        else if (type === 'ImpulsoM')
            this.play('sunM_move');
        else
            this.play('sunA_move');
    }
}
export default Impulso;