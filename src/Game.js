import PreloadScene from './Scenes/PreloadScene.js';
import MainMenu from './Scenes/MainMenu.js';
import MapScene from './Scenes/Map.js';
import Nivel_T from './Scenes/Nivel.js';
import Nivel_R from './Scenes/Nivel_R.js';
import Nivel_TO from './Scenes/Nivel_TO.js';
import Nivel_D from './Scenes/Nivel_D.js';
import BossJ from './Scenes/BossJ.js';

/**
 * Inicio del juego en Phaser. Creamos el archivo de configuración del juego y creamos
 * la clase Game de Phaser, encargada de crear e iniciar el juego.
 */
let config = {
	type: Phaser.AUTO,
	pixelArt: true,
	snapToPixels: false,
	parent: 'game',
	fps:300,
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		mode: Phaser.Scale.FIT,
		fullscreenTarget: 'game'
	},
	scene:[PreloadScene, MainMenu, MapScene, Nivel_T, Nivel_R, Nivel_TO, Nivel_D, BossJ],	// Decimos a Phaser cual es nuestra escena
	physics: { 
		default: 'matter', 
		matter: { 
			gravity: { y: 1}, 
			debug: true
		} 
	},
};

new Phaser.Game(config);