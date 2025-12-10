// HorusColums.js (HorusTileColumn.js)

// Categorías de colisión
const CATEGORY_PLAYER  = 0x0001;
const CATEGORY_ENEMY   = 0x0002;
const CATEGORY_TERRAIN = 0x0004;

export default class HorusColumn {
    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.Tilemaps.Tilemap} map
     * @param {Phaser.Tilemaps.TilemapLayer} groundLayer
     * @param {number} xWorld      - posición X mundo donde spawnea la columna
     * @param {number} baseWorldY  - Y en mundo donde empieza la columna (suelo)
     * @param {number} tileCount   - cuántas tiles sube la columna
     * @param {number} gapTiles    - hueco en tiles
     * @param {number} gapOffset   - desplazamiento del hueco desde arriba
     * @param {string} textureKey  - key del spritesheet de la columna (preload)
     * @param {{bottom:number, middle:number, top:number}} frameConfig
     *        bottom: frame de la base, middle: tramo medio, top: parte superior
     * @param {{fromOffsetY?:number, duration?:number, ease?:string}} tweenConfig
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

        this.tiles = [];

        // Pasar de coordenada mundo X a tile X
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
                frame = frameConfig.bottom;           // parte de abajo
            } else if (i === tileCount - 1) {
                frame = frameConfig.top;              // parte de arriba
            }

            // Cuerpo por tile (físico)
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

            sprite.setOrigin(0.5, 0.5); // anclado por abajo
            sprite.setDepth(this.layer.depth + 1);

            // Tween de salida (sube hasta worldY)
            this.scene.tweens.add({
                targets: sprite,
                y: worldY,
                duration: this.tweenConfig.duration ?? 450,
                ease: this.tweenConfig.ease ?? "Back.easeOut",
            });

            // Guardar ambos como un objeto
            this.tiles.push({
                body: tileBody,
                sprite,
            });
        }
    }
}
