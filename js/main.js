// main.js - Módulo central da aplicação "A Cidadela do Caos"

import { FichaModule } from './FichaModule.js';
import { SalasModule } from './SalasModule.js';
import { EncantosModule } from './EncantosModule.js';
import { CombateModule } from './CombateModule.js';
import { RunsModule } from './RunsModule.js';

class CidadelaApp {
    constructor() {
        this.currentTab = 'ficha';
        this.modules = {};
        this.gameState = {
            ficha: null,
            salas: {},
            encantosSelecionados: [],
            salaAtual: 1,
            runAtual: null
        };
        
        this.init();
    }

    async init() {
        try {
            // Inicializar módulos
            this.modules.ficha = new FichaModule(this.gameState);
            this.modules.salas = new SalasModule(this.gameState);
            this.modules.encantos = new EncantosModule(this.gameState);
            this.modules.combate = new CombateModule(this.gameState);
            this.modules.runs = new RunsModule(this.gameState);

            // Configurar navegação entre abas
            this.setupTabNavigation();

            // Inicializar cada módulo
            await this.modules.ficha.init();
            await this.modules.salas.init();
            await this.modules.encantos.init();
            await this.modules.combate.init();
            await this.modules.runs.init();

            // Carregar dados salvos
            this.loadGameData();

            console.log('🏰 A Cidadela do Caos - Aplicação inicializada com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar aplicação:', error);
        }
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                this.switchTab(targetTab);
            });
        });
    }

    switchTab(tabName) {
        // Remover classe active de todas as abas
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Ativar aba selecionada
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        // Notificar módulo da aba ativa sobre a mudança
        if (this.modules[tabName] && typeof this.modules[tabName].onTabActivated === 'function') {
            this.modules[tabName].onTabActivated();
        }
    }

    // Métodos para comunicação entre módulos
    updateGameState(module, data) {
        if (this.gameState[module]) {
            Object.assign(this.gameState[module], data);
        } else {
            this.gameState[module] = data;
        }
        
        this.saveGameData();
        this.notifyModules(module, data);
    }

    notifyModules(sourceModule, data) {
        Object.keys(this.modules).forEach(moduleName => {
            if (moduleName !== sourceModule && this.modules[moduleName].onGameStateUpdate) {
                this.modules[moduleName].onGameStateUpdate(sourceModule, data);
            }
        });
    }

    saveGameData() {
        try {
            const dataToSave = {
                gameState: this.gameState,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem('cidadela-do-caos-data', JSON.stringify(dataToSave));
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
        }
    }

    loadGameData() {
        try {
            const savedData = localStorage.getItem('cidadela-do-caos-data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                if (parsedData.gameState) {
                    Object.assign(this.gameState, parsedData.gameState);
                    
                    // Notificar todos os módulos sobre os dados carregados
                    Object.keys(this.modules).forEach(moduleName => {
                        if (this.modules[moduleName].onDataLoaded) {
                            this.modules[moduleName].onDataLoaded(this.gameState);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }

    // Utilitários globais
    static rollDice(sides = 6, count = 1) {
        let total = 0;
        for (let i = 0; i < count; i++) {
            total += Math.floor(Math.random() * sides) + 1;
        }
        return total;
    }

    static formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    static showNotification(message, type = 'info') {
        // Criar elemento de notificação
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Estilos inline para a notificação
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            opacity: '0',
            transform: 'translateX(100%)',
            transition: 'all 0.3s ease'
        });

        // Cores baseadas no tipo
        const colors = {
            info: '#17a2b8',
            success: '#28a745',
            warning: '#ffc107',
            error: '#dc3545'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remover após 3 segundos
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Método para exportar dados
    exportData() {
        const dataToExport = {
            gameState: this.gameState,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cidadela-do-caos-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        CidadelaApp.showNotification('Dados exportados com sucesso!', 'success');
    }

    // Método para importar dados
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.gameState) {
                    Object.assign(this.gameState, importedData.gameState);
                    this.saveGameData();
                    
                    // Recarregar página para aplicar mudanças
                    window.location.reload();
                } else {
                    throw new Error('Formato de arquivo inválido');
                }
            } catch (error) {
                console.error('Erro ao importar dados:', error);
                CidadelaApp.showNotification('Erro ao importar dados!', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Inicializar aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    window.cidadelaApp = new CidadelaApp();
});

// Exportar classe para uso global
window.CidadelaApp = CidadelaApp;

