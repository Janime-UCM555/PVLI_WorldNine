/**
 * Centra la cámara en el jugador con seguimiento suavizado
 * Implementa un sistema de seguimiento dinámico que ajusta la posición de la cámara
 * según el estado del jugador (en movimiento, en el aire, en burbuja, etc.)
 * 
 * @param {Phaser.Scene} scene - La escena de Phaser que contiene la cámara
 * @param {Object} player - Referencia al objeto jugador
 * @param {number} scrollSlow - Factor de desplazamiento cuando el jugador está quieto o moviéndose lento (ej: 0.25)
 * @param {number} scrollFast - Factor de desplazamiento cuando el jugador está en movimiento rápido (ej: 0.35)
 * 
 * @example
 * // Uso típico en el método update de una escena
 * centerCameraOnPlayer(this, this.player, 0.25, 0.35);
 */
export const centerCameraOnPlayer=(scene, player, scrollSlow, scrollFast) =>{
        // Obtener las dimensiones reales de la vista de la cámara considerando el zoom
        const camera = scene.cameras.main;
        const cameraViewWidth = camera.width / camera.zoom;
        const cameraViewHeight = camera.height / camera.zoom;

        // Seguimiento horizontal
        let targetX;

        // Establecer el objetivo de la cámara horizontalmente
        if (player.x < cameraViewWidth *0.25) {
            // Si el jugador está en el extremo izquierdo, fijar la cámara
            targetX = -200;
        }
        else if(Math.abs(player.body.velocity.x) < 0.05) {
            // Jugador quieto o moviéndose muy lento
            targetX = player.x - cameraViewWidth *scrollSlow;
        }
        else {
            // Jugador en movimiento rápido
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

        // Aplicar interpolación lineal (LERP) para suavizar el movimiento de la cámara
        camera.scrollX += (targetX-camera.scrollX)*smoothFactorX;
        camera.scrollY += (targetY-camera.scrollY)*smoothFactorY;
    }

export default centerCameraOnPlayer;