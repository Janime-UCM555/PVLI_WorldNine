// Archivo: src/web.js
// Funciones para actualizar la interfaz web desde Phaser

import { purpleCoinsByLevel } from "./Scenes/Juego/GameScenes.js";

/**
 * Mapa del progreso de monedas moradas por nivel.
 *
 * La clave suele coincidir con el nombre de la escena (p.ej. "Nivel_R", "Nivel_D"...)
 * y el valor es el número de monedas moradas recogidas en ese nivel.
 *
 * @typedef {Object<string, number>} PurpleCoinsByLevel
 */

/**
 * Información de un nivel/escena para mostrar en la UI.
 *
 * @typedef {Object} LevelInfo
 * @property {string} label - Nombre visible del nivel o jefe.
 * @property {string} myth - Nombre de la mitología asociada (Roma, Egipto, Grecia, etc.).
 * @property {string} mythClass - Clase CSS que se aplicará al punto de mitología.
 * @property {string} description - Texto descriptivo que se muestra en la interfaz.
 */

/**
 * Mapa entre la clave de la escena de Phaser y la información que se mostrará
 * en la interfaz web.
 *
 * @type {Record<string, LevelInfo>}
 */
const LEVEL_INFO = {
  Global: {
    label: "Resumen Global",
    myth: "Global",
    mythClass: "myth-dot--global",
    description:
      "Aquí están los resultados de todo lo que llevas jugado."
  },
  Nivel_R: {
    label: "Reino de Roma",
    myth: "Roma",
    mythClass: "myth-dot--roma",
    description:
      "Mario ha sido transportado a este reino misterioso. Recorre estas tierras y descubre qué lo ha llevado hasta aquí."
  },
  Nivel_D: {
    label: "Reino de Egipto",
    myth: "Egipto",
    mythClass: "myth-dot--egipto",
    description:
      "Tras enfrentarte a Júpiter, Mario descubre que debe dirigirse a Egipto para liberar a alguien que podría ayudarle. ¡Vamos corriendo!"
  },
  Nivel_G: {
    label: "Reino de Grecia",
    myth: "Grecia",
    mythClass: "myth-dot--grecia",
    description:
      "Al final resultó que Horus no conocía nada sobre Mario. Pero dice que alguien en Grecia podría ayudarle. ¡Adelante!"
  },
  BossJ: {
    label: "Jefe Júpiter – Juez Relámpago",
    myth: "Roma",
    mythClass: "myth-dot--roma",
    description:
      "Al señor de los dioses de estas tierras no le gusta que metan las narices en sus asuntos. ¡Prepárate para la batalla!"
  },
  BossH: {
    label: "Jefe Horus – Maestro del Cielo",
    myth: "Egipto",
    mythClass: "myth-dot--egipto",
    description:
      "Horus, dios del cielo, según Júpiter tiene cautivo a quien podría devolverte a casa. Si no quiere ayudarte... ¡habrá que luchar!"
  },
  BossHades: {
    label: "Boss Hades – Señor del Inframundo",
    myth: "Grecia",
    mythClass: "myth-dot--grecia",
    description:
      "Por fin encontraste a quien podría salvarte y devolverte a casa. Pero Hades no te lo pondrá nada fácil. ¡A luchar!"
  }
};

/**
 * Estado que se recibe desde Phaser para actualizar la interfaz web.
 *
 * @typedef {Object} WebStatus
 * @property {string} [sceneKey="Global"] - Clave de la escena actual (coincide con las de LEVEL_INFO).
 * @property {number} [purpleCoins=0] - Cantidad de monedas moradas recogidas en el nivel actual.
 */

/**
 * Actualiza el estado visible de la página:
 * - Nombre y descripción del nivel actual.
 * - Contador de monedas moradas.
 * - Etiqueta y punto de mitología (Roma / Egipto / Grecia / Global).
 *
 * Esta función está pensada para ser llamada desde Phaser, pasando
 * la información relevante del estado del juego.
 *
 * @param {WebStatus} status - Objeto con los datos de la escena y estadísticas a mostrar.
 */
function updateWebStatus(status) {
  const {
    sceneKey = "Global",
    purpleCoins = 0
  } = status || {};

  /** @type {LevelInfo} */
  const info = LEVEL_INFO[sceneKey] || LEVEL_INFO["Global"];

  console.log("Actualizando interfaz web:", sceneKey, purpleCoins, info);

  const mythDot    = document.getElementById("myth-dot");
  const mythLabel  = document.getElementById("myth-label");
  const lvlName    = document.getElementById("current-level-name");
  const lvlDesc    = document.getElementById("current-level-description");
  const statPurple = document.getElementById("stat-purple");

  if (mythDot && mythLabel) {
    mythDot.className = "myth-dot " + info.mythClass;
    mythLabel.textContent = info.myth;
  }
  if (lvlName) lvlName.textContent = info.label;
  if (lvlDesc) lvlDesc.textContent = info.description;

  if (statPurple) {
    // Si NO es el resumen global, mostramos contador tipo "X / 5"
    if (info.myth !== "Global") {
      statPurple.textContent = String(purpleCoins) + " / 5";
    } else {
      // En el resumen global, sumamos todas las monedas moradas de todos los niveles
      /** @type {number} */
      let coins = 0;
      for (const level in purpleCoinsByLevel) {
        if (Object.prototype.hasOwnProperty.call(purpleCoinsByLevel, level)) {
          coins += purpleCoinsByLevel[level] || 0;
        }
      }
      statPurple.textContent = String(coins || 0);
    }
  }
}

/**
 * Función expuesta globalmente para que Phaser pueda actualizar
 * la interfaz web desde cualquier escena.
 *
 * @type {(status: WebStatus) => void}
 */
window.updateWebStatus = updateWebStatus;

/**
 * Resetea la información persistida de las monedas moradas.
 *
 * Elimina del localStorage:
 * - El progreso de monedas moradas por nivel.
 * - El registro de monedas individuales recogidas.
 *
 * Tras borrar los datos, recarga la página para que la interfaz
 * y el estado del juego vuelvan a su estado inicial.
 *
 * @function
 * @returns {void}
 */
window.resetPurpleCoins = () => {
  localStorage.removeItem("w9_purpleCoinsByLevel");
  localStorage.removeItem("w9_collectedPurpleCoinsByLevel");
  location.reload();
};

/**
 * Inicializa el estado de la interfaz al cargarse el documento.
 * Muestra el resumen global por defecto.
 */
document.addEventListener("DOMContentLoaded", () => {
  updateWebStatus({
    sceneKey: "Global",
    purpleCoins: 0
  });
});
