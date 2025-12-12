/**
 * Sistema de transiciones circulares para cambios de escena
 * Crea un efecto de círculo que se expande o contrae con máscara invertida
 * @namespace TransitionCode
 */
const TransitionCode = {
    /**
     * Ejecuta una transición circular animada
     * Crea un rectángulo negro con una máscara circular invertida que se anima
     * desde un radio inicial hasta un radio final, revelando u ocultando la escena
     * 
     * @param {Phaser.Scene} scene - La escena donde se ejecuta la transición
     * @param {Phaser.Cameras.Scene2D.Camera} cam - Cámara de la escena
     * @param {number} duration - Duración de la transición en milisegundos
     * @param {Object} centerWorld - Posición central del círculo en coordenadas del mundo
     * @param {number} centerWorld.x - Coordenada X del centro
     * @param {number} centerWorld.y - Coordenada Y del centro
     * @param {number} startR - Radio inicial del círculo (píxeles)
     * @param {number} endR - Radio final del círculo (píxeles)
     * @param {Function} callback - Función que se ejecuta al completar la transición
     * 
     * @example
     * // Transición de cierre (círculo se contrae)
     * TransitionCode.invoke(
     *   this,
     *   this.cameras.main,
     *   1000,
     *   { x: player.x, y: player.y },
     *   500,  // empieza grande
     *   0,    // termina pequeño (pantalla negra)
     *   () => { this.scene.start('NextScene'); }
     * );
     * 
     * @example
     * // Transición de apertura (círculo se expande)
     * TransitionCode.invoke(
     *   this,
     *   this.cameras.main,
     *   1000,
     *   { x: player.x, y: player.y },
     *   0,    // empieza pequeño
     *   500,  // termina grande (pantalla revelada)
     *   () => { console.log('Transición completada'); }
     * );
     */
    invoke(scene, cam, duration, centerWorld, startR, endR, callback) {
        // Fondo negro que cubrirá todo
        const blackout = scene.add.rectangle(0, 0, cam.width, cam.height, 0x000000)
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(1000); // Asegura que esté por encima de todo

        // Crear un círculo
        const circle = scene.make.graphics({ x: 0, y: 0, add: false });
        const playerWorld = centerWorld; 
        var radius = startR; // Tamaño al principio

        // Dibujar círculo blanco
        circle.fillStyle(0xffffff);
        circle.fillCircle(playerWorld.x, playerWorld.y, radius);

        // Crear máscara y aplicarla invertida
        const mask = circle.createGeometryMask();
        mask.invertAlpha = true; // ESTA LÍNEA invierte la visibilidad

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