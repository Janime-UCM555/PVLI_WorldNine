/**
 * Importación de la clase para los botones
 * @module gameObjects/UI/Button
 */
import Button from '../../gameObjects/UI/Button.js'

/**
 * Importación de la clase para las transiciones
 * @module gameObjects/UI/Transition
 */
import TransitionCode from '../../gameObjects/UI/Transition.js'

/**
 * Importación de la clase con la información del progreso
 * @module gameObjects/UI/SaveManager
 */
import saveManager from '../../gameObjects/UI/SaveManager.js'

/**
 * Escena de selección de niveles del juego.
 * Maneja la interfaz de selección de mundos, niveles y jefes con sistema de desbloqueo progresivo.
 * @extends Phaser.Scene
 */
class LevelSelection extends Phaser.Scene
{
    /**
     * Constructor de la escena LevelSelection
     */
    constructor(){
        super({key:'LevelSelection'});
    }

    /**
     * Inicializa la escena con datos de progreso.
     * Configura mundos, botones y estado inicial del panel.
     */
    init(){
        this.levelButtons = [];
        this.panelOpen = false;
        this.tutorialName = saveManager.tutorial;
        
        // Definir los mundos con su nivel y jefe
        this.worlds = [
            { 
                key: 'world1',
                name: 'ROMA', 
                levelKey: 'Nivel_R',
                bossKey: 'BossJ',
                unlocked: saveManager.isLevelUnlocked('Nivel_R'), // Se desbloquea al completar Nivel_T
                color: '#87ceebff'
            },
            { 
                key: 'world2',
                name: 'EGIPTO', 
                levelKey: 'Nivel_D',
                bossKey: 'BossH',
                unlocked: saveManager.isLevelUnlocked('Nivel_D'), // Se desbloquea al completar BossJ
                color: '#ffd700ff'
            },
            { 
                key: 'world3',
                name: 'GRECIA', 
                levelKey: 'Nivel_G',
                bossKey: 'BossHades',
                unlocked: saveManager.isLevelUnlocked('Nivel_G'), // Se desbloquea al completar BossH
                color: '#da4c3cff'
            }
        ];

        // Mapa para almacenar botones por nivel
        this.levelButtonsMap = new Map();
    }

    /**
     * Precarga los recursos necesarios para la escena
     */
    preload(){
        this.load.image('level_selection', 'assets/GameSprites/Precarga/level_selection.png');
        this.load.image('lock', 'assets/GameSprites/Precarga/lock.png');
    }

    /**
     * Crea y muestra todos los elementos de la interfaz de selección de niveles.
     * Configura fondo, música, botones de mundos y panel de información.
     */
    create(){
        if (window.updateWebStatus) {
            window.updateWebStatus({
            sceneKey: this.level, 
            purpleCoins: this.purpleCoinScore ?? 0
        });
        }

        // Música de fondo
        if (!this.menuMusic || !this.menuMusic.isPlaying) {
            this.menuMusic = this.sound.add('menu_music', { loop: true, volume: 1 });
            this.menuMusic.play();
        }

        // Fondo de selección de niveles
        const bg = this.add.image(0, 0, 'level_selection').setOrigin(0, 0);
        bg.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Crear UI
        this.createUI();
        
        // Centro para la transición de entrada
        const screenCenter = {
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2
        };
        
        // Ajustes de la transición de entrada
        TransitionCode.invoke(
            this, 
            this.cameras.main, 
            1000,
            screenCenter,
            0,
            this.cameras.main.width,
            () => {},
            false // Iris in (círculo que crece para revelar, no para ocultar)
        );
    }

