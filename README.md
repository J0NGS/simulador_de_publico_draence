# Simulador de Público Draence

Ferramenta web para simular **público, receita, custos e lucro** de uma partida na Draence, ajustando mandante, visitante, momento das equipes, estádio e preço de cada setor. Funciona em tempo real, no navegador, sem build.

**Acesso:** https://j0ngs.github.io/simulador_de_publico_draence/

![Simulador de Público Draence](assets/img/calculadora_publico_draence.png)

## Como usar

1. **Confronto** — escolha mandante, visitante (opcional) e a importância do jogo.
2. **Momento das equipes** — clique nos últimos 5 jogos (V/E/D) ou informe a força do time manualmente.
3. **Estádio** — o estádio próprio é selecionado automaticamente; estádios neutros dobram preços e custos e cobram aluguel.
4. **Preços por setor** — ajuste campo ou slider. A escada de valor (+40% entre setores) é aplicada sozinha e há avisos de promoção, preço alto e exagerado. Use **Ver cálculo** em cada setor para o passo a passo.

O painel de resultado mostra lucro líquido, resumo financeiro, ocupação por setor e torcida ativa. A **Auditoria do cálculo** traz α (capacidade ativa), Φ (fator de evento), λ (eficiência) e a tabela por setor. As fórmulas completas estão em [`metodologia.html`](metodologia.html) e [`docs/modelo.md`](docs/modelo.md).

## Estrutura

```
├── index.html                 Simulador
├── metodologia.html           Como o modelo calcula (substitui o antigo modal)
├── assets/
│   ├── css/
│   │   ├── base.css           Design system Draence (tokens, tema claro/escuro, formulários, cards)
│   │   ├── simulador.css      Estilos do simulador
│   │   └── guia.css           Estilos da página de metodologia
│   ├── img/                   Logo e imagens
│   └── js/
│       ├── theme.js, icons.js Tema claro/escuro e sprite de ícones (Lucide)
│       ├── main.js            Ponto de entrada: liga estado, UI e simulação
│       ├── state.js, data.js  Estado da tela e carga dos JSON
│       ├── core/              Regras de negócio, sem DOM
│       │   ├── config.js      Constantes (preços base, custos, limites)
│       │   ├── logic.js       Demanda, elasticidade, distribuição por setor
│       │   ├── fans.js        Torcida total/ativa e visitante
│       │   ├── phase.js       Fase (momento) do time
│       │   ├── simulation.js  simulate(): estado → público, receita, custos, lucro
│       │   └── format.js      Moeda, números e parsing
│       └── ui/                Um módulo por bloco da tela
│           ├── matchup.js, phasePanel.js, stadium.js, pricing.js
│           └── results.js, audit.js, dom.js
├── data/                      Times, cidades e estádios (JSON)
├── scripts/                   Scripts Python que geram/atualizam os dados
└── docs/                      Documentação técnica do modelo
```

Fluxo: evento do usuário → atualiza `state` → `render()` chama `simulate()` (função pura) → módulos de `ui/` redesenham. Regras de negócio ficam em `core/` e podem ser testadas sem navegador.

## Tecnologias

HTML, CSS e JavaScript puro (módulos ES), sem framework e sem build. Identidade visual compartilhada com a calculadora de multas ([multa-draence](https://github.com/J0NGS/multa-draence)): escala sálvia + acento cobre, Big Shoulders Display / IBM Plex, tema claro e escuro automático.

## Rodando localmente

Os dados são carregados por `fetch` e os scripts são módulos ES, então é preciso um servidor HTTP:

```bash
python3 -m http.server 8000
# abra http://localhost:8000
```

## Customização

- **Cores e tipografia:** tokens em `assets/css/base.css`.
- **Preços base e custos:** `assets/js/core/config.js` (`STD_PRICES`, `STD_FIXED_COST`, `STD_VARIABLE_COST`).
- **Elasticidade, pesos de interesse, qualidade e prestígio:** `assets/js/core/logic.js`.
- **Dados:** `data/*.json` (use `scripts/` para regenerar a partir dos CSV).

## Autor

João Gonçalo ([@J0NGS](https://github.com/J0NGS)) — Copyright © 2025–2026. Todos os direitos reservados.
