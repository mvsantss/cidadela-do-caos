// FichaModule.js - Gerencia atributos, inventário e anotações do jogador

export class FichaModule {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.atributos = {
            habilidade: { inicial: 12, atual: 12 },
            energia: { inicial: 20, atual: 20 },
            sorte: { inicial: 10, atual: 10 },
            magia: { inicial: 8, atual: 8 }
        };
        this.inventario = {
            ouro: 0,
            itens: '',
            encantos: []
        };
        this.anotacoes = '';
        this.salaAtual = 1;
    }

    async init() {
        this.bindElements();
        this.setupEventListeners();
        this.loadInitialData();
        console.log('📋 FichaModule inicializado');
    }

    bindElements() {
        // Atributos
        this.elements.habilidadeInicial = document.getElementById('habilidade-inicial');
        this.elements.habilidadeAtual = document.getElementById('habilidade-atual');
        this.elements.energiaInicial = document.getElementById('energia-inicial');
        this.elements.energiaAtual = document.getElementById('energia-atual');
        this.elements.sorteInicial = document.getElementById('sorte-inicial');
        this.elements.sorteAtual = document.getElementById('sorte-atual');
        this.elements.magiaInicial = document.getElementById('magia-inicial');
        this.elements.magiaAtual = document.getElementById('magia-atual');

        // Inventário
        this.elements.ouro = document.getElementById('ouro');
        this.elements.itensLevados = document.getElementById('itens-levados');
        this.elements.encantosSelecionados = document.getElementById('encantos-selecionados');

        // Outros
        this.elements.anotacoesGerais = document.getElementById('anotacoes-gerais');
        this.elements.salaAtual = document.getElementById('sala-atual');
        this.elements.proximasSalas = document.getElementById('proximas-salas');

        // Botões
        this.elements.gerarAtributos = document.getElementById('gerar-atributos');
        this.elements.resetarAtributos = document.getElementById('resetar-atributos');
    }

    setupEventListeners() {
        // Eventos de mudança nos atributos
        Object.keys(this.atributos).forEach(attr => {
            ['inicial', 'atual'].forEach(tipo => {
                const element = this.elements[`${attr}${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`];
                if (element) {
                    element.addEventListener('change', () => this.updateAtributo(attr, tipo, parseInt(element.value)));
                }
            });
        });

        // Eventos do inventário
        if (this.elements.ouro) {
            this.elements.ouro.addEventListener('change', () => this.updateOuro(parseInt(this.elements.ouro.value)));
        }

        if (this.elements.itensLevados) {
            this.elements.itensLevados.addEventListener('input', () => this.updateItens(this.elements.itensLevados.value));
        }

        if (this.elements.anotacoesGerais) {
            this.elements.anotacoesGerais.addEventListener('input', () => this.updateAnotacoes(this.elements.anotacoesGerais.value));
        }

        if (this.elements.salaAtual) {
            this.elements.salaAtual.addEventListener('change', () => this.updateSalaAtual(parseInt(this.elements.salaAtual.value)));
        }

        // Botões
        if (this.elements.gerarAtributos) {
            this.elements.gerarAtributos.addEventListener('click', () => this.gerarAtributosAleatorios());
        }

        if (this.elements.resetarAtributos) {
            this.elements.resetarAtributos.addEventListener('click', () => this.resetarAtributos());
        }
    }

    loadInitialData() {
        // Carregar dados salvos ou usar valores padrão
        if (this.gameState.ficha) {
            this.atributos = { ...this.atributos, ...this.gameState.ficha.atributos };
            this.inventario = { ...this.inventario, ...this.gameState.ficha.inventario };
            this.anotacoes = this.gameState.ficha.anotacoes || '';
            this.salaAtual = this.gameState.ficha.salaAtual || 1;
        }
        this.updateUI();
    }

    updateUI() {
        // Atualizar campos de atributos
        Object.keys(this.atributos).forEach(attr => {
            ['inicial', 'atual'].forEach(tipo => {
                const element = this.elements[`${attr}${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`];
                if (element) {
                    element.value = this.atributos[attr][tipo];
                }
            });
        });

        // Atualizar inventário
        if (this.elements.ouro) this.elements.ouro.value = this.inventario.ouro;
        if (this.elements.itensLevados) this.elements.itensLevados.value = this.inventario.itens;
        if (this.elements.anotacoesGerais) this.elements.anotacoesGerais.value = this.anotacoes;
        if (this.elements.salaAtual) this.elements.salaAtual.value = this.salaAtual;

        this.updateEncantosList();
    }

    updateAtributo(atributo, tipo, valor) {
        this.atributos[atributo][tipo] = valor;
        this.saveData();
        this.validateAtributo(atributo, tipo, valor);
    }

    validateAtributo(atributo, tipo, valor) {
        const recomendacoes = {
            habilidade: { min: 7, max: 12 },
            energia: { min: 14, max: 24 },
            sorte: { min: 7, max: 12 },
            magia: { min: 7, max: 12 }
        };

        if (tipo === 'inicial' && recomendacoes[atributo]) {
            const rec = recomendacoes[atributo];
            if (valor < rec.min || valor > rec.max) {
                window.CidadelaApp.showNotification(
                    `⚠️ ${atributo.charAt(0).toUpperCase() + atributo.slice(1)}: Recomendado entre ${rec.min} e ${rec.max}`,
                    'warning'
                );
            }
        }
    }

    gerarAtributosAleatorios() {
        // Gerar atributos conforme regras do livro
        this.atributos.habilidade.inicial = window.CidadelaApp.rollDice(6, 1) + 6;
        this.atributos.energia.inicial = window.CidadelaApp.rollDice(6, 2) + 12;
        this.atributos.sorte.inicial = window.CidadelaApp.rollDice(6, 1) + 6;
        this.atributos.magia.inicial = window.CidadelaApp.rollDice(6, 1) + 6;

        // Copiar para valores atuais
        Object.keys(this.atributos).forEach(attr => {
            this.atributos[attr].atual = this.atributos[attr].inicial;
        });

        this.updateUI();
        this.saveData();
        window.CidadelaApp.showNotification('🎲 Atributos gerados aleatoriamente!', 'success');
    }

    resetarAtributos() {
        Object.keys(this.atributos).forEach(attr => {
            this.atributos[attr].atual = this.atributos[attr].inicial;
        });
        this.updateUI();
        this.saveData();
        window.CidadelaApp.showNotification('🔄 Atributos resetados para valores iniciais!', 'info');
    }

    updateOuro(valor) {
        this.inventario.ouro = valor;
        this.saveData();
    }

    updateItens(texto) {
        this.inventario.itens = texto;
        this.saveData();
    }

    updateAnotacoes(texto) {
        this.anotacoes = texto;
        this.saveData();
    }

    updateSalaAtual(sala) {
        this.salaAtual = sala;
        this.gameState.salaAtual = sala;
        this.saveData();
    }

    updateEncantosList() {
        if (!this.elements.encantosSelecionados) return;

        const container = this.elements.encantosSelecionados;
        container.innerHTML = '';

        if (this.inventario.encantos.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum encanto selecionado</p>';
            return;
        }

        this.inventario.encantos.forEach((encanto, index) => {
            const item = document.createElement('div');
            item.className = 'encanto-item';
            item.innerHTML = `
                <span>${encanto.nome}</span>
                <button onclick="window.cidadelaApp.modules.ficha.removerEncanto(${index})" class="btn-remove">❌</button>
            `;
            container.appendChild(item);
        });
    }

    adicionarEncanto(encanto) {
        if (!this.inventario.encantos.find(e => e.nome === encanto.nome)) {
            this.inventario.encantos.push(encanto);
            this.updateEncantosList();
            this.saveData();
        }
    }

    removerEncanto(index) {
        this.inventario.encantos.splice(index, 1);
        this.updateEncantosList();
        this.saveData();
    }

    usarEncanto(nomeEncanto) {
        if (this.atributos.magia.atual > 0) {
            this.atributos.magia.atual--;
            this.updateUI();
            this.saveData();
            return true;
        }
        return false;
    }

    saveData() {
        this.gameState.ficha = {
            atributos: this.atributos,
            inventario: this.inventario,
            anotacoes: this.anotacoes,
            salaAtual: this.salaAtual
        };
    }

    onGameStateUpdate(sourceModule, data) {
        if (sourceModule === 'encantos' && data.encantosSelecionados) {
            this.inventario.encantos = data.encantosSelecionados;
            this.updateEncantosList();
        }
    }

    onDataLoaded(gameState) {
        if (gameState.ficha) {
            this.atributos = { ...this.atributos, ...gameState.ficha.atributos };
            this.inventario = { ...this.inventario, ...gameState.ficha.inventario };
            this.anotacoes = gameState.ficha.anotacoes || '';
            this.salaAtual = gameState.ficha.salaAtual || 1;
            this.updateUI();
        }
    }

    // Métodos públicos para outros módulos
    getAtributo(nome, tipo = 'atual') {
        return this.atributos[nome] ? this.atributos[nome][tipo] : 0;
    }

    setAtributo(nome, tipo, valor) {
        if (this.atributos[nome]) {
            this.atributos[nome][tipo] = Math.max(0, valor);
            this.updateUI();
            this.saveData();
        }
    }

    modificarAtributo(nome, modificador, tipo = 'atual') {
        if (this.atributos[nome]) {
            this.atributos[nome][tipo] = Math.max(0, this.atributos[nome][tipo] + modificador);
            this.updateUI();
            this.saveData();
        }
    }
}

