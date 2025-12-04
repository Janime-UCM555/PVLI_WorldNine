// HorusTileColumn.js
// Columna creada a partir de tiles individuales del tileset
       
        const CATEGORY_PLAYER  = 0x0001;
        const CATEGORY_ENEMY   = 0x0002;
        const CATEGORY_TERRAIN = 0x0004;

export default class HorusColumn {
    /**
     * @param {Phaser.Scene} scene
     * @param {Phaser.Tilemaps.Tilemap} map
     * @param {Phaser.Tilemaps.TilemapLayer} groundLayer
     * @param {number} xWorld      - posición X mundo donde spawnea la columna
     * @param {number} baseTileY   - tile Y del suelo donde empieza la columna
     * @param {number} tileCount   - cuántas tiles sube la columna
     * @param {number} gapTiles    - hueco en tiles
     * @param {number} gapOffset   - desplazamiento del hueco desde arriba
     * @param {number} speedX      - velocidad horizontal
     */
    constructor(scene, map, groundLayer, xWorld, baseTileY, tileCount, gapTiles, gapOffset) {
        this.scene = scene;
        this.map = map;
        this.layer = groundLayer;
        this.tileSize = map.tileHeight;

        this.tiles = [];

        const tileX = this.map.worldToTileX(xWorld);

        // Crear columna tile a tile
        for (let i = 0; i < tileCount; i++) {
            // Saltar el hueco
            if (i >= gapOffset && i < gapOffset + gapTiles) continue;

            const tY = baseTileY - (i * this.tileSize);
            const worldX = this.map.tileToWorldX(tileX) + this.tileSize / 2;
            const worldY = tY;

            // Crear cuerpo por tile
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
            tileBody.collisionFilter.mask = CATEGORY_PLAYER | CATEGORY_ENEMY; // o PLAYER | ENEMY

            // Guardar ambos como un objeto
            this.tiles.push({
                body: tileBody,
                sprite: null // puedes añadir un sprite si quieres visual
            });
        }
    }
}
