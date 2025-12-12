/**
 * Categorías de colisión para el sistema de física Matter.js
 * @constant {number}
 */
/**
 * Categorías de colisión de Matter.js
 * @module collisionCategories
 */
import {
    CATEGORY_PLAYER,
    CATEGORY_ENEMY,
    CATEGORY_TERRAIN,
} from "../../collisionCategories.js"
/**
 * Clase que representa una columna segmentada de Horus
 * Crea una columna vertical compuesta por múltiples tiles con física,
 * con un hueco configurable en el medio. La columna emerge desde abajo
 * con una animación de tween.
 */
export default class HorusColumn {
    /**
     * Constructor de la columna de Horus
     * @param {Phaser.Scene} scene - La escena de Phaser donde se crea la columna
     * @param {Phaser.Tilemaps.Tilemap} map - El tilemap del nivel
     * @param {Phaser.Tilemaps.TilemapLayer} groundLayer - Capa de terreno del tilemap
     * @param {number} xWorld - Posición X en coordenadas del mundo donde aparece la columna
     * @param {number} baseWorldY - Posición Y en el mundo donde empieza la columna (suelo/base)
     * @param {number} tileCount - Número total de tiles que componen la altura de la columna
     * @param {number} gapTiles - Cantidad de tiles que forman el hueco/gap
     * @param {number} gapOffset - Desplazamiento del hueco desde la parte superior (en tiles)
     * @param {string} textureKey - Key del spritesheet de la columna (debe estar precargado)
     * @param {Object} frameConfig - Configuración de frames del spritesheet
     * @param {number} frameConfig.bottom - Frame para la base/parte inferior de la columna
     * @param {number} frameConfig.middle - Frame para las secciones intermedias
     * @param {number} frameConfig.top - Frame para la parte superior de la columna
     * @param {Object} [tweenConfig={}] - Configuración de la animación de aparición
     * @param {number} [tweenConfig.fromOffsetY] - Offset Y inicial antes de la animación (por defecto: tileSize * 3)
     * @param {number} [tweenConfig.duration=450] - Duración de la animación en milisegundos
     * @param {string} [tweenConfig.ease='Back.easeOut'] - Tipo de easing para la animación
     * 
     * @example
     * const column = new HorusColumn(
     *   this,                    // scene
     *   this.map,                // map
     *   this.groundLayer,        // groundLayer
     *   800,                     // xWorld
     *   600,                     // baseWorldY
     *   10,                      // tileCount (10 tiles de alto)
     *   3,                       // gapTiles (3 tiles de hueco)
     *   4,                       // gapOffset (hueco empieza en tile 4 desde arriba)
     *   'horus_column_tiles',    // textureKey
     *   { bottom: 0, middle: 1, top: 2 },  // frameConfig
     *   { fromOffsetY: 96, duration: 600, ease: 'Cubic.easeOut' }  // tweenConfig
     * );
     */
    constructor(
        scene,
        map,
        groundLayer,
        xWorld,
        baseWorldY,
        tileCount,
        gapTiles,
        gapOffset,
        textureKey,
        frameConfig,
        tweenConfig = {}
    ) {
        this.scene = scene;
        this.map = map;
        this.layer = groundLayer;
        this.tileSize = map.tileHeight;

        this.textureKey = textureKey;
        this.frameConfig = frameConfig;
        this.tweenConfig = tweenConfig;

        /** 
         * Array de objetos que contienen el sprite y cuerpo físico de cada tile
         * @type {Array<{body: MatterJS.BodyType, sprite: Phaser.GameObjects.Sprite}>}
         */
        this.tiles = [];

        // Convertir coordenada mundo X a coordenada tile X
        const tileX = this.map.worldToTileX(xWorld);

        // Cuánto más abajo empieza el sprite para el tween
        const spawnOffsetY = tweenConfig.fromOffsetY ?? this.tileSize * 3;

        // Crear columna tile a tile
        for (let i = 0; i < tileCount; i++) {

            // Saltar el hueco central
            if (i >= gapOffset && i < gapOffset + gapTiles) continue;

            const worldX = this.map.tileToWorldX(tileX) + this.tileSize / 2;
            const worldY = baseWorldY - (i * this.tileSize);

            // Elegir frame según posición en la columna
            let frame = frameConfig.middle;
            if (i === 0) {
                frame = frameConfig.bottom;
            } else if (i === tileCount - 1) {
                frame = frameConfig.top;
            }

            // Cuerpo físico por tile (estático)
            const tileBody = this.scene.matter.add.rectangle(
                worldX,
                worldY,
                this.tileSize,
                this.tileSize,
                {
                    isStatic: true,
                    friction: 0,
                    frictionAir: 0,
                    restitution: 0,
                    label: "horus_tile_column",
                }
            );

            tileBody.collisionFilter.category = CATEGORY_TERRAIN;
            tileBody.collisionFilter.mask = CATEGORY_PLAYER | CATEGORY_ENEMY;

            // Sprite visual usando el spritesheet
            const sprite = this.scene.add.sprite(
                worldX,
                worldY + spawnOffsetY, // empieza más abajo para el tween
                textureKey,
                frame
            );

            sprite.setOrigin(0.5, 0.5);
            sprite.setDepth(this.layer.depth + 1);

            // Tween de salida (sube hasta worldY)
            this.scene.tweens.add({
                targets: sprite,
                y: worldY,
                duration: this.tweenConfig.duration ?? 450,
                ease: this.tweenConfig.ease ?? "Back.easeOut",
            });

            // Guardar sprite y cuerpo como un objeto
            this.tiles.push({
                body: tileBody,
                sprite,
            });
        }
    }
}