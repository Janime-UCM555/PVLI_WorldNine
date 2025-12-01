// BossH_Test.js
import Mario from '../../../gameObjects/Player/Mario.js';
import HorusBoss from "../../../gameObjects/BossesObjects/HorusBoss.js";
import Fin from '../../../gameObjects/LevelBlockObjects/BarraFin.js';

export default class BossH_Test extends Phaser.Scene {

    constructor() {
        super({ key: "BossH_Test" });
    }

    preload() {
        // No cargas assets aquí porque ya vienen desde tu PreloadScene.
        // Solo asegúrate de que las animaciones de Horus estén cargadas si las usas.
    }

    create() {
        // ---------------------------------------------------------
        // 🟫 SUELO SIMPLE
        // ---------------------------------------------------------
        const ground = this.add.rectangle(0, 650, 5000, 40, 0x8B4513)
            .setOrigin(0, 0);
        this.matter.add.gameObject(ground, { isStatic: true });

        // ---------------------------------------------------------
        // 🧍‍♂️ MARIO
        // ---------------------------------------------------------
        this.jugador = new Mario(this, 300, 600, "mario_run", 3.5, -3.75, true);

        // ---------------------------------------------------------
        // 🪬 HORUS (arriba)
        // ---------------------------------------------------------
        this.horus = new HorusBoss(this, 900, 300, {
            player: this.jugador,
            columnsPerWave: 3,
            attackDistance: 350, // cada 350px avanzados → oleada
            columnSpeed: -4,
            laneYPositions: [520, 560, 600],
            koopaTexture: "Koopa_walk_R",
            koopaSpeed: 30,

            onBattleEnd: () => {
                console.log("HORUS DERROTADO");
                this.transitionToMenu();
            }
        });

        this.horus.startBattle();

        // ---------------------------------------------------------
        // 🎯 BARRA FINAL (para terminar el nivel)
        // ---------------------------------------------------------
        this.meta = new Fin(
            this,
            4500,  // X final de la prueba
            600,
            "barra_tileset",
            0,
            600,
            80
        );

        // ---------------------------------------------------------
        // 🎥 CÁMARA
        // ---------------------------------------------------------
        this.cameras.main.startFollow(this.jugador, true, 0.1, 0.1);
        this.cameras.main.setZoom(1.65);
        this.cameras.main.setBounds(0, 0, 5000, 720);

        // ---------------------------------------------------------
        // 🧱 LÍMITES DEL MUNDO
        // ---------------------------------------------------------
        this.matter.world.setBounds(0, 0, 5000, 720);

        // ---------------------------------------------------------
        // 🔗 COLISIONES
        // ---------------------------------------------------------
        this.matter.world.on("collisionstart", (event) => {

            for (const pair of event.pairs) {
                const A = pair.bodyA.gameObject;
                const B = pair.bodyB.gameObject;

                // Mario toca la meta → ganar
                if ((A === this.jugador && B === this.meta) ||
                    (B === this.jugador && A === this.meta)) {

                    console.log("META ALCANZADA");
                    this.jugador.win();

                    // Derrotar a Horus
                    if (this.horus) this.horus.defeat();

                    this.time.delayedCall(1500, () => {
                        this.transitionToMenu();
                    });

                }
            }
        });
    }

    update(time, delta) {
        if (this.jugador) this.jugador.update(time, delta);
        if (this.horus) this.horus.update(time, delta);
    }

    // ---------------------------------------------------------
    // 🔄 TRANSICIÓN FINAL
    // ---------------------------------------------------------
    transitionToMenu() {
        this.scene.start("MainMenu");
    }
}
