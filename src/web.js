// Archivo: src/web.js
// Funciones para actualizar la interfaz web desde Phaser

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
  // Ojo: antes esta entrada también se llamaba BossJ, sobrescribiendo a la anterior.
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
 * @property {string} [sceneKey="Nivel_R"] - Clave de la escena actual (coincide con las de LEVEL_INFO).
 * @property {number} [purpleCoins=0] - Cantidad de monedas moradas recogidas.
 */

/**
 * Actualiza el estado visible de la página:
 * - Nombre y descripción del nivel actual.
 * - Contador de monedas moradas.
 * - Etiqueta y punto de mitología (Roma / Egipto / Grecia).
 *
 * Esta función está pensada para ser llamada desde Phaser, pasando
 * la información relevante del estado del juego.
 *
 * @param {WebStatus} status - Objeto con los datos de la escena y estadísticas a mostrar.
 */
function updateWebStatus(status) {
  const {
    sceneKey = "Nivel_R",
    purpleCoins = 0
  } = status || {};

  const info = LEVEL_INFO[sceneKey];

  if (!info) {
    // Si la clave no existe en LEVEL_INFO, no hacemos nada para evitar errores.
    return;
  }

  const mythDot    = document.getElementById("myth-dot");
  const mythLabel  = document.getElementById("myth-label");
  const lvlName    = document.getElementById("current-level-name");
  const lvlDesc    = document.getElementById("current-level-description");
  const statPurple = document.getElementById("stat-purple");

  if (mythDot && mythLabel) {
    mythDot.className = "myth-dot " + info.mythClass;
    mythLabel.textContent = info.myth;
  }
  if (lvlName)   lvlName.textContent = info.label;
  if (lvlDesc)   lvlDesc.textContent = info.description;
  if (statPurple) statPurple.textContent = String(purpleCoins);
}

// La exponemos en window para que Phaser pueda usarla
// @type {(status: WebStatus) => void}
window.updateWebStatus = updateWebStatus;