    /**
     * Crea la interfaz de usuario principal.
     * Genera botones de mundos, panel y elementos informativos.
     */
    createUI() {
        // Calcular dimensiones de cada zona (3 partes iguales)
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        const zoneWidth = screenWidth / 3;
        
        // Crear botones para cada mundo
        this.worlds.forEach((world, index) => {
            // Calcular posición X en el centro de cada zona
            const x = (index * zoneWidth) + (zoneWidth / 2);
            
            // Posición Y (centro de cada zona)
            const y = screenHeight * 0.5;
            
            // Verificar si el mundo está desbloqueado
            const isUnlocked = world.unlocked;
            
            // Crear botón circular
            const button = this.add.circle(x, y, 70, isUnlocked ? 0x0000ff : 0x666666, 1);
            button.setStrokeStyle(5, isUnlocked ? 0xffffff : 0x888888);

            // Texto del mundo
            const textColor = isUnlocked ? '#ffffff' : '#888888';
            const text = this.add.text(x, y + 100, world.name, {
                fontFamily: 'chlorinap',
                fontSize: '28px',
                color: textColor,
                stroke: '#000000',
                strokeThickness: 4,
                align: 'center',
                fontStyle: 'bold'
            }).setOrigin(0.5);
            
            // Si no está desbloqueado, agregar candado y requisito
            if (!isUnlocked) {
                const lock = this.add.image(x, y, 'lock')
                    .setOrigin(0.5)
                    .setScale(3)
                    .setDepth(1);
                
                // Mostrar requisito de desbloqueo
                let requirementText = '';
                const progression = saveManager.getCurrentProgression();
                
                switch(world.key) {
                    case 'world1':
                        requirementText = 'Completa el tutorial';
                        break;
                    case 'world2':
                        requirementText = 'Derrota a Júpiter';
                        break;
                    case 'world3':
                        requirementText = 'Derrota a Horus';
                        break;
                }
                
                const requirement = this.add.text(x, y + 130, requirementText, {
                    fontFamily: 'chlorinap',
                    fontSize: '16px',
                    color: '#ff1c1cff',
                    align: 'center',
                    lineSpacing: 5
                }).setOrigin(0.5);
                
                // No hacer el botón interactivo
                button.setInteractive({ useHandCursor: false });
            } else {
                // Hacer interactivo solo si está desbloqueado
                button.setInteractive({ useHandCursor: true });
            
                // Guardar las funciones de hover para restaurarlas después
                const hoverEffect = () => {
                    button.fillColor = 0x4444ff;
                    button.setScale(1.1);
                    text.setScale(1.1);
                };
            
                const hoverOutEffect = () => {
                    button.fillColor = 0x0000ff;
                    button.setScale(1);
                    text.setScale(1);
                };
            
                const clickAction = () => {
                    if (!this.panelOpen) {
                        this.openWorldPanel(world);
                    }
                };
            
                button.on('pointerover', hoverEffect);
                button.on('pointerout', hoverOutEffect);
                button.on('pointerdown', clickAction);
            
                // Guardar referencias para restaurarlas después
                button.hoverEffect = hoverEffect;
                button.hoverOutEffect = hoverOutEffect;
                button.clickAction = clickAction;
            }
            
            // Almacenar referencia al mundo
            button.world = world;
            
            this.levelButtons.push({ button, text });
        });

        // Botón para jugar el tutorial
        this.tutorialButton = new Button(
            this,
            this.cameras.main.width - 130,
            50,
            'Tutorial',
            () => this.playTutorial(),
            0x387999,
            0x285f7a,
            0xffffff
        )
        
        // Botón para volver al menú principal
        this.backButton = new Button(
            this,
            130,
            50,
            'Volver',
            () => this.returnToMainMenu(),
            0x387999,
            0x285f7a,
            0xffffff
        );

        // Crear panel del mundo (inicialmente oculto)
        this.createWorldPanel();

        // Crear botones de nivel
        this.createLevelButtons();
        
        // Información sobre progreso
        this.createProgressionInfo();
    }

