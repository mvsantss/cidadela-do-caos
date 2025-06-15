// RunsModule.js - Salva, carrega e compara sessões de jogo

export class RunsModule {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.runs = [];
        this.runAtual = null;
    }

    async init() {
        this.bindElements();
        this.setupEventListeners();
        this.loadRunsData();
        this.renderRuns();
        console.log('💾 RunsModule inicializado');
    }

    bindElements() {
        this.elements.novaRun = document.getElementById('nova-run');
        this.elements.salvarRun = document.getElementById('salvar-run');
        this.elements.exportarRuns = document.getElementById('exportar-runs');
        this.elements.importarRuns = document.getElementById('importar-runs');
        this.elements.runsLista = document.getElementById('runs-lista');
    }

    setupEventListeners() {
        if (this.elements.novaRun) {
            this.elements.novaRun.addEventListener('click', () => this.criarNovaRun());
        }

        if (this.elements.salvarRun) {
            this.elements.salvarRun.addEventListener('click', () => this.salvarRunAtual());
        }

        if (this.elements.exportarRuns) {
            this.elements.exportarRuns.addEventListener('click', () => this.exportarRuns());
        }

        if (this.elements.importarRuns) {
            this.elements.importarRuns.addEventListener('click', () => this.importarRuns());
        }
    }

    loadRunsData() {
        try {
            const savedRuns = localStorage.getItem('cidadela-runs');
            if (savedRuns) {
                this.runs = JSON.parse(savedRuns);
            }

            const currentRun = localStorage.getItem('cidadela-current-run');
            if (currentRun) {
                this.runAtual = JSON.parse(currentRun);
            }
        } catch (error) {
            console.error('Erro ao carregar runs:', error);
            this.runs = [];
            this.runAtual = null;
        }
    }

    saveRunsData() {
        try {
            localStorage.setItem('cidadela-runs', JSON.stringify(this.runs));
            if (this.runAtual) {
                localStorage.setItem('cidadela-current-run', JSON.stringify(this.runAtual));
            }
        } catch (error) {
            console.error('Erro ao salvar runs:', error);
        }
    }

    criarNovaRun() {
        const agora = new Date();
        
        this.runAtual = {
            id: Date.now(),
            titulo: `Run ${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
            dataInicio: agora.toISOString(),
            dataUltimaAtualizacao: agora.toISOString(),
            favorita: false,
            fichaInicial: this.capturarFichaAtual(),
            salaAtual: this.gameState.salaAtual || 1,
            salasVisitadas: this.capturarSalasVisitadas(),
            decisoes: [],
            anotacoes: '',
            estatisticas: {
                tempoJogado: 0,
                salasExploradas: 0,
                combatesRealizados: 0,
                encantosUsados: 0
            }
        };

        this.saveRunsData();
        this.renderRuns();
        
        window.CidadelaApp.showNotification('Nova run criada!', 'success');
    }

    salvarRunAtual() {
        if (!this.runAtual) {
            this.criarNovaRun();
            return;
        }

        // Atualizar dados da run atual
        this.runAtual.dataUltimaAtualizacao = new Date().toISOString();
        this.runAtual.salaAtual = this.gameState.salaAtual || 1;
        this.runAtual.salasVisitadas = this.capturarSalasVisitadas();
        this.runAtual.estatisticas = this.calcularEstatisticas();

        // Verificar se já existe uma run salva com este ID
        const indexExistente = this.runs.findIndex(run => run.id === this.runAtual.id);
        
        if (indexExistente >= 0) {
            // Atualizar run existente
            this.runs[indexExistente] = { ...this.runAtual };
        } else {
            // Adicionar nova run
            this.runs.push({ ...this.runAtual });
        }

        this.saveRunsData();
        this.renderRuns();
        
        window.CidadelaApp.showNotification('Run salva com sucesso!', 'success');
    }

    capturarFichaAtual() {
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            const ficha = window.cidadelaApp.modules.ficha;
            return {
                atributos: { ...ficha.atributos },
                inventario: { ...ficha.inventario },
                anotacoes: ficha.anotacoes,
                timestamp: new Date().toISOString()
            };
        }
        return null;
    }

    capturarSalasVisitadas() {
        if (window.cidadelaApp && window.cidadelaApp.modules.salas) {
            return window.cidadelaApp.modules.salas.getSalasVisitadas().map(sala => ({
                numero: sala.numero,
                badges: [...sala.badges],
                anotacao: sala.anotacao,
                timestamp: new Date().toISOString()
            }));
        }
        return [];
    }

    calcularEstatisticas() {
        const salasVisitadas = this.capturarSalasVisitadas();
        
        return {
            tempoJogado: this.runAtual ? 
                Math.floor((new Date() - new Date(this.runAtual.dataInicio)) / 1000 / 60) : 0,
            salasExploradas: salasVisitadas.length,
            combatesRealizados: salasVisitadas.filter(sala => sala.badges.includes('duelo')).length,
            encantosUsados: window.cidadelaApp && window.cidadelaApp.modules.encantos ? 
                window.cidadelaApp.modules.encantos.getEncantosUsados().length : 0
        };
    }

    renderRuns() {
        if (!this.elements.runsLista) return;

        const container = this.elements.runsLista;
        container.innerHTML = '';

        if (this.runs.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma run salva ainda</p>';
            return;
        }

        // Ordenar runs por data (mais recente primeiro)
        const runsSorted = [...this.runs].sort((a, b) => 
            new Date(b.dataUltimaAtualizacao) - new Date(a.dataUltimaAtualizacao)
        );

        runsSorted.forEach(run => {
            const runCard = this.createRunCard(run);
            container.appendChild(runCard);
        });
    }

    createRunCard(run) {
        const card = document.createElement('div');
        card.className = 'run-card';
        
        if (run.favorita) {
            card.classList.add('favorita');
        }

        const dataInicio = new Date(run.dataInicio);
        const dataAtualizacao = new Date(run.dataUltimaAtualizacao);

        card.innerHTML = `
            <div class="run-header">
                <div class="run-titulo">${run.titulo}</div>
                <div class="run-data">
                    Criada: ${window.CidadelaApp.formatDate(dataInicio)}<br>
                    Atualizada: ${window.CidadelaApp.formatDate(dataAtualizacao)}
                </div>
            </div>
            <div class="run-info">
                <div class="run-stat">
                    <div class="run-stat-label">Sala Atual</div>
                    <div class="run-stat-value">${run.salaAtual}</div>
                </div>
                <div class="run-stat">
                    <div class="run-stat-label">Salas Exploradas</div>
                    <div class="run-stat-value">${run.salasVisitadas.length}</div>
                </div>
                <div class="run-stat">
                    <div class="run-stat-label">Tempo (min)</div>
                    <div class="run-stat-value">${run.estatisticas.tempoJogado}</div>
                </div>
                <div class="run-stat">
                    <div class="run-stat-label">Combates</div>
                    <div class="run-stat-value">${run.estatisticas.combatesRealizados}</div>
                </div>
            </div>
            <div class="run-actions">
                <button onclick="window.cidadelaApp.modules.runs.carregarRun(${run.id})" class="btn-primary">
                    📂 Carregar
                </button>
                <button onclick="window.cidadelaApp.modules.runs.toggleFavorita(${run.id})" class="btn-secondary">
                    ${run.favorita ? '⭐' : '☆'} Favorita
                </button>
                <button onclick="window.cidadelaApp.modules.runs.duplicarRun(${run.id})" class="btn-secondary">
                    📋 Duplicar
                </button>
                <button onclick="window.cidadelaApp.modules.runs.excluirRun(${run.id})" class="btn-secondary">
                    🗑️ Excluir
                </button>
            </div>
        `;

        return card;
    }

    carregarRun(runId) {
        const run = this.runs.find(r => r.id === runId);
        if (!run) {
            window.CidadelaApp.showNotification('Run não encontrada!', 'error');
            return;
        }

        // Confirmar carregamento
        if (!confirm(`Carregar a run "${run.titulo}"? Isso substituirá o progresso atual.`)) {
            return;
        }

        try {
            // Carregar ficha
            if (run.fichaInicial && window.cidadelaApp.modules.ficha) {
                const ficha = window.cidadelaApp.modules.ficha;
                ficha.atributos = { ...run.fichaInicial.atributos };
                ficha.inventario = { ...run.fichaInicial.inventario };
                ficha.anotacoes = run.fichaInicial.anotacoes;
                ficha.salaAtual = run.salaAtual;
                ficha.updateUI();
            }

            // Carregar salas visitadas
            if (run.salasVisitadas && window.cidadelaApp.modules.salas) {
                const salasModule = window.cidadelaApp.modules.salas;
                
                // Resetar todas as salas
                Object.values(salasModule.salas).forEach(sala => {
                    sala.visitada = false;
                    sala.badges = [];
                    sala.anotacao = '';
                });

                // Aplicar dados da run
                run.salasVisitadas.forEach(salaData => {
                    if (salasModule.salas[salaData.numero]) {
                        salasModule.salas[salaData.numero].visitada = true;
                        salasModule.salas[salaData.numero].badges = [...salaData.badges];
                        salasModule.salas[salaData.numero].anotacao = salaData.anotacao;
                    }
                });

                salasModule.setSalaAtual(run.salaAtual);
                salasModule.renderSalas();
            }

            // Definir como run atual
            this.runAtual = { ...run };
            this.saveRunsData();

            // Salvar estado do jogo
            window.cidadelaApp.saveGameData();

            window.CidadelaApp.showNotification(`Run "${run.titulo}" carregada!`, 'success');
        } catch (error) {
            console.error('Erro ao carregar run:', error);
            window.CidadelaApp.showNotification('Erro ao carregar run!', 'error');
        }
    }

    toggleFavorita(runId) {
        const run = this.runs.find(r => r.id === runId);
        if (run) {
            run.favorita = !run.favorita;
            this.saveRunsData();
            this.renderRuns();
            
            const status = run.favorita ? 'adicionada às' : 'removida das';
            window.CidadelaApp.showNotification(`Run ${status} favoritas`, 'info');
        }
    }

    duplicarRun(runId) {
        const run = this.runs.find(r => r.id === runId);
        if (!run) return;

        const novaRun = {
            ...run,
            id: Date.now(),
            titulo: `${run.titulo} (Cópia)`,
            dataInicio: new Date().toISOString(),
            dataUltimaAtualizacao: new Date().toISOString(),
            favorita: false
        };

        this.runs.push(novaRun);
        this.saveRunsData();
        this.renderRuns();
        
        window.CidadelaApp.showNotification('Run duplicada!', 'success');
    }

    excluirRun(runId) {
        const run = this.runs.find(r => r.id === runId);
        if (!run) return;

        if (!confirm(`Excluir a run "${run.titulo}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        this.runs = this.runs.filter(r => r.id !== runId);
        
        // Se era a run atual, limpar
        if (this.runAtual && this.runAtual.id === runId) {
            this.runAtual = null;
            localStorage.removeItem('cidadela-current-run');
        }

        this.saveRunsData();
        this.renderRuns();
        
        window.CidadelaApp.showNotification('Run excluída!', 'info');
    }

    exportarRuns() {
        if (this.runs.length === 0) {
            window.CidadelaApp.showNotification('Nenhuma run para exportar!', 'warning');
            return;
        }

        const dataToExport = {
            runs: this.runs,
            runAtual: this.runAtual,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cidadela-runs-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        window.CidadelaApp.showNotification('Runs exportadas com sucesso!', 'success');
    }

    importarRuns() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (!importedData.runs || !Array.isArray(importedData.runs)) {
                        throw new Error('Formato de arquivo inválido');
                    }

                    // Confirmar importação
                    const confirmMsg = `Importar ${importedData.runs.length} runs? Isso substituirá todas as runs existentes.`;
                    if (!confirm(confirmMsg)) {
                        return;
                    }

                    // Importar runs
                    this.runs = importedData.runs;
                    if (importedData.runAtual) {
                        this.runAtual = importedData.runAtual;
                    }

                    this.saveRunsData();
                    this.renderRuns();
                    
                    window.CidadelaApp.showNotification('Runs importadas com sucesso!', 'success');
                } catch (error) {
                    console.error('Erro ao importar runs:', error);
                    window.CidadelaApp.showNotification('Erro ao importar runs!', 'error');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    // Métodos para registrar eventos durante o jogo
    registrarDecisao(salaOrigem, salaDestino, descricao) {
        if (this.runAtual) {
            this.runAtual.decisoes.push({
                timestamp: new Date().toISOString(),
                salaOrigem,
                salaDestino,
                descricao
            });
            this.saveRunsData();
        }
    }

    registrarCombate(inimigos, resultado) {
        if (this.runAtual) {
            this.runAtual.estatisticas.combatesRealizados++;
            this.saveRunsData();
        }
    }

    registrarEncantoUsado(encanto) {
        if (this.runAtual) {
            this.runAtual.estatisticas.encantosUsados++;
            this.saveRunsData();
        }
    }

    onGameStateUpdate(sourceModule, data) {
        // Atualizar run atual automaticamente
        if (this.runAtual) {
            this.runAtual.dataUltimaAtualizacao = new Date().toISOString();
            this.saveRunsData();
        }
    }

    onDataLoaded(gameState) {
        this.loadRunsData();
        this.renderRuns();
    }

    onTabActivated() {
        this.renderRuns();
    }

    // Métodos públicos para outros módulos
    getRunAtual() {
        return this.runAtual;
    }

    getRuns() {
        return [...this.runs];
    }

    getRunsFavoritas() {
        return this.runs.filter(run => run.favorita);
    }

    getTotalRuns() {
        return this.runs.length;
    }

    getEstatisticasGerais() {
        return {
            totalRuns: this.runs.length,
            runsFavoritas: this.getRunsFavoritas().length,
            tempoTotalJogado: this.runs.reduce((total, run) => total + (run.estatisticas.tempoJogado || 0), 0),
            totalSalasExploradas: this.runs.reduce((total, run) => total + (run.estatisticas.salasExploradas || 0), 0),
            totalCombates: this.runs.reduce((total, run) => total + (run.estatisticas.combatesRealizados || 0), 0)
        };
    }
}

