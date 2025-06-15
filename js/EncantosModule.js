// EncantosModule.js - Lista, aleatoriza e exibe os Encantos Mágicos

export class EncantosModule {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.encantosSelecionados = [];
        this.encantosUsados = [];
        
        // Lista completa dos 12 encantos do livro
        this.encantosDisponiveis = [
            {
                id: 1,
                nome: 'Criação de Ilusão',
                descricao: 'Cria ilusões realistas para enganar ou distrair inimigos.'
            },
            {
                id: 2,
                nome: 'Fogo',
                descricao: 'Lança uma bola de fogo contra o inimigo, causando dano direto.'
            },
            {
                id: 3,
                nome: 'Confusão',
                descricao: 'Confunde temporariamente a mente do inimigo, desorientando-o.'
            },
            {
                id: 4,
                nome: 'Criação de Criatura',
                descricao: 'Invoca uma criatura mágica para lutar por você.'
            },
            {
                id: 5,
                nome: 'Escudo Mágico',
                descricao: 'Cria um campo de força que bloqueia ataques.'
            },
            {
                id: 6,
                nome: 'Levitação',
                descricao: 'Permite ao jogador flutuar ou voar brevemente.'
            },
            {
                id: 7,
                nome: 'Invisibilidade',
                descricao: 'Torna o jogador invisível por um curto período.'
            },
            {
                id: 8,
                nome: 'Abre-trancas',
                descricao: 'Destrava portas ou baús trancados magicamente.'
            },
            {
                id: 9,
                nome: 'Controle de Mente',
                descricao: 'Permite controlar ou influenciar mentalmente outra criatura.'
            },
            {
                id: 10,
                nome: 'Fraqueza',
                descricao: 'Enfraquece fisicamente o inimigo, reduzindo seus atributos.'
            },
            {
                id: 11,
                nome: 'Comunicação com Animais',
                descricao: 'Permite falar com criaturas não-humanas ou animais.'
            },
            {
                id: 12,
                nome: 'Descarga Elétrica',
                descricao: 'Libera um raio de eletricidade contra o alvo.'
            }
        ];
    }

    async init() {
        this.bindElements();
        this.setupEventListeners();
        this.loadEncantosData();
        this.renderEncantos();
        this.updateMagiaDisplay();
        console.log('✨ EncantosModule inicializado');
    }

    bindElements() {
        this.elements.encantosGrid = document.getElementById('encantos-grid');
        this.elements.gerarEncantosAleatorio = document.getElementById('gerar-encantos-aleatorio');
        this.elements.limparEncantos = document.getElementById('limpar-encantos');
        this.elements.magiaDisponivel = document.getElementById('magia-disponivel');
    }

    setupEventListeners() {
        if (this.elements.gerarEncantosAleatorio) {
            this.elements.gerarEncantosAleatorio.addEventListener('click', () => this.gerarEncantosAleatorios());
        }

        if (this.elements.limparEncantos) {
            this.elements.limparEncantos.addEventListener('click', () => this.limparSelecao());
        }
    }

    loadEncantosData() {
        if (this.gameState.encantosSelecionados) {
            this.encantosSelecionados = [...this.gameState.encantosSelecionados];
        }
        if (this.gameState.encantosUsados) {
            this.encantosUsados = [...this.gameState.encantosUsados];
        }
    }

    renderEncantos() {
        if (!this.elements.encantosGrid) return;

        const container = this.elements.encantosGrid;
        container.innerHTML = '';

        this.encantosDisponiveis.forEach(encanto => {
            const encantoCard = this.createEncantoCard(encanto);
            container.appendChild(encantoCard);
        });
    }

    createEncantoCard(encanto) {
        const card = document.createElement('div');
        card.className = 'encanto-card';
        
        // Verificar status do encanto
        const selecionado = this.encantosSelecionados.some(e => e.id === encanto.id);
        const usado = this.encantosUsados.includes(encanto.id);
        
        if (selecionado) card.classList.add('selecionado');
        if (usado) card.classList.add('usado');

        // Determinar ícone de status
        let statusIcon = '';
        if (usado) {
            statusIcon = '🚫';
        } else if (selecionado) {
            statusIcon = '✅';
        }

        card.innerHTML = `
            <div class="encanto-status">${statusIcon}</div>
            <div class="encanto-nome">${encanto.nome}</div>
            <div class="encanto-descricao">${encanto.descricao}</div>
        `;

        // Event listeners
        card.addEventListener('click', () => this.toggleEncanto(encanto));

        return card;
    }

    toggleEncanto(encanto) {
        const jaSelecionado = this.encantosSelecionados.some(e => e.id === encanto.id);
        const jaUsado = this.encantosUsados.includes(encanto.id);

        if (jaUsado) {
            window.CidadelaApp.showNotification('Este encanto já foi usado!', 'warning');
            return;
        }

        if (jaSelecionado) {
            // Remover encanto
            this.encantosSelecionados = this.encantosSelecionados.filter(e => e.id !== encanto.id);
            window.CidadelaApp.showNotification(`Encanto "${encanto.nome}" removido`, 'info');
        } else {
            // Verificar se pode adicionar (baseado na Magia disponível)
            const magiaAtual = this.getMagiaAtual();
            if (this.encantosSelecionados.length >= magiaAtual) {
                window.CidadelaApp.showNotification(
                    `Você só pode selecionar ${magiaAtual} encantos (baseado na sua Magia)`,
                    'warning'
                );
                return;
            }

            // Adicionar encanto
            this.encantosSelecionados.push(encanto);
            window.CidadelaApp.showNotification(`Encanto "${encanto.nome}" selecionado`, 'success');
        }

        this.renderEncantos();
        this.saveData();
        this.updateFichaEncantos();
    }

    gerarEncantosAleatorios() {
        // Limpar seleção atual
        this.encantosSelecionados = [];
        this.encantosUsados = [];

        // Rolar 2d6 para determinar quantidade de encantos
        const quantidadeEncantos = window.CidadelaApp.rollDice(6, 2);
        
        // Selecionar encantos aleatoriamente
        const encantosDisponiveis = [...this.encantosDisponiveis];
        
        for (let i = 0; i < quantidadeEncantos && encantosDisponiveis.length > 0; i++) {
            const indiceAleatorio = Math.floor(Math.random() * encantosDisponiveis.length);
            const encantoSelecionado = encantosDisponiveis.splice(indiceAleatorio, 1)[0];
            this.encantosSelecionados.push(encantoSelecionado);
        }

        this.renderEncantos();
        this.saveData();
        this.updateFichaEncantos();
        
        window.CidadelaApp.showNotification(
            `🎲 ${quantidadeEncantos} encantos gerados aleatoriamente!`,
            'success'
        );
    }

    limparSelecao() {
        this.encantosSelecionados = [];
        this.encantosUsados = [];
        this.renderEncantos();
        this.saveData();
        this.updateFichaEncantos();
        window.CidadelaApp.showNotification('Seleção de encantos limpa', 'info');
    }

    usarEncanto(encantoId) {
        const encanto = this.encantosSelecionados.find(e => e.id === encantoId);
        
        if (!encanto) {
            window.CidadelaApp.showNotification('Encanto não selecionado!', 'error');
            return false;
        }

        if (this.encantosUsados.includes(encantoId)) {
            window.CidadelaApp.showNotification('Encanto já foi usado!', 'warning');
            return false;
        }

        // Verificar se tem Magia suficiente
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            const magiaAtual = window.cidadelaApp.modules.ficha.getAtributo('magia', 'atual');
            if (magiaAtual <= 0) {
                window.CidadelaApp.showNotification('Sem pontos de Magia suficientes!', 'error');
                return false;
            }

            // Consumir ponto de Magia
            window.cidadelaApp.modules.ficha.modificarAtributo('magia', -1, 'atual');
        }

        // Marcar encanto como usado
        this.encantosUsados.push(encantoId);
        this.renderEncantos();
        this.saveData();
        this.updateMagiaDisplay();

        window.CidadelaApp.showNotification(`Encanto "${encanto.nome}" usado!`, 'success');
        return true;
    }

    resetarEncantosUsados() {
        this.encantosUsados = [];
        this.renderEncantos();
        this.saveData();
        window.CidadelaApp.showNotification('Encantos resetados - todos disponíveis novamente', 'info');
    }

    getMagiaAtual() {
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            return window.cidadelaApp.modules.ficha.getAtributo('magia', 'inicial');
        }
        return 8; // Valor padrão
    }

    updateMagiaDisplay() {
        if (this.elements.magiaDisponivel) {
            let magiaAtual = 8; // Valor padrão
            if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
                magiaAtual = window.cidadelaApp.modules.ficha.getAtributo('magia', 'atual');
            }
            this.elements.magiaDisponivel.textContent = magiaAtual;
        }
    }

    updateFichaEncantos() {
        // Atualizar lista de encantos na ficha
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            window.cidadelaApp.modules.ficha.inventario.encantos = [...this.encantosSelecionados];
            window.cidadelaApp.modules.ficha.updateEncantosList();
        }
    }

    saveData() {
        this.gameState.encantosSelecionados = this.encantosSelecionados;
        this.gameState.encantosUsados = this.encantosUsados;
    }

    onGameStateUpdate(sourceModule, data) {
        if (sourceModule === 'ficha') {
            this.updateMagiaDisplay();
        }
    }

    onDataLoaded(gameState) {
        if (gameState.encantosSelecionados) {
            this.encantosSelecionados = [...gameState.encantosSelecionados];
        }
        if (gameState.encantosUsados) {
            this.encantosUsados = [...gameState.encantosUsados];
        }
        this.renderEncantos();
        this.updateMagiaDisplay();
        this.updateFichaEncantos();
    }

    onTabActivated() {
        this.updateMagiaDisplay();
        this.renderEncantos();
    }

    // Métodos públicos para outros módulos
    getEncantosSelecionados() {
        return [...this.encantosSelecionados];
    }

    getEncantosUsados() {
        return [...this.encantosUsados];
    }

    getEncantoById(id) {
        return this.encantosDisponiveis.find(e => e.id === id);
    }

    isEncantoDisponivel(id) {
        return this.encantosSelecionados.some(e => e.id === id) && 
               !this.encantosUsados.includes(id);
    }

    getEncantosDisponiveis() {
        return this.encantosSelecionados.filter(encanto => 
            !this.encantosUsados.includes(encanto.id)
        );
    }

    // Método para interface de combate
    createEncantoSelector(callback) {
        const encantosDisponiveis = this.getEncantosDisponiveis();
        
        if (encantosDisponiveis.length === 0) {
            return '<p>Nenhum encanto disponível</p>';
        }

        let html = '<div class="encantos-selector">';
        html += '<h4>Selecione um encanto para usar:</h4>';
        
        encantosDisponiveis.forEach(encanto => {
            html += `
                <button class="encanto-btn" onclick="${callback}(${encanto.id})">
                    <strong>${encanto.nome}</strong>
                    <br><small>${encanto.descricao}</small>
                </button>
            `;
        });
        
        html += '</div>';
        return html;
    }
}

