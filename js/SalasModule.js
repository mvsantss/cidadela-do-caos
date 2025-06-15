// SalasModule.js - Gerencia visualização e interação com as salas (1-400)

export class SalasModule {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.salas = {};
        this.filtroAtual = 'todas'; // 'todas', 'visitadas'
        this.badges = {
            loot: '💰',
            duelo: '⚔️',
            sorte: '🧪',
            morte: '☠️',
            item: '🎁',
            conversa: '💬',
            armadilha: '⚠️'
        };
        
        // Inicializar todas as salas
        this.initializeSalas();
    }

    async init() {
        this.bindElements();
        this.setupEventListeners();
        this.loadSalasData();
        this.renderSalas();
        console.log('🗺️ SalasModule inicializado');
    }

    bindElements() {
        this.elements.salasGrid = document.getElementById('salas-grid');
        this.elements.buscarSala = document.getElementById('buscar-sala');
        this.elements.irSala = document.getElementById('ir-sala');
        this.elements.mostrarTodas = document.getElementById('mostrar-todas');
        this.elements.mostrarVisitadas = document.getElementById('mostrar-visitadas');
    }

    setupEventListeners() {
        if (this.elements.irSala) {
            this.elements.irSala.addEventListener('click', () => this.irParaSala());
        }

        if (this.elements.buscarSala) {
            this.elements.buscarSala.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.irParaSala();
                }
            });
        }

        if (this.elements.mostrarTodas) {
            this.elements.mostrarTodas.addEventListener('click', () => this.setFiltro('todas'));
        }

        if (this.elements.mostrarVisitadas) {
            this.elements.mostrarVisitadas.addEventListener('click', () => this.setFiltro('visitadas'));
        }
    }

    initializeSalas() {
        // Inicializar estrutura básica para todas as salas (1-400)
        for (let i = 1; i <= 400; i++) {
            this.salas[i] = {
                numero: i,
                visitada: false,
                anotacao: '',
                badges: [],
                proximasSalas: []
            };
        }
    }

    loadSalasData() {
        if (this.gameState.salas) {
            Object.keys(this.gameState.salas).forEach(numero => {
                if (this.salas[numero]) {
                    Object.assign(this.salas[numero], this.gameState.salas[numero]);
                }
            });
        }
    }

    renderSalas() {
        if (!this.elements.salasGrid) return;

        const container = this.elements.salasGrid;
        container.innerHTML = '';

        const salasParaMostrar = this.getSalasFiltradas();

        salasParaMostrar.forEach(sala => {
            const salaCard = this.createSalaCard(sala);
            container.appendChild(salaCard);
        });

        // Se não há salas para mostrar
        if (salasParaMostrar.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma sala encontrada</p>';
        }
    }

    getSalasFiltradas() {
        const todasSalas = Object.values(this.salas);
        
        switch (this.filtroAtual) {
            case 'visitadas':
                return todasSalas.filter(sala => sala.visitada);
            case 'todas':
            default:
                return todasSalas;
        }
    }

    createSalaCard(sala) {
        const card = document.createElement('div');
        card.className = 'sala-card';
        
        // Adicionar classes especiais
        if (sala.visitada) card.classList.add('visitada');
        if (sala.numero === this.gameState.salaAtual) card.classList.add('atual');

        card.innerHTML = `
            <div class="sala-numero">${sala.numero}</div>
            <div class="sala-badges">
                ${this.renderBadges(sala)}
            </div>
            <textarea 
                class="sala-anotacao" 
                placeholder="Anotações..."
                data-sala="${sala.numero}"
            >${sala.anotacao}</textarea>
        `;

        // Event listeners para a sala
        this.setupSalaCardEvents(card, sala);

        return card;
    }

    renderBadges(sala) {
        let badgesHtml = '';
        
        // Badges existentes
        sala.badges.forEach(badge => {
            if (this.badges[badge]) {
                badgesHtml += `<span class="badge" data-badge="${badge}" title="${badge}">${this.badges[badge]}</span>`;
            }
        });

        // Adicionar badges disponíveis para seleção
        Object.keys(this.badges).forEach(badgeKey => {
            if (!sala.badges.includes(badgeKey)) {
                badgesHtml += `<span class="badge badge-inactive" data-badge="${badgeKey}" title="Adicionar ${badgeKey}">${this.badges[badgeKey]}</span>`;
            }
        });

        return badgesHtml;
    }

    setupSalaCardEvents(card, sala) {
        // Clique na sala para marcar como visitada/atual
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('sala-anotacao') || e.target.classList.contains('badge')) {
                return; // Não processar se clicou na anotação ou badge
            }
            this.setSalaAtual(sala.numero);
        });

        // Double-click para marcar como visitada
        card.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('sala-anotacao') || e.target.classList.contains('badge')) {
                return;
            }
            this.toggleSalaVisitada(sala.numero);
        });

        // Anotações
        const anotacaoTextarea = card.querySelector('.sala-anotacao');
        if (anotacaoTextarea) {
            anotacaoTextarea.addEventListener('input', (e) => {
                this.updateAnotacaoSala(sala.numero, e.target.value);
            });
            
            anotacaoTextarea.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }

        // Badges
        const badges = card.querySelectorAll('.badge');
        badges.forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                const badgeType = badge.getAttribute('data-badge');
                this.toggleBadge(sala.numero, badgeType);
            });
        });
    }

    setSalaAtual(numero) {
        // Remover classe atual de todas as salas
        document.querySelectorAll('.sala-card.atual').forEach(card => {
            card.classList.remove('atual');
        });

        // Definir nova sala atual
        this.gameState.salaAtual = numero;
        
        // Atualizar ficha se disponível
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            window.cidadelaApp.modules.ficha.updateSalaAtual(numero);
        }

        // Adicionar classe atual à nova sala
        const salaCard = document.querySelector(`[data-sala="${numero}"]`)?.closest('.sala-card');
        if (salaCard) {
            salaCard.classList.add('atual');
        }

        this.saveData();
        window.CidadelaApp.showNotification(`📍 Sala atual: ${numero}`, 'info');
    }

    toggleSalaVisitada(numero) {
        if (this.salas[numero]) {
            this.salas[numero].visitada = !this.salas[numero].visitada;
            this.renderSalas();
            this.saveData();
            
            const status = this.salas[numero].visitada ? 'visitada' : 'não visitada';
            window.CidadelaApp.showNotification(`Sala ${numero} marcada como ${status}`, 'success');
        }
    }

    toggleBadge(numeroSala, badgeType) {
        if (!this.salas[numeroSala]) return;

        const sala = this.salas[numeroSala];
        const badgeIndex = sala.badges.indexOf(badgeType);

        if (badgeIndex > -1) {
            // Remover badge
            sala.badges.splice(badgeIndex, 1);
        } else {
            // Adicionar badge
            sala.badges.push(badgeType);
        }

        this.renderSalas();
        this.saveData();
    }

    updateAnotacaoSala(numero, anotacao) {
        if (this.salas[numero]) {
            this.salas[numero].anotacao = anotacao;
            this.saveData();
        }
    }

    irParaSala() {
        const numeroSala = parseInt(this.elements.buscarSala.value);
        
        if (numeroSala >= 1 && numeroSala <= 400) {
            this.setSalaAtual(numeroSala);
            this.scrollToSala(numeroSala);
            this.elements.buscarSala.value = '';
        } else {
            window.CidadelaApp.showNotification('Número de sala inválido (1-400)', 'error');
        }
    }

    scrollToSala(numero) {
        const salaCard = document.querySelector(`[data-sala="${numero}"]`)?.closest('.sala-card');
        if (salaCard) {
            salaCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Destacar temporariamente
            salaCard.style.boxShadow = '0 0 20px rgba(255, 193, 7, 0.8)';
            setTimeout(() => {
                salaCard.style.boxShadow = '';
            }, 2000);
        }
    }

    setFiltro(filtro) {
        this.filtroAtual = filtro;
        
        // Atualizar botões
        document.querySelectorAll('.salas-controls button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (filtro === 'todas') {
            this.elements.mostrarTodas.classList.add('active');
        } else if (filtro === 'visitadas') {
            this.elements.mostrarVisitadas.classList.add('active');
        }

        this.renderSalas();
    }

    // Métodos para definir próximas salas (usado por outros módulos)
    setProximasSalas(salaAtual, proximasSalas) {
        if (this.salas[salaAtual]) {
            this.salas[salaAtual].proximasSalas = proximasSalas;
            this.saveData();
            
            // Atualizar interface da ficha se disponível
            this.updateProximasSalasUI(proximasSalas);
        }
    }

    updateProximasSalasUI(proximasSalas) {
        const container = document.getElementById('proximas-salas');
        if (!container) return;

        if (proximasSalas.length === 0) {
            container.innerHTML = '<p>Próximas salas aparecerão aqui</p>';
            return;
        }

        const salasHtml = proximasSalas.map(sala => {
            const salaInfo = typeof sala === 'object' ? sala : { numero: sala, descricao: '' };
            return `
                <div class="proxima-sala" onclick="window.cidadelaApp.modules.salas.setSalaAtual(${salaInfo.numero})">
                    <strong>Sala ${salaInfo.numero}</strong>
                    ${salaInfo.descricao ? `<br><small>${salaInfo.descricao}</small>` : ''}
                </div>
            `;
        }).join('');

        container.innerHTML = `
            <h4>Próximas salas:</h4>
            <div class="proximas-salas-lista">
                ${salasHtml}
            </div>
        `;
    }

    saveData() {
        this.gameState.salas = this.salas;
    }

    onGameStateUpdate(sourceModule, data) {
        if (sourceModule === 'ficha' && data.salaAtual !== undefined) {
            this.setSalaAtual(data.salaAtual);
        }
    }

    onDataLoaded(gameState) {
        if (gameState.salas) {
            Object.keys(gameState.salas).forEach(numero => {
                if (this.salas[numero]) {
                    Object.assign(this.salas[numero], gameState.salas[numero]);
                }
            });
            this.renderSalas();
        }
    }

    onTabActivated() {
        // Rerender salas quando a aba for ativada
        this.renderSalas();
    }

    // Métodos públicos para outros módulos
    getSala(numero) {
        return this.salas[numero];
    }

    marcarSalaVisitada(numero) {
        if (this.salas[numero]) {
            this.salas[numero].visitada = true;
            this.saveData();
        }
    }

    adicionarBadge(numeroSala, badgeType) {
        if (this.salas[numeroSala] && !this.salas[numeroSala].badges.includes(badgeType)) {
            this.salas[numeroSala].badges.push(badgeType);
            this.saveData();
        }
    }

    getSalasVisitadas() {
        return Object.values(this.salas).filter(sala => sala.visitada);
    }

    getTotalSalasVisitadas() {
        return this.getSalasVisitadas().length;
    }
}

