// HorusColumn.js
// Columna empujada por el viento de Horus. Puede ser sólida o con hueco.

export default class HorusColumn extends Phaser.GameObjects.Rectangle {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x         - posición inicial X
     * @param {number} yBase     - posición Y del suelo/base de la columna
     * @param {number} height    - altura total de la columna
     * @param {number} speedX    - velocidad horizontal (negativa hacia la izquierda)
     * @param {boolean} hasGap   - si la columna tiene hueco
     * @param {number} gapHeight - altura del hueco
     * @param {number} gapOffset - desplazamiento del hueco desde la parte superior
     */
    constructor(scene, x, yBase, height, speedX, hasGap = false, gapHeight = 64, gapOffset = 96) {
        super(scene, x, yBase - height / 2, 48, height, 0xE0C078); // color arena

        this.scene = scene;
        this.speedX = speedX;
        this.hasGap = hasGap;

        scene.add.existing(this);
        scene.matter.add.gameObject(this);

        this.setOrigin(0.5, 0.5);
        this.setDepth(10);

        const M = Phaser.Physics.Matter.Matter;
        const Bodies = M.Bodies;
        const Body = M.Body;

        // Si queremos “hueco”, usamos un cuerpo compuesto: parte de arriba + parte de abajo.
        if (hasGap) {
            const totalH = height;

            // Altura de la parte superior y de la inferior
            const upperHeight = gapOffset;
            const lowerHeight = totalH - (gapOffset + gapHeight);

            const w = this.width;

            // Posiciones Y de los cuerpos (en coordenadas de mundo)
            const upperY = this.y - (gapHeight / 2) - (lowerHeight / 2);
            const lowerY = this.y + (gapHeight / 2) + (upperHeight / 2);

            const upperBody = Bodies.rectangle(
                this.x,
                upperY,
                w,
                upperHeight,
                { isStatic: false, label: 'horus_column_upper' }
            );

            const lowerBody = Bodies.rectangle(
                this.x,
                lowerY,
                w,
                lowerHeight,
                { isStatic: false, label: 'horus_column_lower' }
            );

            const compound = Body.create({
                parts: [upperBody, lowerBody],
                inertia: Infinity,
                friction: 0,
                frictionAir: 0,
                restitution: 0
            });

            this.setExistingBody(compound);
            this.setPosition(this.x, this.y); // sincronizar sprite y cuerpo
        } else {
            // Columna sólida simple
            this.setBody({
                type: 'rectangle',
                width: this.width,
                height: height
            });
        }

        this.setIgnoreGravity(true);
        this.setStatic(false);

        // Velocidad horizontal inicial (viento)
        this.setVelocityX(this.speedX);
    }

    preUpdate(time, delta) {

    const cam = this.scene.cameras.main;

    // Si se sale por la izquierda, destruir
    if (this.x < cam.scrollX - 150) {
        this.destroy();
    } else if (this.body) {
        // Mantener la velocidad constante de “viento”
        this.setVelocityX(this.speedX);
    }
}

}
