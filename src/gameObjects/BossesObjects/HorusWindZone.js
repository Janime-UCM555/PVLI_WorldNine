/**
 * Zona de viento de Horus: Mario la atraviesa, pero modifica su velocidad
 * @extends Phaser.GameObjects.Rectangle
 */
export default class HorusWindZone extends Phaser.GameObjects.Rectangle {
    /**
     * @param {Phaser.Scene} scene
     * @param {number} x         - posición inicial X (centro)
     * @param {number} y         - posición inicial Y (centro)
     * @param {number} width     - ancho de la zona
     * @param {number} height    - alto de la zona
     * @param {number} speedX    - velocidad horizontal (negativa hacia la izquierda)
     * @param {Phaser.Physics.Matter.Sprite} player - referencia a Mario
     */
    constructor(scene, x, y, width, height, speedX, player) {
        super(scene, x, y, width, height, 0x55ccff, 0.45);

        this.scene = scene;
        this.player = player;
        this.speedX = speedX;

        scene.add.existing(this);
        scene.matter.add.gameObject(this, {
            isSensor: true,
        });

        this.setOrigin(0.5, 0.5);
        this.setDepth(9);
        this.setIgnoreGravity(true);
        this.setStatic(false);
        this.setVelocityX(this.speedX);

        // Para poder identificarla fácilmente si quieres en depuración
        if (this.body) {
            this.body.label = "horus_wind_zone";
        }
    }

    /**
     * Se desplaza hacia la izquierda hasta que se sale de la pantalla, momento en el que se destruye.
     * Si intersecta con Mario le reduce la velocidad a Mario.
     * @param {number} time - Tiempo total transcurrido
     * @param {number} delta - Tiempo desde el último frame
     * @returns 
     */
    preUpdate(time, delta) {
        super.preUpdate?.(time, delta);

        const cam = this.scene.cameras.main;

        // Si sale de la pantalla hacia la izquierda, la destruimos
        if (this.x + this.width < cam.scrollX - 150) {
            this.destroy();
            return;
        }

        // Mantener la velocidad constante
        if (this.body) {
            this.setVelocityX(this.speedX);
        }

        // Si no hay jugador o no tiene cuerpo, no hacemos nada
        if (!this.player || !this.player.body) return;

        // Comprobar solapamiento a nivel AABB simple
        const windBounds = this.getBounds();
        const playerBounds = this.player.getBounds();

        if (Phaser.Geom.Intersects.RectangleToRectangle(windBounds, playerBounds)) {
            const body = this.player.body;
            const vx = body.velocity.x || 0;

            // Si Mario va hacia la derecha → viento en contra (ralentiza)
            // Si va hacia la izquierda → viento a favor (acelera)
            if (vx > 0) {
                this.player.setVelocityX(vx * 0.6);
            } else if (vx < 0) {
                this.player.setVelocityX(vx * 1.4);
            }
        }
    }
}
