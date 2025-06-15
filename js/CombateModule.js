// CombateModule.js - Lida com a lógica do combate semi-automatizado

export class CombateModule {
    constructor(gameState) {
        this.gameState = gameState;
        this.elements = {};
        this.combateAtivo = false;
        this.inimigos = [];
        this.inimigoAtual = 0;
        this.roundAtual = 1;
        this.permitirSorte = false;
        this.aguardandoSorte = false;
        this.ultimoResultado = null;
    }

    async init() {
        this.bindElements();
        this.setupEventListeners();
        this.resetCombate();
        console.log('⚔️ CombateModule inicializado');
    }

    bindElements() {
        this.elements.inimigosContainer = document.getElementById('inimigos-container');
        this.elements.adicionarInimigo = document.getElementById('adicionar-inimigo');
        this.elements.removerInimigo = document.getElementById('remover-inimigo');
        this.elements.permitirSorte = document.getElementById('permitir-sorte');
        this.elements.iniciarCombate = document.getElementById('iniciar-combate');
        this.elements.combateArena = document.getElementById('combate-arena');
        this.elements.combateLog = document.getElementById('combate-log');
        this.elements.proximoRound = document.getElementById('proximo-round');
        this.elements.usarSorte = document.getElementById('usar-sorte');
        this.elements.reiniciarCombate = document.getElementById('reiniciar-combate');
    }

    setupEventListeners() {
        if (this.elements.adicionarInimigo) {
            this.elements.adicionarInimigo.addEventListener('click', () => this.adicionarInimigo());
        }

        if (this.elements.removerInimigo) {
            this.elements.removerInimigo.addEventListener('click', () => this.removerInimigo());
        }

        if (this.elements.iniciarCombate) {
            this.elements.iniciarCombate.addEventListener('click', () => this.iniciarCombate());
        }

        if (this.elements.proximoRound) {
            this.elements.proximoRound.addEventListener('click', () => this.executarRound());
        }

        if (this.elements.usarSorte) {
            this.elements.usarSorte.addEventListener('click', () => this.usarSorte());
        }

        if (this.elements.reiniciarCombate) {
            this.elements.reiniciarCombate.addEventListener('click', () => this.resetCombate());
        }
    }

    adicionarInimigo() {
        const novoInimigo = {
            id: Date.now(),
            nome: '',
            habilidade: 8,
            energia: 6,
            modificador: 0
        };

        this.inimigos.push(novoInimigo);
        this.renderInimigos();
    }

    removerInimigo() {
        if (this.inimigos.length > 1) {
            this.inimigos.pop();
            this.renderInimigos();
        } else {
            window.CidadelaApp.showNotification('Deve haver pelo menos um inimigo', 'warning');
        }
    }

    renderInimigos() {
        if (!this.elements.inimigosContainer) return;

        const container = this.elements.inimigosContainer;
        container.innerHTML = '';

        this.inimigos.forEach((inimigo, index) => {
            const inimigoCard = this.createInimigoCard(inimigo, index);
            container.appendChild(inimigoCard);
        });
    }

