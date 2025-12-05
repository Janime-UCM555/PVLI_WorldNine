import PowerUp from "./PowerUps.js";
// Spawner simple (tu PowerUp ya añade físicas y movimiento)
export const spawnPowerUp= (scene, x, y, type) =>
{
    let power = new PowerUp(scene, x, y, type, type, 0)
    power.setVelocityX(power.body.velocity.x * 0.09315); // Salir del bloque hacia arriba
    power.setVelocityY(-power.body.velocity.x/2);
    scene.powerups.add(power);
    return scene.powerups;
}
export default spawnPowerUp;