    /**
     * Crea y muestra información sobre el progreso del jugador
     */
    createProgressionInfo() {
        // Agregar texto informativo sobre progreso
        const progression = saveManager.getCurrentProgression();
        
        const infoText = this.add.text(
            this.cameras.main.width / 2,
            80,
            `Progreso: ${progression.currentStage} de ${progression.totalStages}`,
            {
                fontFamily: 'chlorinap',
                fontSize: '22px',
                color: '#ffff00',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 3
            }
        ).setOrigin(0.5);
        
        // Texto del siguiente desbloqueo
        const nextInfo = this.add.text(
            this.cameras.main.width / 2,
            110,
            progression.displayText,
            {
                fontFamily: 'chlorinap',
                fontSize: '18px',
                color: progression.nextToUnlock ? '#88ff88' : '#ffff00',
                align: 'center',
                stroke: '#000000',
                strokeThickness: 2
            }
        ).setOrigin(0.5);
    }

    /**
     * Crea el panel de información de mundo (inicialmente oculto).
     * Genera panel modal con detalles de nivel y jefe del mundo seleccionado.
     */
    createWorldPanel() {
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // Fondo semitransparente
        this.panelBackground = this.add.rectangle(0, 0, screenWidth, screenHeight, 0x000000, 0.7)
            .setOrigin(0, 0)
            .setDepth(100)
            .setVisible(false);
        
        // Panel principal
        const panelWidth = screenWidth * 0.7;
        const panelHeight = screenHeight * 0.6;
        const panelX = (screenWidth - panelWidth) / 2;
        const panelY = (screenHeight - panelHeight) / 2;
        
        this.panel = this.add.rectangle(panelX, panelY, panelWidth, panelHeight, 0xffffff)
            .setOrigin(0, 0)
            .setDepth(101)
            .setStrokeStyle(4, 0x000000)
            .setVisible(false);
        
        // Título del panel
        this.panelTitle = this.add.text(panelX + panelWidth / 2, panelY + 30, '', {
            fontFamily: 'chlorinap',
            fontSize: '36px',
            stroke: '#000000',
            strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(102).setVisible(false);
        
        // Información del nivel
        const infoY = panelY + 100;
        
        this.levelInfo = this.add.text(panelX + panelWidth / 2, infoY, 'Nivel', {
            fontFamily: 'chlorinap',
            fontSize: '24px',
            color: '#003264ff',
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(102).setVisible(false);
        
        this.levelStats = this.add.text(panelX + panelWidth / 2, infoY + 25, '', {
            fontFamily: 'chlorinap',
            fontSize: '20px',
            color: '#0066cc',
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(102).setVisible(false);
        
        // Información del jefe
        this.bossInfo = this.add.text(panelX + panelWidth / 2, infoY + 120, 'Jefe', {
            fontFamily: 'chlorinap',
            fontSize: '24px',
            color: '#690000ff',
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(102).setVisible(false);
        
        this.bossStats = this.add.text(panelX + panelWidth / 2, infoY + 145, '', {
            fontFamily: 'chlorinap',
            fontSize: '20px',
            color: '#ff2020ff',
            align: 'center'
        }).setOrigin(0.5, 0).setDepth(102).setVisible(false);

        // Botón para cerrar el panel
        this.closePanelButton = this.add.text(panelX + panelWidth - 35, panelY + 35, 'X', {
            fontFamily: 'chlorinap',
            fontSize: '32px',
            color: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        })
        .setOrigin(0.5, 0.5)
        .setDepth(102)
        .setVisible(false)
        .setInteractive({ useHandCursor: true });
        
        this.closePanelButton.on('pointerover', () => {
            this.closePanelButton.setScale(1.2);
        });
        
        this.closePanelButton.on('pointerout', () => {
            this.closePanelButton.setScale(1);
        });
        
        this.closePanelButton.on('pointerdown', () => {
            this.closeWorldPanel();
        });

        // Contenedor para los botones de nivel
        this.levelButtonsContainer = this.add.container(0, 0).setDepth(103).setVisible(false);
    }

    /**
     * Crea botones para todos los niveles del juego.
     * Inicializa botones de niveles y los organiza en un contenedor.
     */
    createLevelButtons() {
        // Definir todos los niveles del juego
        const allLevels = [
            { key: 'Nivel_T', name: 'Tutorial', color: 0x00ff00, isBoss: false },
            { key: 'Nivel_R', name: 'Roma', color: 0x387999, isBoss: false },
            { key: 'BossJ', name: 'Júpiter', color: 0xff0000, isBoss: true },
            { key: 'Nivel_D', name: 'Egipto', color: 0xffd700, isBoss: false },
            { key: 'BossH', name: 'Horus', color: 0xff4500, isBoss: true },
            { key: 'Nivel_G', name: 'Grecia', color: 0xda4c3c, isBoss: false },
            { key: 'BossHades', name: 'Hades', color: 0x8b0000, isBoss: true }
        ];

        // Crear un botón para cada nivel
        allLevels.forEach(level => {
            const isUnlocked = this.checkIfLevelUnlocked(level.key);
            
            // Crear botón con posición inicial fuera de pantalla
            const button = new Button(
                this,
                -200, // Posición inicial fuera de pantalla
                -200,
                level.name,
                () => this.startScene(level.key),
                isUnlocked ? level.color : 0x666666,
                isUnlocked ? this.lightenColor(level.color) : 0x888888,
                0xffffff
            );
            
            // Si no está desbloqueado, desactivar interacción
            if (!isUnlocked) {
                button.disableInteractive();
                
                // Agregar icono de candado
                const lockIcon = this.add.image(-200, -200, 'lock')
                    .setScale(0.5)
                    .setDepth(104);
                button.lockIcon = lockIcon;
                this.levelButtonsContainer.add(lockIcon);
            }
            
            // Configurar para que no sea visible inicialmente
            button.setVisible(false);
            button.setActive(false);
            
            // Agregar al contenedor y al mapa
            this.levelButtonsContainer.add(button);
            this.levelButtonsMap.set(level.key, {
                button: button,
                isBoss: level.isBoss,
                color: level.color
            });
        });
    }

    /**
     * Verifica si un nivel está desbloqueado según el progreso guardado
     * @param {string} levelKey - Clave identificadora del nivel
     * @returns {boolean} True si el nivel está desbloqueado, false en caso contrario
     */
    checkIfLevelUnlocked(levelKey) {
        if (levelKey === 'Nivel_T') return true; // Tutorial siempre disponible
        
        // Verificar desbloqueo basado en progreso
        const unlockOrder = {
            'Nivel_R': ['Nivel_T'],
            'BossJ': ['Nivel_R'],
            'Nivel_D': ['BossJ'],
            'BossH': ['Nivel_D'],
            'Nivel_G': ['BossH'],
            'BossHades': ['Nivel_G']
        };
        
        if (unlockOrder[levelKey]) {
            return unlockOrder[levelKey].some(requiredLevel => 
                saveManager.getLevelData(requiredLevel)?.completed
            );
        }
        
        return false;
    }

    /**
     * Aclara un color hexadecimal sumando un valor a cada componente RGB
     * @param {number} color - Color en formato hexadecimal (0xRRGGBB)
     * @returns {number} Color aclarado en formato hexadecimal
     */
    lightenColor(color) {
        const r = Math.min(255, ((color >> 16) & 0xFF) + 40);
        const g = Math.min(255, ((color >> 8) & 0xFF) + 40);
        const b = Math.min(255, (color & 0xFF) + 40);
        return (r << 16) | (g << 8) | b;
    }

    /**
     * Abre el panel de información de un mundo específico
     * @param {Object} world - Datos del mundo seleccionado
     */
    openWorldPanel(world) {
        this.panelOpen = true;
        this.selectedWorld = world;
        
        const color = world.color;
        
        this.levelButtons.forEach(item => {
            // Restaurar apariencia visual original
            if (item.button.world.unlocked) {
                item.button.fillColor = 0x0000ff;
                item.button.setStrokeStyle(5, 0xffffff);
            } else {
                item.button.fillColor = 0x666666;
                item.button.setStrokeStyle(5, 0x888888);
            }
        
            // Asegurar que la escala sea 1
            item.button.setScale(1);
            item.text.setScale(1);

            // Deshabilitar la interactividad
            item.button.disableInteractive();
        
            // También deshabilitar los eventos hover
            item.button.removeAllListeners('pointerover');
            item.button.removeAllListeners('pointerout');
            item.button.removeAllListeners('pointerdown');
        });

        // Deshabilitar el botón de Volver
        this.backButton.disableInteractive();

        // Deshabilitar el botón del tutorial
        this.tutorialButton.disableInteractive();

        // Obtener datos del nivel y jefe
        const levelData = saveManager.getLevelData(world.levelKey);
        const bossData = saveManager.getLevelData(world.bossKey);

        // Obtener nombres descriptivos
        const levelDisplayName = this.getLevelDisplayName(world.levelKey);
        const bossDisplayName = this.getLevelDisplayName(world.bossKey);
        
        // Actualizar información del panel
        this.panelTitle.setText(world.name);
        this.panelTitle.setColor(color);
        
        // Información del nivel
        const levelCompleted = levelData.completed ? 'Completado' : 'No completado';
        const levelScore = `Puntos: ${levelData.highScore.toLocaleString()}`;
        const levelCoins = `Monedas moradas: ${levelData.purpleCoins}/5`;
        
        // Crear texto formateado para el nivel
        let levelText = `${levelDisplayName}\n`;
        levelText += `${levelCompleted}\n`;
        levelText += `${levelScore}\n`;
        levelText += `${levelCoins}`;

        this.levelStats.setText(levelText);
        
        // Información del jefe
        const bossUnlocked = saveManager.isLevelUnlocked(world.bossKey);
        const bossCompleted = bossData.completed ? 'Completado' : 'No completado';
        const bossScore = `Puntos: ${bossData.highScore.toLocaleString()}`;
        
        if (bossUnlocked) {
            // Crear texto formateado para el jefe
            let bossText = `${bossDisplayName}\n`;
            bossText += `${bossCompleted}\n`;
            bossText += `${bossScore}`;
            this.bossStats.setText(bossText);
            this.bossInfo.setColor('#990000');
        } else {
            // Mostrar requisito para desbloquear el jefe
            let requirement = '';
            switch(world.key) {
                case 'world1':
                    requirement = 'Requiere completar Roma';
                    break;
                case 'world2':
                    requirement = 'Requiere completar Egipto';
                    break;
                case 'world3':
                    requirement = 'Requiere completar Grecia';
                    break;
            }
            
            let bossText = `${bossDisplayName}\n`;
            bossText += `Bloqueado\n`;
            bossText += `${requirement}`;
            this.bossStats.setText(bossText);
            this.bossInfo.setColor('#990000');
        }
        
        // Mostrar panel
        this.panelBackground.setVisible(true);
        this.panel.setVisible(true);
        this.panelTitle.setVisible(true);
        this.levelInfo.setVisible(true);
        this.levelStats.setVisible(true);
        this.bossInfo.setVisible(true);
        this.bossStats.setVisible(true);
        this.closePanelButton.setVisible(true);
        this.closePanelButton.setInteractive({ useHandCursor: true });
    
        // Mostrar botones de niveles para este mundo
        this.showWorldLevelButtons(world);
    }

    /**
     * Muestra los botones de nivel y jefe correspondientes al mundo seleccionado
     * @param {Object} world - Datos del mundo seleccionado
     */
    showWorldLevelButtons(world) {
        // Mostrar el contenedor de botones
        this.levelButtonsContainer.setVisible(true);
        
        // Obtener niveles de este mundo
        let levelKeys = [];
        
        switch(world.key) {
            case 'world1':
                levelKeys = ['Nivel_R', 'BossJ'];
                break;
            case 'world2':
                levelKeys = ['Nivel_D', 'BossH'];
                break;
            case 'world3':
                levelKeys = ['Nivel_G', 'BossHades'];
                break;
        }
        
        // Calcular posiciones para los botones
        const panelX = (this.cameras.main.width - (this.cameras.main.width * 0.7)) / 2;
        const panelY = (this.cameras.main.height - (this.cameras.main.height * 0.6)) / 2;
        const panelHeight = this.cameras.main.height * 0.6;
        
        // Posicion para el botón de nivel (izquierda)
        const levelButtonX = panelX + 150;
        const levelButtonY = panelY + panelHeight - 75;
        
        // Posicion para el botón de jefe (derecha)
        const bossButtonX = panelX + (this.cameras.main.width * 0.7) - 150;
        const bossButtonY = panelY + panelHeight - 75;
        
        // Ocultar todos los botones primero
        this.levelButtonsMap.forEach((data, key) => {
            const button = data.button;
            button.setVisible(false);
            button.setActive(false);
            button.x = -200;
            button.y = -200;
            
            if (button.lockIcon) {
                button.lockIcon.setVisible(false);
                button.lockIcon.x = -200;
                button.lockIcon.y = -200;
            }
        });
        
        // Mostrar y posicionar botones del mundo actual
        levelKeys.forEach((key, index) => {
            const levelData = this.levelButtonsMap.get(key);
            if (levelData) {
                const button = levelData.button;
                const isUnlocked = this.checkIfLevelUnlocked(key);
                
                // Posicionar el botón
                if (levelData.isBoss) {
                    button.x = bossButtonX;
                    button.y = bossButtonY;
                    if (button.lockIcon) {
                        button.lockIcon.x = bossButtonX;
                        button.lockIcon.y = bossButtonY;
                    }
                } else {
                    button.x = levelButtonX;
                    button.y = levelButtonY;
                    if (button.lockIcon) {
                        button.lockIcon.x = levelButtonX;
                        button.lockIcon.y = levelButtonY;
                    }
                }
                
                // Actualizar estado de desbloqueo
                if (isUnlocked) {
                    button.setInteractive({ useHandCursor: true });
                    button.drawBackground(levelData.color);
                    button.defaultColor = levelData.color;
                    button.selectionColor = this.lightenColor(levelData.color);
                    if (button.lockIcon) {
                        button.lockIcon.setVisible(false);
                    }
                } else {
                    button.disableInteractive();
                    button.drawBackground(0x666666);
                    button.defaultColor = 0x666666;
                    button.selectionColor = 0x888888;
                    if (button.lockIcon) {
                        button.lockIcon.setVisible(true);
                    }
                }
                
                // Mostrar el botón
                button.setVisible(true);
                button.setActive(true);
            }
        });
    }

    /**
     * Cierra el panel de información del mundo.
     * Restaura la interactividad de los botones principales.
     */
    closeWorldPanel() {
        this.panelOpen = false;
        
        // Restaurar la interactividad y opacidad de los botones de mundo
        this.levelButtons.forEach(item => {
            if (item.button.world.unlocked) {
                // Restaurar interactividad solo si el mundo está desbloqueado
                item.button.setInteractive({ useHandCursor: true });
            
                // Restaurar eventos hover
                const hoverEffect = () => {
                    item.button.fillColor = 0x4444ff;
                    item.button.setScale(1.1);
                    item.text.setScale(1.1);
                };
            
                const hoverOutEffect = () => {
                    item.button.fillColor = 0x0000ff;
                    item.button.setScale(1);
                    item.text.setScale(1);
                };
            
                const clickAction = () => {
                    if (!this.panelOpen) {
                        this.openWorldPanel(item.button.world);
                    }
                };
            
                item.button.on('pointerover', hoverEffect);
                item.button.on('pointerout', hoverOutEffect);
                item.button.on('pointerdown', clickAction);
            }
        
            // Restaurar apariencia visual
            if (item.button.world.unlocked) {
                item.button.fillColor = 0x0000ff;
                item.button.setStrokeStyle(5, 0xffffff);
            } else {
                item.button.fillColor = 0x666666;
                item.button.setStrokeStyle(5, 0x888888);
            }
        });

        // Restaurar el botón de volver
        this.backButton.setInteractive({ useHandCursor: true });
    
        // Restaurar el botón de tutorial
        this.tutorialButton.setInteractive({ useHandCursor: true });
        
        // Ocultar todos los botones de nivel
        this.levelButtonsMap.forEach((data, key) => {
            const button = data.button;
            button.setVisible(false);
            button.setActive(false);
            button.x = -200;
            button.y = -200;
        
            if (button.lockIcon) {
                button.lockIcon.setVisible(false);
                button.lockIcon.x = -200;
                button.lockIcon.y = -200;
            }
        });
        this.levelButtonsContainer.setVisible(false);
    
        // Ocultar panel
        this.panelBackground.setVisible(false);
        this.panel.setVisible(false);
        this.panelTitle.setVisible(false);
        this.levelInfo.setVisible(false);
        this.levelStats.setVisible(false);
        this.bossInfo.setVisible(false);
        this.bossStats.setVisible(false);
        this.closePanelButton.setInteractive({ useHandCursor: false });
        this.closePanelButton.setVisible(false);
    }

    /**
     * Inicia la escena del tutorial
     */
    playTutorial() {
        this.startScene(this.tutorialName);
    }

    /**
     * Inicia el nivel del mundo seleccionado
     */
    playLevel() {
        if (this.selectedWorld) {
            this.startScene(this.selectedWorld.levelKey);
        }
    }

    /**
     * Inicia el jefe del mundo seleccionado
     */
    playBossLevel() {
        if (this.selectedWorld) {
            this.startScene(this.selectedWorld.bossKey);
        }
    }

    /**
     * Inicia una escena específica con transición
     * @param {string} sceneKey - Clave de la escena a iniciar
     */
    startScene(sceneKey) {
        // Ocultar todos los botones de nivel antes de la transición
        this.levelButtonsMap.forEach((data, key) => {
            const button = data.button;
            button.setVisible(false);
            button.setActive(false);
        });
        this.levelButtonsContainer.setVisible(false);

        // Detener música
        if (this.menuMusic && this.menuMusic.isPlaying) {
            this.menuMusic.stop();
        }

        // Cerrar panel si está abierto
        if (this.panelOpen) {
            this.closeWorldPanel();
        }
        
        // Transición a la escena seleccionada
        TransitionCode.invoke(
            this, 
            this.cameras.main, 
            1000,
            { x: this.cameras.main.width / 2, y: this.cameras.main.height / 2 },
            this.cameras.main.width,
            0,
            () => {
                this.scene.launch(sceneKey);
                this.scene.stop();
            }
        );
    }
    
    /**
     * Regresa al menú principal con transición
     */
    returnToMainMenu() {
        // Ocultar todos los botones de nivel
        this.levelButtonsMap.forEach((data, key) => {
            const button = data.button;
            button.setVisible(false);
            button.setActive(false);
        });
        this.levelButtonsContainer.setVisible(false);

        // Detener música
        if (this.menuMusic && this.menuMusic.isPlaying) {
            this.menuMusic.stop();
        }

        // Transición de vuelta al menú principal
        TransitionCode.invoke(
            this, 
            this.cameras.main, 
            1000,
            { x: this.cameras.main.width / 2, y: this.cameras.main.height / 2 },
            this.cameras.main.width,
            0,
            () => {
                this.scene.launch('MainMenu');
                this.scene.stop();
            }
        );
    }

    /**
     * Obtiene el nombre legible para mostrar de un nivel
     * @param {string} levelKey - Clave identificadora del nivel
     * @returns {string} Nombre para mostrar del nivel
     */
    getLevelDisplayName(levelKey) {
        const displayNames = {
            'Nivel_R': 'Roma',
            'BossJ': 'Júpiter',
            'Nivel_D': 'Egipto',
            'BossH': 'Horus',
            'Nivel_G': 'Grecia',
            'BossHades': 'Hades'
        };
    
        return displayNames[levelKey] || levelKey;
    }
}
export default LevelSelection;