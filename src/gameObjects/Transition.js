class TransitionCode extends Phaser.Scene
{
    constructor(cam, endPos, startRadius, endRadius, durationS, scene, callback)
    {
        super(scene);
        // Fondo negro que cubrirá todo
        const blackout = scene.add.rectangle(0, 0, cam.width, cam.height, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(1000); // Asegura que esté por encima de todo

        // Crear un círculo
        const circle = scene.make.graphics({ x: 0, y: 0, add: false });

        var radius = startRadius; // Tamaño al principio

        // Dibujar círculo blanco
        circle.fillStyle(0xffffff);
        circle.fillCircle(endPos.x,  endPos.y, radius);

        // Crear máscara y aplicarla invertida
        const mask = circle.createGeometryMask();
        mask.invertAlpha = true; //ESTA LÍNEA invierte la visibilidad

        blackout.setMask(mask);
        scene.tweens.add({
            targets: { r: radius}, 
            r: endRadius,
            duration: durationS,
            ease: 'Cubic.easeInOut',
            onUpdate: (tween, target) => {
                scene.circleMask.clear();
                scene.circleMask.fillStyle(0xffffff);
                scene.circleMask.fillCircle(endPos.x, endPos.y, target.r);
            },
            onComplete:()=>
            {
                callback;
            }
        });
        // Guardar referencias para otros métodos
        // scene.circleMask = circle;
        // scene.blackoutMask = blackout;
    }
}
export default TransitionCode;