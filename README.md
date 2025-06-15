# Web App "A Cidadela do Caos" - Documentação

## Visão Geral

O Web App "A Cidadela do Caos" é um sistema digital completo e modular para substituir a ficha de aventura física do livro-jogo homônimo. Desenvolvido com HTML, CSS e JavaScript puro (Vanilla), oferece uma experiência interativa e moderna para jogadores de RPG solo.

## Características Principais

### ✅ Tecnologias Utilizadas
- **HTML5**: Estrutura SPA (Single Page Application)
- **CSS3**: Design responsivo com gradientes e animações
- **JavaScript ES6**: Módulos com import/export
- **LocalStorage**: Persistência de dados local

### ✅ Funcionalidades Implementadas

#### 1. 📋 Ficha Digital do Jogador
- **Atributos Editáveis**: Habilidade, Energia, Sorte, Magia (valores iniciais e atuais)
- **Geração Aleatória**: Sistema de dados automático (1d6+6 para Habilidade, 2d6+12 para Energia, etc.)
- **Validação Inteligente**: Alertas para valores fora das recomendações do livro
- **Inventário Completo**: Ouro, itens levados, encantos selecionados
- **Anotações Livres**: Campo de texto para observações da aventura
- **Localização Atual**: Controle da sala atual e próximas salas

#### 2. 🗺️ Gerenciamento de Salas (1-400)
- **Grid Visual**: Todas as 400 salas em layout organizado
- **Sistema de Badges**: 7 tipos de interação (💰 Loot, ⚔️ Duelo, 🧪 Sorte, ☠️ Morte, 🎁 Item, 💬 Conversa, ⚠️ Armadilha)
- **Marcação de Status**: Salas visitadas, sala atual destacada
- **Anotações Individuais**: Campo de texto para cada sala
- **Navegação Rápida**: Busca direta por número da sala
- **Filtros**: Visualizar todas as salas ou apenas visitadas

#### 3. ✨ Sistema de Encantos Mágicos
- **12 Encantos Completos**: Todos os encantos do livro com descrições detalhadas
- **Seleção Manual**: Baseada no valor de Magia do personagem
- **Geração Aleatória**: Rolagem de 2d6 para quantidade automática
- **Controle de Uso**: Cada encanto consome 1 ponto de Magia
- **Status Visual**: Encantos selecionados, usados e disponíveis
- **Integração com Ficha**: Sincronização automática com a ficha do jogador

#### 4. ⚔️ Sistema de Combate Semi-Automatizado
- **Configuração Flexível**: Múltiplos inimigos com atributos customizáveis
- **Modificadores**: Sistema de bônus/penalidades por sala
- **Combate Automático**: Rolagens de 2d6 + Habilidade
- **Sistema de Sorte**: Opção de usar Sorte para evitar dano
- **Log Detalhado**: Histórico completo de cada round
- **Reutilizável**: Não salva logs, permitindo múltiplos combates

#### 5. 💾 Gerenciamento de Runs
- **Salvamento Automático**: Data e hora de criação/atualização
- **Sistema de Favoritos**: Marcar runs importantes
- **Dados Completos**: Ficha inicial, salas visitadas, decisões, estatísticas
- **Exportar/Importar**: Backup e compartilhamento de dados
- **Estatísticas**: Tempo jogado, salas exploradas, combates realizados

## Estrutura Técnica

### Arquivos Principais
```
cidadela-do-caos/
├── index.html              # Interface principal (SPA)
├── styles.css              # Estilos globais organizados
└── js/
    ├── main.js             # Módulo central da aplicação
    ├── FichaModule.js      # Gerenciamento da ficha do jogador
    ├── SalasModule.js      # Sistema de salas e navegação
    ├── EncantosModule.js   # Sistema de encantos mágicos
    ├── CombateModule.js    # Sistema de combate automatizado
    └── RunsModule.js       # Gerenciamento de sessões
```

### Arquitetura Modular
- **main.js**: Coordena todos os módulos e gerencia o estado global
- **Comunicação entre Módulos**: Sistema de eventos para sincronização
- **Persistência**: LocalStorage para salvamento automático
- **Responsividade**: Layout adaptável para desktop e mobile

## Como Usar

### Iniciando uma Nova Aventura
1. **Acesse a Ficha**: Configure seus atributos manualmente ou use geração aleatória
2. **Selecione Encantos**: Escolha seus encantos mágicos baseado na Magia
3. **Crie uma Run**: Salve o estado inicial da aventura
4. **Navegue pelas Salas**: Use o grid para marcar progresso e fazer anotações

### Durante o Jogo
- **Combates**: Configure inimigos e deixe o sistema calcular automaticamente
- **Anotações**: Use os campos de texto para registrar informações importantes
- **Badges**: Marque interações nas salas para referência futura
- **Salvamento**: O progresso é salvo automaticamente

### Funcionalidades Avançadas
- **Múltiplas Runs**: Compare diferentes tentativas
- **Exportação**: Faça backup dos seus dados
- **Estatísticas**: Acompanhe seu progresso e desempenho

## Recursos Técnicos Destacados

### Interface Moderna
- **Design Gradiente**: Visual atrativo com cores temáticas
- **Animações Suaves**: Transições e efeitos visuais
- **Notificações**: Sistema de feedback para ações do usuário
- **Responsividade**: Funciona em qualquer dispositivo

### Sistema de Dados Robusto
- **Validação**: Verificação de integridade dos dados
- **Backup Automático**: Prevenção de perda de progresso
- **Sincronização**: Módulos sempre atualizados entre si

### Experiência do Usuário
- **Navegação Intuitiva**: Abas claras e organizadas
- **Feedback Visual**: Estados visuais para todas as ações
- **Acessibilidade**: Interface clara e fácil de usar

## Requisitos do Sistema

- **Navegador Moderno**: Chrome, Firefox, Safari, Edge (suporte a ES6 modules)
- **JavaScript Habilitado**: Necessário para funcionamento
- **Servidor HTTP**: Para desenvolvimento (módulos ES6 não funcionam via file://)

## Instalação e Execução

1. **Download**: Baixe todos os arquivos do projeto
2. **Servidor Local**: Execute um servidor HTTP na pasta do projeto
   ```bash
   python3 -m http.server 8000
   ```
3. **Acesso**: Abra http://localhost:8000 no navegador

## Status do Projeto

### ✅ Completamente Implementado
- [x] Estrutura HTML/CSS responsiva
- [x] Sistema de navegação entre abas
- [x] Ficha digital completa com validação
- [x] Gerenciamento de 400 salas com badges
- [x] Sistema completo de encantos mágicos
- [x] Combate semi-automatizado funcional
- [x] Gerenciamento de runs com estatísticas
- [x] Persistência de dados local
- [x] Exportação/importação de dados
- [x] Interface moderna e responsiva

### 🎯 Funcionalidades Testadas
- ✅ Navegação entre todas as abas
- ✅ Geração aleatória de atributos
- ✅ Seleção e uso de encantos
- ✅ Sistema de combate com dados
- ✅ Marcação de salas e badges
- ✅ Salvamento e carregamento de runs
- ✅ Sincronização entre módulos

## Conclusão

O Web App "A Cidadela do Caos" oferece uma experiência digital completa e moderna para jogadores de livros-jogo, substituindo efetivamente a necessidade de papel e caneta. Com sua arquitetura modular, interface intuitiva e funcionalidades abrangentes, proporciona uma aventura interativa e envolvente.

**Desenvolvido com tecnologias web modernas e foco na experiência do usuário, este sistema está pronto para uso imediato e futuras expansões.**

