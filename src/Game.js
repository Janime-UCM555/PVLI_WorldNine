/**
 * @fileoverview Importaciones necesarias para el flujo de escenas del juego.
 */
import PreloadScene from './Scenes/Titulo/PreloadScene.js';
import MainMenu from './Scenes/Titulo/MainMenu.js';
import LevelSelection from './Scenes/Titulo/LevelSelection.js';
import MapScene from './Scenes/Titulo/Map.js';
import Nivel_T from './Scenes/Juego/Niveles/Nivel_T.js';
import Nivel_R from './Scenes/Juego/Niveles/Nivel_R.js';
import Nivel_TO from './Scenes/Juego/Niveles/Nivel_TO.js';
import Nivel_D from './Scenes/Juego/Niveles/Nivel_D.js';
import Nivel_G from './Scenes/Juego/Niveles/Nivel_G.js';
import BossJ from './Scenes/Juego/BossesLevels/BossJ.js';
import BossH from './Scenes/Juego/BossesLevels/BossH.js';
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
	scene:[PreloadScene, MainMenu, LevelSelection, MapScene, Nivel_T, Nivel_R, Nivel_TO, Nivel_D, BossJ, BossH, BossHades, Nivel_G],	// Decimos a Phaser cual es nuestra escena
	physics: { 
		default: 'matter', 
		matter: { 
			gravity: { y: 1}, 
			debug: false
		} 
	},
};

new Phaser.Game(config);