const TransitionCode = {
    /**
     * 
     * @param {scene} scene 
     * @param {camera} cam 
     * @param {time} duration 
     * @param {Position2D} centerWorld
     * @param {pos} startR - Radio empieza
     * @param {pos} endR - Radio fin
     * @param {Callback} callback - Método que se ejecuta al final de la transición
     */
    invoke(scene, cam, duration, centerWorld, startR, endR, callback) {
        // Fondo negro que cubrirá todo
        const blackout = scene  .add.rectangle(0, 0, cam.width, cam.height, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(1000); // Asegura que esté por encima de todo

        // Crear un círculo
        const circle = scene.make.graphics({ x: 0, y: 0, add: false });
        const playerWorld = centerWorld; 
        var radius = startR; // Tamaño al principio

        // Dibujar círculo blanco
        circle.fillStyle(0xffffff);
        circle.fillCircle(playerWorld.x,  playerWorld.y, radius);

        // Crear máscara y aplicarla invertida
        const mask = circle.createGeometryMask();
        mask.invertAlpha = true; //ESTA LÍNEA invierte la visibilidad

        blackout.setMask(mask);
        scene.tweens.add({
            targets: { r: radius}, 
            r: endR,
            duration: duration,
            ease: 'Cubic.easeInOut',
            onUpdate: (tween, target) => {
                scene.circleMask.clear();
                scene.circleMask.fillStyle(0xffffff);
                scene.circleMask.fillCircle(playerWorld.x, playerWorld.y, target.r);
            },
            onComplete:()=>
            {
                callback();
                scene.time.delayedCall(100, () => {
                    if (blackout)
                    {
                        blackout.clearMask(true);
                        blackout.destroy();
                    }
                });
            }
        });
        scene.circleMask = circle;
        scene.blackoutMask = blackout;
    }
};
export default TransitionCode