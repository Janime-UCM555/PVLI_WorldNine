class SaveManager {
    constructor() {
        this.saveKey = 'marioSaveData';
        this.defaultData = {
            levels: {
                'Nivel_T': { completed: false },
                'Nivel_R': { highScore: 0, purpleCoins: 0, completed: false },
                'Nivel_D': { highScore: 0, purpleCoins: 0, completed: false },
                'Nivel_G': { highScore: 0, purpleCoins: 0, completed: false },
                'BossJ': { highScore: 0, /*purpleCoins: 0,*/ completed: false },
                'BossHades': { highScore: 0, /*purpleCoins: 0,*/ completed: false },
                'BossH': { highScore: 0, /*purpleCoins: 0,*/ completed: false }
            },
            progress: {
                unlockedLevels: []
            }
        };
        this.load();
        this.tutorial = 'Nivel_T';
        this.bossLevels = ['BossJ', 'BossH', 'BossHades'];
    }

    load() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (savedData) {
                this.data = JSON.parse(savedData);
                // Asegurarse de que todos los niveles existan
                for (const level in this.defaultData.levels) {
                    if (!this.data.levels[level]) {
                        this.data.levels[level] = { ...this.defaultData.levels[level] };
                    }
                }
                // Asegurar que exista progress
                if (!this.data.progress) {
                    this.data.progress = { unlockedLevels: [] };
                }
            } else {
                this.data = JSON.parse(JSON.stringify(this.defaultData));
            }
        } catch (e) {
            console.error('Error loading save data:', e);
            this.data = JSON.parse(JSON.stringify(this.defaultData));
        }
    }

    save() {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(this.data));
        } catch (e) {
            console.error('Error saving data:', e);
        }
    }

    updateLevelScore(levelKey, score, purpleCoins) {
        if (!this.data.levels[levelKey]) {
            if (levelKey === this.tutorial) {
                this.data.levels[levelKey] = { completed: false };
            } else if (this.bossLevels.includes(levelKey)) {
                this.data.levels[levelKey] = { highScore: 0, completed: false };
            } else {
                this.data.levels[levelKey] = { highScore: 0, purpleCoins: 0, completed: false };
            }
        }
        
        // Actualizar puntuación si es mayor
        if (!levelKey !== this.tutorial && score > this.data.levels[levelKey].highScore) {
            this.data.levels[levelKey].highScore = score;
        }
        
        // Actualizar monedas moradas si no es ni el tutorial ni un nivel de boss y son más
        if (!levelKey !== this.tutorial && !this.bossLevels.includes(levelKey) && purpleCoins > this.data.levels[levelKey].purpleCoins) {
            this.data.levels[levelKey].purpleCoins = purpleCoins;
        }

        // Marcar como completado si corresponde
        this.data.levels[levelKey].completed = true;
        
        this.save();
    }

    // Marcar nivel como completado
    markLevelCompleted(levelKey) {
        if (!this.data.levels[levelKey]) {
            if (levelKey !== this.tutorial) {
                this.data.levels[levelKey] = { completed: true };
            } else if (this.bossLevels.includes(levelKey)) {
                this.data.levels[levelKey] = { highScore: 0, completed: true };
            } else {
                this.data.levels[levelKey] = { highScore: 0, purpleCoins: 0, completed: true };
            }
        } else {
            this.data.levels[levelKey].completed = true;
        }
        
        // Desbloquear niveles basados en progreso
        this.unlockNextLevels(levelKey);
        
        this.save();
    }

    // Desbloquear niveles siguientes basados en progreso
    unlockNextLevels(completedLevel) {
        const unlockMap = {
            'Nivel_T': ['Nivel_R'], // Completar Nivel_T desbloquea Nivel_R
            'Nivel_R': ['BossJ'], // Completar Nivel_R desbloquea BossJ
            'BossJ': ['Nivel_D'], // Completar BossJ desbloquea Nivel_D
            'Nivel_D': ['BossH'], // Completar Nivel_D desbloquea BossH
            'BossH': ['Nivel_G'], // Completar BossH desbloquea Nivel_G
            'Nivel_G': ['BossHades'] // Completar Nivel_G desbloquea BossHades
        };

        if (unlockMap[completedLevel]) {
            unlockMap[completedLevel].forEach(level => {
                if (!this.data.progress.unlockedLevels.includes(level)) {
                    this.data.progress.unlockedLevels.push(level);
                }
            });
        }
    }

    // Verificar si el nivel está en la lista de niveles desbloqueados
    isLevelUnlocked(levelKey) {
        return this.data.progress.unlockedLevels.includes(levelKey);
    }

    getLevelData(levelKey) {
        return this.data.levels[levelKey] || { highScore: 0, purpleCoins: 0, completed: false };
    }

    // Obtener el progreso lineal actual
    getCurrentProgression() {
        // Orden lineal de desbloqueo con nombres descriptivos
        const progressionPath = [
            { key: 'Nivel_T', name: 'Tutorial', type: 'nivel' },
            { key: 'Nivel_R', name: 'Roma', type: 'nivel' },
            { key: 'BossJ', name: 'Júpiter', type: 'jefe' },
            { key: 'Nivel_D', name: 'Egipto', type: 'nivel' },
            { key: 'BossH', name: 'Horus', type: 'jefe' },
            { key: 'Nivel_G', name: 'Grecia', type: 'nivel' },
            { key: 'BossHades', name: 'Hades', type: 'jefe' }
        ];
    
        // Encontrar el primer nivel NO completado
        for (let i = 0; i < progressionPath.length; i++) {
            const currentLevel = progressionPath[i];
            const isCompleted = this.data.levels[currentLevel.key]?.completed || false;
        
            if (!isCompleted) {
                // Este es el próximo nivel/jefe a completar
                return {
                    lastCompleted: i > 0 ? progressionPath[i-1].key : null,
                    nextToUnlock: currentLevel.key,
                    nextToUnlockName: currentLevel.name,
                    currentStage: i + 1,
                    totalStages: progressionPath.length,
                    displayText: `Siguiente: ${currentLevel.name}`
                };
            }
        }
    
        // Todos completados
        return {
            lastCompleted: progressionPath[progressionPath.length - 1].key,
            nextToUnlock: null,
            nextToUnlockName: null,
            currentStage: progressionPath.length,
            totalStages: progressionPath.length,
            displayText: '¡Juego Completado!'
        };
    }

    resetAllData() {
        this.data = JSON.parse(JSON.stringify(this.defaultData));
        this.save();
    }

    unlockAllLevelsAndBosses() {
        // Todos los niveles y jefes en orden de progresión
        const allLevels = [
            'Nivel_T', // Tutorial
            'Nivel_R', 'BossJ', // Mundo 1: Roma
            'Nivel_D', 'BossH', // Mundo 2: Egipto
            'Nivel_G', 'BossHades' // Mundo 3: Grecia
        ];
    
        // Agregar todos a la lista de desbloqueados
        allLevels.forEach(level => {
            if (!this.data.progress.unlockedLevels.includes(level)) {
                this.data.progress.unlockedLevels.push(level);
            }
        
            // También marcarlos como completados
            if (!this.data.levels[level]) {
                /*
                if (this.data.levels[level].highScore && this.data.levels[level].purpleCoins ) {
                    this.data.levels[level] = { highScore: 999999, purpleCoins: 5, completed: true };
                } else if (this.data.levels[level].purpleCoins ) {
                    this.data.levels[level] = { highScore: 999999, completed: true };
                } else {
                    this.data.levels[level] = { completed: true };
                }
                */
               this.data.levels[level] = { highScore: 999999, purpleCoins: 5, completed: true };
            } else {
                this.data.levels[level].completed = true;
                // Aumentar puntuación para que sea impresionante
                if (this.data.levels[level].highScore !== undefined && this.data.levels[level].highScore < 999999) {
                    this.data.levels[level].highScore = 999999;
                }
                if (this.data.levels[level].purpleCoins !== undefined && this.data.levels[level].purpleCoins < 5) {
                    this.data.levels[level].purpleCoins = 5;
                }
            }
        });
    
        this.save();
    }
}

// Crear una instancia global
const saveManager = new SaveManager();
export default saveManager;