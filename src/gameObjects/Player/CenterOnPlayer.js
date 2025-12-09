export const centerCameraOnPlayer=(scene, player, scrollSlow, scrollFast) =>{
        // Obtener las dimensiones reales de la vista de la cámara considerando el zoom
        const camera = scene.cameras.main;
        const cameraViewWidth = camera.width / camera.zoom;
        const cameraViewHeight = camera.height / camera.zoom;

        // Seguimiento horizontal
        let targetX;

        // Establecer el objetivo de la cámara horizontalmente
        if (player.x < cameraViewWidth *0.25) {
            targetX = -200;
        }
        else if(Math.abs(player.body.velocity.x) < 0.05) {
            targetX = player.x - cameraViewWidth *scrollSlow;
        }
        else {
            targetX = player.x - cameraViewWidth * scrollFast;
        }

        // Seguimiento vertical
        let targetY;
    
        if (player.isInBubble) {
            // Cuando está en la burbuja, posicionar más alto en la pantalla
            targetY = player.y - cameraViewHeight * 0.4;
        } else {
            // Calcular la posición vertical ideal
            const baseTargetY = player.y - cameraViewHeight * 0.65;

            if (!player.isGrounded) {
                // Cuando salta, mantener la cámara un poco más alta
                targetY = player.y - cameraViewHeight * 0.7;
            } else {
                // Cuando está en el suelo, mantenerlo en la posición vertical ideal
                targetY = baseTargetY
            }
        }

        // Suavizado tipo "spring" con LERP para el movimiento suave
        const smoothFactorX = 0.1;  // Ajustar la suavidad horizontal
        const smoothFactorY = 0.05; // Ajustar la suavidad vertical

        // // Movimiento de la cámara suavizado
        // const dx = targetX - cam.scrollX;
        // const dy = targetY - cam.scrollY;

        // // Aplicar el suavizado con un Lerp (Interpolación lineal)
        // const moveX = cam.scrollX + dx * smoothFactorX;
        // const moveY = cam.scrollY + dy * smoothFactorY;

        camera.scrollX += (targetX-camera.scrollX)*smoothFactorX;
        camera.scrollY += (targetY-camera.scrollY)*smoothFactorY;
    }
export default centerCameraOnPlayer;