import PreloadScene from './Scenes/Titulo/PreloadScene.js';
import MainMenu from './Scenes/Titulo/MainMenu.js';
import MapScene from './Scenes/Titulo/Map.js';
import Nivel_R from './Scenes/Juego/Niveles/Nivel_R.js';
import Nivel_TO from './Scenes/Juego/Niveles/Nivel_TO.js';
import Nivel_D from './Scenes/Juego/Niveles/Nivel_D.js';
import BossJ from './Scenes/Juego/BossesLevels/BossJ.js';
import BossHTest from './Scenes/Juego/BossesLevels/BossH.js';
import BossHades from './Scenes/Juego/BossesLevels/BossHades.js';

/**
 * Inicio del juego en Phaser. Creamos el archivo de configuración del juego y creamos
 * la clase Game de Phaser, encargada de crear e iniciar el juego.
 */
let config = {
	type: Phaser.AUTO,
	pixelArt: true,
	snapToPixels: true,
	parent: 'game',
	fps: 300,
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		mode: Phaser.Scale.FIT,
		fullscreenTarget: 'game'
	},
	scene:[PreloadScene, MainMenu, MapScene, Nivel_R, Nivel_TO, Nivel_D, BossJ, BossHTest, BossHades],	// Decimos a Phaser cual es nuestra escena
	physics: { 
		default: 'matter', 
		matter: { 
			gravity: { y: 1}, 
			debug: true
		} 
	},
};

new Phaser.Game(config);