import Button from '../../gameObjects/UI/Button.js'
import TransitionCode from '../../gameObjects/UI/Transition.js'
import saveManager from '../../gameObjects/UI/SaveManager.js'

class LevelSelection extends Phaser.Scene
{
    constructor(){
        super({key:'LevelSelection'});
    }

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
    }

    preload(){
        this.load.image('level_selection', 'assets/GameSprites/Precarga/level_selection.png');
        this.load.image('lock', 'assets/GameSprites/Precarga/lock.png');
    }

    create(){
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
                
                // Efectos hover solo para desbloqueados
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
                
                button.on('pointerover', hoverEffect);
                
                button.on('pointerout', hoverOutEffect);
                
                // Acción al hacer clic solo para desbloqueados
                const clickAction = () => {
                    if (!this.panelOpen) {
                        this.openWorldPanel(world);
                    }
                };
                
                button.on('pointerdown', clickAction);
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
        
        // Información sobre progreso
        this.createProgressionInfo();
    }

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
        
        // Botones dentro del panel
        const buttonY = panelY + panelHeight - 75;
        const buttonSpacing = 180;
        
        // Botón para jugar el nivel
        this.playLevelButton = new Button(
            this,
            panelX + panelWidth / 2 - buttonSpacing,
            buttonY,
            'Nivel',
            () => this.playLevel(),
            0x0000ff, // Azul
            0x4444ff, // Azul claro al hover
            0xffffff // Texto blanco
        );
        this.playLevelButton.setDepth(102).setVisible(false);
        
        // Botón para jugar el jefe
        this.playBossButton = new Button(
            this,
            panelX + panelWidth / 2 + buttonSpacing,
            buttonY,
            'Jefe',
            () => this.playBossLevel(),
            0xcc0000, // Rojo
            0xff3300, // Rojo claro al hover
            0xffffff // Texto blanco
        );
        this.playBossButton.setDepth(102).setVisible(false);
        
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
    }

    openWorldPanel(world) {
        this.panelOpen = true;
        this.selectedWorld = world;
        
        const color = world.color;
        
        // Restaurar visualmente todos los botones a su estado normal
        this.levelButtons.forEach(item => {
            const button = item.button;
            const text = item.text;
        
            // Restaurar propiedades visuales
            if (button.world.unlocked) {
                button.fillColor = 0x0000ff; // Azul original
                button.setStrokeStyle(5, 0xffffff); // Borde blanco original
            } else {
                button.fillColor = 0x666666; // Gris original
                button.setStrokeStyle(5, 0x888888); // Borde gris original
            }
        
            // Restaurar escala
            button.setScale(1);
            text.setScale(1);
        
            // Deshabilitar interacción
            if (button.world.unlocked) {
                button.disableInteractive();
            }
        });

        this.backButton.disableInteractive();

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
        this.playLevelButton.setVisible(true);
        this.playBossButton.setVisible(true);
        this.closePanelButton.setVisible(true);
        
        // Configurar botón del nivel (siempre activo porque el mundo está desbloqueado)
        this.playLevelButton.label.setText(levelDisplayName);
        this.playLevelButton.setInteractive({ useHandCursor: true });
        this.playLevelButton.on('pointerdown', () => this.startScene(world.levelKey));
        
        // Configurar botón del jefe (solo activo si está desbloqueado)
        if (bossUnlocked) {
            this.playBossButton.label.setText(bossDisplayName);
            this.playBossButton.setInteractive({ useHandCursor: true });
            this.playBossButton.on('pointerdown', () => this.startScene(world.bossKey));

            // Color rojo para jefe
            this.playBossButton.defaultColor = 0xcc0000;
            this.playBossButton.selectionColor = 0xff3300;
            this.playBossButton.drawBackground(0xcc0000);
            this.playBossButton.label.setColor('#ffffff');
    
            // Agregar eventos de hover
            this.playBossButton.gfx.on('pointerover', () => {
                this.playBossButton.gfx.setScale(1.05);
                this.playBossButton.label.setScale(1.05);
            });
    
            this.playBossButton.gfx.on('pointerout', () => {
                this.playBossButton.gfx.setScale(1);
                this.playBossButton.label.setScale(1);
            });
    
            // Hacer lo mismo para el label
            this.playBossButton.label.on('pointerover', () => {
                this.playBossButton.gfx.setScale(1.05);
                this.playBossButton.label.setScale(1.05);
            });
    
            this.playBossButton.label.on('pointerout', () => {
                this.playBossButton.gfx.setScale(1);
                this.playBossButton.label.setScale(1);
            });
        } else {
            this.playBossButton.label.setText(`${bossDisplayName}\nBloqueado`);
            this.playBossButton.disableInteractive();

            // Color gris para bloqueado
            this.playBossButton.defaultColor = 0x666666;
            this.playBossButton.selectionColor = 0x666666;
            this.playBossButton.drawBackground(0x666666);
            this.playBossButton.label.setColor('#ffffffff');

            // Eliminar eventos de hover si existen
            this.playBossButton.gfx.off('pointerover');
            this.playBossButton.gfx.off('pointerout');
            this.playBossButton.label.off('pointerover');
            this.playBossButton.label.off('pointerout');
        }
    }

    closeWorldPanel() {
        this.panelOpen = false;
        
        // Habilitar interacción con los botones del fondo
        this.levelButtons.forEach(item => {
            if (item.button.world.unlocked) {
                item.button.setInteractive({ useHandCursor: true });
            }
        });
        this.backButton.setInteractive({ useHandCursor: true });
        
        // Ocultar panel
        this.panelBackground.setVisible(false);
        this.panel.setVisible(false);
        this.panelTitle.setVisible(false);
        this.levelInfo.setVisible(false);
        this.levelStats.setVisible(false);
        this.bossInfo.setVisible(false);
        this.bossStats.setVisible(false);
        this.playLevelButton.setVisible(false);
        this.playBossButton.setVisible(false);
        this.closePanelButton.setVisible(false);
    }

    playTutorial() {
        this.startScene(this.tutorialName);
    }

    playLevel() {
        this.startScene(this.selectedWorld.levelKey);
    }

    playBossLevel() {
        this.startScene(this.selectedWorld.bossKey);
    }

    startScene(sceneKey) {
        // Detener música
        if (this.menuMusic && this.menuMusic.isPlaying) {
            this.menuMusic.stop();
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
    
    returnToMainMenu() {
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
    
    update() {
        // Lógica de actualización si es necesaria
    }
}
export default LevelSelection;