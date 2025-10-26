import PreloadScene from './Scenes/PreloadScene.js';
import MainMenu from './Scenes/MainMenu.js';
import MapScene from './Scenes/Map.js';
import NivelScene from './Scenes/Nivel.js';

/**
 * Inicio del juego en Phaser. Creamos el archivo de configuración del juego y creamos
 * la clase Game de Phaser, encargada de crear e iniciar el juego.
 */
let config = {
	type: Phaser.AUTO,
	pixelArt: true,
	parent: 'game',
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		mode: Phaser.Scale.FIT,
		fullscreenTarget: 'game'
	},
	scene:[PreloadScene, MainMenu, MapScene, NivelScene],	// Decimos a Phaser cual es nuestra escena
	physics: { 
		default: 'arcade', 
		arcade: { 
			gravity: { y: 0}, 
			debug: true 
		} 
	},
};

new Phaser.Game(config);