    createInimigoCard(inimigo, index) {
        const card = document.createElement('div');
        card.className = 'inimigo-card';
        
        card.innerHTML = `
            <h4>Inimigo ${index + 1}</h4>
            <label>
                Nome:
                <input type="text" 
                       class="inimigo-nome" 
                       placeholder="Nome do inimigo"
                       value="${inimigo.nome}"
                       data-index="${index}"
                       data-field="nome">
            </label>
            <label>
                Habilidade:
                <input type="number" 
                       class="inimigo-habilidade" 
                       min="1" max="20" 
                       value="${inimigo.habilidade}"
                       data-index="${index}"
                       data-field="habilidade">
            </label>
            <label>
                Energia:
                <input type="number" 
                       class="inimigo-energia" 
                       min="1" max="30" 
                       value="${inimigo.energia}"
                       data-index="${index}"
                       data-field="energia">
            </label>
            <label>
                Modificador:
                <input type="number" 
                       class="inimigo-modificador" 
                       value="${inimigo.modificador}"
                       data-index="${index}"
                       data-field="modificador">
            </label>
        `;

        // Event listeners para os campos
        const inputs = card.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                const field = e.target.getAttribute('data-field');
                const value = field === 'nome' ? e.target.value : parseInt(e.target.value) || 0;
                
                if (this.inimigos[index]) {
                    this.inimigos[index][field] = value;
                }
            });
        });

        return card;
    }

    iniciarCombate() {
        // Validar inimigos
        if (this.inimigos.length === 0) {
            window.CidadelaApp.showNotification('Adicione pelo menos um inimigo', 'error');
            return;
        }

        // Verificar se todos os inimigos têm dados válidos
        const inimigosValidos = this.inimigos.every(inimigo => 
            inimigo.habilidade > 0 && inimigo.energia > 0
        );

        if (!inimigosValidos) {
            window.CidadelaApp.showNotification('Todos os inimigos devem ter Habilidade e Energia > 0', 'error');
            return;
        }

        // Configurar combate
        this.combateAtivo = true;
        this.inimigoAtual = 0;
        this.roundAtual = 1;
        this.permitirSorte = this.elements.permitirSorte.checked;
        this.aguardandoSorte = false;

        // Mostrar arena de combate
        if (this.elements.combateArena) {
            this.elements.combateArena.style.display = 'block';
        }

        // Limpar log
        this.clearLog();
        this.addLogEntry('🏁 Combate iniciado!', 'sistema');
        
        // Mostrar informações dos inimigos
        this.inimigos.forEach((inimigo, index) => {
            const nome = inimigo.nome || `Inimigo ${index + 1}`;
            this.addLogEntry(
                `${nome}: Habilidade ${inimigo.habilidade}, Energia ${inimigo.energia}${inimigo.modificador !== 0 ? `, Modificador ${inimigo.modificador > 0 ? '+' : ''}${inimigo.modificador}` : ''}`,
                'sistema'
            );
        });

        this.addLogEntry('', 'sistema');
        this.addLogEntry('Clique em "Próximo Round" para começar!', 'sistema');

        window.CidadelaApp.showNotification('Combate iniciado!', 'success');
    }

    executarRound() {
        if (!this.combateAtivo) return;

        if (this.aguardandoSorte) {
            window.CidadelaApp.showNotification('Decida se quer usar Sorte primeiro!', 'warning');
            return;
        }

        // Verificar se ainda há inimigos vivos
        const inimigosVivos = this.inimigos.filter(inimigo => inimigo.energia > 0);
        if (inimigosVivos.length === 0) {
            this.finalizarCombate(true);
            return;
        }

        // Verificar se jogador ainda está vivo
        const energiaJogador = this.getEnergiaJogador();
        if (energiaJogador <= 0) {
            this.finalizarCombate(false);
            return;
        }

        // Selecionar próximo inimigo vivo
        while (this.inimigoAtual < this.inimigos.length && this.inimigos[this.inimigoAtual].energia <= 0) {
            this.inimigoAtual++;
        }

        if (this.inimigoAtual >= this.inimigos.length) {
            this.inimigoAtual = 0;
            this.roundAtual++;
        }

        const inimigo = this.inimigos[this.inimigoAtual];
        if (inimigo.energia <= 0) {
            this.executarRound(); // Pular para próximo inimigo
            return;
        }

        this.addLogEntry(`--- Round ${this.roundAtual} ---`, 'sistema');
        
        const nomeInimigo = inimigo.nome || `Inimigo ${this.inimigoAtual + 1}`;
        this.addLogEntry(`Lutando contra: ${nomeInimigo}`, 'sistema');

        // Executar ataque
        this.executarAtaque(inimigo);
        
        this.inimigoAtual++;
    }

    executarAtaque(inimigo) {
        // Obter atributos do jogador
        const habilidadeJogador = this.getHabilidadeJogador();
        
        // Rolagens de ataque
        const dadosJogador = window.CidadelaApp.rollDice(6, 2);
        const dadosInimigo = window.CidadelaApp.rollDice(6, 2);
        
        // Calcular totais
        const totalJogador = dadosJogador + habilidadeJogador;
        const totalInimigo = dadosInimigo + inimigo.habilidade + inimigo.modificador;

        // Log das rolagens
        this.addLogEntry(`Você: ${dadosJogador} + ${habilidadeJogador} = ${totalJogador}`, 'jogador');
        this.addLogEntry(`${inimigo.nome || 'Inimigo'}: ${dadosInimigo} + ${inimigo.habilidade}${inimigo.modificador !== 0 ? ` + ${inimigo.modificador}` : ''} = ${totalInimigo}`, 'inimigo');

        // Determinar resultado
        this.ultimoResultado = {
            jogador: totalJogador,
            inimigo: totalInimigo,
            inimigoIndex: this.inimigoAtual
        };

        if (totalJogador > totalInimigo) {
            // Jogador vence
            inimigo.energia = Math.max(0, inimigo.energia - 2);
            this.addLogEntry(`Você acerta! ${inimigo.nome || 'Inimigo'} perde 2 de Energia (${inimigo.energia} restante)`, 'jogador');
            
            if (inimigo.energia <= 0) {
                this.addLogEntry(`${inimigo.nome || 'Inimigo'} foi derrotado!`, 'sistema');
            }
        } else if (totalInimigo > totalJogador) {
            // Inimigo vence
            if (this.permitirSorte && this.getSorteJogador() > 0) {
                this.addLogEntry(`${inimigo.nome || 'Inimigo'} acerta! Você pode usar Sorte para tentar evitar o dano.`, 'inimigo');
                this.aguardandoSorte = true;
                this.elements.usarSorte.style.display = 'inline-block';
                return;
            } else {
                this.aplicarDanoJogador();
            }
        } else {
            // Empate
            this.addLogEntry('Empate! Ninguém se fere neste round.', 'sistema');
        }

        this.addLogEntry('', 'sistema');
    }

    aplicarDanoJogador() {
        const energiaAtual = this.getEnergiaJogador();
        const novaEnergia = Math.max(0, energiaAtual - 2);
        this.setEnergiaJogador(novaEnergia);
        
        this.addLogEntry(`Você é atingido! Perde 2 de Energia (${novaEnergia} restante)`, 'inimigo');
        
        if (novaEnergia <= 0) {
            this.addLogEntry('Você foi derrotado!', 'sistema');
        }
        
        this.addLogEntry('', 'sistema');
    }

    usarSorte() {
        if (!this.aguardandoSorte || !this.ultimoResultado) return;

        const sorteAtual = this.getSorteJogador();
        if (sorteAtual <= 0) {
            window.CidadelaApp.showNotification('Você não tem pontos de Sorte!', 'error');
            return;
        }

        // Rolar dados para teste de Sorte
        const dadosSorte = window.CidadelaApp.rollDice(6, 2);
        const sucessoSorte = dadosSorte <= sorteAtual;

        // Reduzir Sorte
        this.setSorteJogador(sorteAtual - 1);

        this.addLogEntry(`Teste de Sorte: ${dadosSorte} vs ${sorteAtual} - ${sucessoSorte ? 'SUCESSO' : 'FALHA'}`, 'sistema');

        if (sucessoSorte) {
            this.addLogEntry('Você evita o dano com sorte!', 'jogador');
        } else {
            this.addLogEntry('A sorte não te favorece...', 'sistema');
            this.aplicarDanoJogador();
        }

        this.aguardandoSorte = false;
        this.elements.usarSorte.style.display = 'none';
        this.addLogEntry('', 'sistema');
    }

    finalizarCombate(vitoria) {
        this.combateAtivo = false;
        this.aguardandoSorte = false;
        
        if (this.elements.usarSorte) {
            this.elements.usarSorte.style.display = 'none';
        }

        if (vitoria) {
            this.addLogEntry('🎉 VITÓRIA! Todos os inimigos foram derrotados!', 'sistema');
            window.CidadelaApp.showNotification('Vitória no combate!', 'success');
        } else {
            this.addLogEntry('💀 DERROTA! Você foi derrotado...', 'sistema');
            window.CidadelaApp.showNotification('Você foi derrotado!', 'error');
        }
    }

    resetCombate() {
        this.combateAtivo = false;
        this.aguardandoSorte = false;
        this.inimigoAtual = 0;
        this.roundAtual = 1;
        this.ultimoResultado = null;

        // Resetar inimigos para configuração padrão
        this.inimigos = [{
            id: Date.now(),
            nome: '',
            habilidade: 8,
            energia: 6,
            modificador: 0
        }];

        this.renderInimigos();

        // Esconder arena
        if (this.elements.combateArena) {
            this.elements.combateArena.style.display = 'none';
        }

        if (this.elements.usarSorte) {
            this.elements.usarSorte.style.display = 'none';
        }

        this.clearLog();
        window.CidadelaApp.showNotification('Combate resetado', 'info');
    }

    // Métodos de log
    clearLog() {
        if (this.elements.combateLog) {
            this.elements.combateLog.innerHTML = '';
        }
    }

    addLogEntry(texto, tipo = 'sistema') {
        if (!this.elements.combateLog) return;

        const entry = document.createElement('div');
        entry.className = `log-entry ${tipo}`;
        entry.textContent = texto;
        
        this.elements.combateLog.appendChild(entry);
        this.elements.combateLog.scrollTop = this.elements.combateLog.scrollHeight;
    }

    // Métodos para interagir com a ficha do jogador
    getHabilidadeJogador() {
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            return window.cidadelaApp.modules.ficha.getAtributo('habilidade', 'atual');
        }
        return 12; // Valor padrão
    }

    getEnergiaJogador() {
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            return window.cidadelaApp.modules.ficha.getAtributo('energia', 'atual');
        }
        return 20; // Valor padrão
    }

    getSorteJogador() {
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            return window.cidadelaApp.modules.ficha.getAtributo('sorte', 'atual');
        }
        return 10; // Valor padrão
    }

    setEnergiaJogador(valor) {
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            window.cidadelaApp.modules.ficha.setAtributo('energia', 'atual', valor);
        }
    }

    setSorteJogador(valor) {
        if (window.cidadelaApp && window.cidadelaApp.modules.ficha) {
            window.cidadelaApp.modules.ficha.setAtributo('sorte', 'atual', valor);
        }
    }

    onGameStateUpdate(sourceModule, data) {
        // Atualizar display se necessário
    }

    onDataLoaded(gameState) {
        // Combate não salva estado entre sessões
        this.resetCombate();
    }

    onTabActivated() {
        // Rerender se necessário
        this.renderInimigos();
    }

    // Métodos públicos para outros módulos
    isCombateAtivo() {
        return this.combateAtivo;
    }

    getInimigos() {
        return [...this.inimigos];
    }

    adicionarInimigoCustom(nome, habilidade, energia, modificador = 0) {
        const novoInimigo = {
            id: Date.now(),
            nome: nome,
            habilidade: habilidade,
            energia: energia,
            modificador: modificador
        };

        this.inimigos.push(novoInimigo);
        this.renderInimigos();
        return novoInimigo;
    }
}

