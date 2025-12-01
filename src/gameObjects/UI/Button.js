class Button extends Phaser.GameObjects.Container
{
    constructor(scene, x, y, text, callback, color = 0xF3D301, selectionColor = 0Xffffff)
    {
        super(scene,x,y);
        this.background = scene.add.rectangle(0, 0, 200, 50, color);
        this.background.setOrigin(0.5, 0.5);

        
        this.label = scene.add.text(0, 0, text, {fontFamily: 'chlorinap', fontSize: '24px', fill: '#000' });
        this.label.setOrigin(0.5, 0.5);

        // Agregar el fondo y el texto al contenedor
        this.add(this.background);
        this.add(this.label);

        // Hacer que el botón sea interactivo
        this.setSize(200, 50);
        this.setInteractive({ useHandCursor: true });
        

        // Agregar el evento del clic
        this.on('pointerdown', callback);
        this.on('pointerover', () => {
            this.background.setFillStyle(selectionColor); // Efecto al pasar el ratón
        });
        this.on('pointerout', () => {
            this.background.setFillStyle(color); // Vuelve al color original
        });

        // Agregar el botón a la escena
        scene.add.existing(this);
    }
}
export default Button;