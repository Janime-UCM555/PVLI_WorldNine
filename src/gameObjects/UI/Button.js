class Button extends Phaser.GameObjects.Container
{
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
            fill: textColorHex
        });
        this.label.setOrigin(0.5);

        // Agregar al contenedor
        this.add(this.gfx);
        this.add(this.label);

        // Interactividad
        this.setSize(200, 50);
        this.setInteractive({ useHandCursor: true });

        this.on('pointerdown', callback);

        this.on('pointerover', () => this.drawBackground(this.selectionColor));
        this.on('pointerout', () => this.drawBackground(this.defaultColor));

        scene.add.existing(this);
    }

    drawBackground(color) {
        this.gfx.clear();
        this.gfx.fillStyle(color);
        this.gfx.fillRoundedRect(-100, -25, 200, 50, 10);
    }
}

export default Button;
