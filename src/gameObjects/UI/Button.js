/**
 * @class Button
 * @extends Phaser.GameObjects.Container
 * @description Botón al que se le puede añadir texto y hacer una función.
 */
class Button extends Phaser.GameObjects.Container
{
    /**
     * Crea el botón configurándolo en la escena.
     * Se le asigna una posición, un texto, una función y color
     * @param {*} scene - Escena en la que va a estar
     * @param {*} x - Posición X del botón
     * @param {*} y - Posición Y del botón
     * @param {*} text - Texto que aparece en el botón
     * @param {*} callback - Función que realizará el botón si se pulsa
     * @param {*} color - Color del botón
     * @param {*} selectionColor - Color del botón cuando se pasa el cursor por encima
     * @param {*} textColor - Color del texto del botón
     */
    constructor(scene, x, y, text, callback, color = 0xF3D301, selectionColor = 0Xffffff, textColor = 0x000000)
    {
        super(scene, x, y);

        this.defaultColor = color;
        this.selectionColor = selectionColor;

        // Dibujar fondo
        this.gfx = scene.add.graphics();
        this.drawBackground(color);
        const textColorHex = "#" + textColor.toString(16).padStart(6, "0");

        // Texto
        this.label = scene.add.text(0, 0, text, {
            fontFamily: 'chlorinap',
            fontSize: '24px',
            fill: textColorHex,
            align: 'center'
        });
        this.label.setOrigin(0.5);

        // Agregar al contenedor
        this.add(this.gfx);
        this.add(this.label);

        // Interactividad
        this.setSize(200, 50);
        this.setInteractive({ useHandCursor: true });

        this.on('pointerdown', callback);

        this.on('pointerover', () => {this.drawBackground(this.selectionColor), this.setScale(1.05)});
        this.on('pointerout', () => {this.drawBackground(this.defaultColor), this.setScale(1)});

        scene.add.existing(this);
    }

    /**
     * Dibuja el botón del color especificado y de forma rectangular con bordes redondeados
     * @param {*} color - Color del botón
     */
    drawBackground(color) {
        this.gfx.clear();
        this.gfx.fillStyle(color);
        this.gfx.fillRoundedRect(-100, -25, 200, 50, 10);
    }
}

export default Button;
