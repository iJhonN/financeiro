DESIGN.md — Wolf Finance v3 (Sistema de Design e Interface)
Documento mestre de tokens, componentes, experiência de utilização (UX), acessibilidade e wireframes.
As regras de negócio e de rotas estão documentadas em base.md.
As especificações relacionais e esquemas estão documentados em bancodedados.md.

1. Princípios e Filosofia Visual (Design "Anti-IA")
Elegância Sóbria (Premium): Fim dos clichês de código gerado. Proibido o uso de degradês exagerados (neon/glassmorphism), sombras desnecessárias e excesso de emojis. A interface usa cores sólidas, fundos neutros e bordas finas (ex: border-white/10).

Respiro e Espaçamento (Whitespace): A interface não deve ser "espremida". Uso de paddings e gaps generosos e padronizados (16px a 24px entre blocos) para criar uma hierarquia visual limpa.

Fim da Poluição Tipográfica: Eliminação rigorosa do uso excessivo de uppercase, italic e font-black em massa. Títulos, números e dados vitais utilizam fonte reta, com pesos estruturados (Medium, Semibold) e numerais monoespaçados (tabular-nums).

Semântica Subtil: As cores de receita (verde) e despesa (vermelho/rosa) são dessaturadas e agradáveis aos olhos. Sempre acompanhadas de símbolos auxiliares (+ / -) para garantir acessibilidade, sem preenchimentos berrantes.

Microinterações Táteis: O movimento deve ser funcional e mecânico. Botões e cartões respondem ao clique com redução sutil de escala (active:scale-[0.98]) e opacidade no hover, eliminando animações decorativas de pulse ou bounce.

Fim dos Modais no Mobile: Toda inserção de dados complexa no telemóvel ocorre em Bottom Sheets (folhas deslizantes inferiores) que respeitam o teclado, melhorando drasticamente a ergonomia (operação unimanual).

2. Tokens de Design (CSS Variables)
2.1 Cores — Modo Escuro (Padrão da Aplicação)
Fundo e Superfícies:

--bg: #0A0F1D (Fundo estrutural e respiro profundo)

--surface-1: #111827 (Cartões e blocos de conteúdo primários)

--surface-2: #1A2336 (Bottom sheets, modais e fundos de input)

--surface-3: #243049 (Estados de hover e seleção)

Bordas (Sutis e Elegantes):

--border: #1E293B (Bordas divisórias ultrafinas)

--border-strong: #334155 (Bordas de destaque de elementos ativos)

Tipografia:

--text: #F8FAFC (Texto principal, branco suave para não ofuscar)

--text-muted: #94A3B8 (Texto secundário, dados de apoio)

--text-subtle: #64748B (Identificadores inativos e placeholders)

2.2 Cores Semânticas (Dessaturadas)
--income: #10B981 (Verde esmeralda equilibrado para entradas)

--income-bg: rgba(16, 185, 129, 0.1) (Fundo suave para chips e ícones)

--expense: #F43F5E (Rosa/vermelho elegante para saídas)

--expense-bg: rgba(244, 63, 94, 0.1) (Fundo suave para chips e ícones)

--warning: #F59E0B (Pendências e alertas)

--danger: #EF4444 (Ações destrutivas exclusivas)

--focus-ring: #3B82F6 (Anel de acessibilidade para navegação por teclado, opacidade 50%)

2.3 Temas Primários (Opcionais no Perfil)
Azul (Padrão): --primary: #2563EB | --primary-hover: #3B82F6

Esmeralda: --primary: #059669 | --primary-hover: #10B981

Monocromático (Premium): --primary: #F8FAFC | --primary-hover: #E2E8F0 | --on-primary: #0A0F1D

2.4 Identidade Visual Módulo Wolf Driver
O Driver utiliza o acento Âmbar (--module-driver: #F59E0B) exclusivamente em ícones de destaque e chamadas de ação operacionais, mantendo as superfícies escuras padrão.

3. Tipografia e Escalas
Família Principal: Inter (Interface e corpo geral em pesos Regular, Medium e Semibold).

Família Numérica (Obrigatório): Inter com font-variant-numeric: tabular-nums.

Escala Padronizada (Mobile / Desktop):

display (32px / 40px): Saldo geral consolidado (Semibold, Tabular).

h1 (24px / 28px): Títulos de páginas operacionais (Semibold).

h2 (18px / 20px): Títulos de secções e cartões (Medium).

body (15px / 16px): Leitura principal, listas e formulários (Regular).

body-sm (14px): Textos de apoio e descrições curtas (Regular, cor muted).

label (12px): Rótulos de inputs e chips (Medium, espaçamento de letras sutil: 0.02em).

amount (16px tabular): Valores em listas de transação (Medium).

Nota Restrita: Tipografias inferiores a 12px são permanentemente banidas. Itálico deve ser usado apenas excepcionalmente em citações ou estados de espaço reservado (placeholders).

4. Estrutura de Interface e Navegação
4.1 Shell de Aplicação Móvel (AppShell)
Cabeçalho Superior Fixo: Logótipo minimalista, seletor de mês ativo (MonthPicker) centralizado, atalho de ocultar saldos (ícone de olho) alinhado à direita.

Barra Inferior Persistente (Bottom Navigation):

Finanças: 1. Início | 2. Lançamentos | 3. [ + ] (FAB Central) | 4. Cartões | 5. Mais

Driver: 1. Painel | 2. Ganhos | 3. [ + ] (FAB Central) | 4. Custos | 5. Mais

Botão Central Flutuante (+): Destacado sutilmente do fundo, aciona imediatamente a Bottom Sheet de lançamento sem sobrepor a barra de navegação principal.

4.2 Componente Seletor de Mês (MonthPicker)
Visual: Seta Esquerda | Nome do Mês e Ano (Ex: Outubro 2026) | Seta Direita.

Engenharia: Modifica a URL (?mes=2026-10), garantindo carregamento server-side sem mutação de estado local propenso a erros de transição de dias de calendário.

5. Biblioteca de Componentes Base
5.1 Componentes de Entrada
MoneyInput: Input gigantesco e limpo, sem bordas pesadas. Teclado numérico móvel invocado nativamente (inputmode="numeric").

TextField: Design plano. Rótulo legível acima do campo, cor de fundo --surface-2, sem borda a menos que em foco (focus:border-primary focus:ring-1).

SegmentedControl: Alternador horizontal em formato de pílula maciça (Despesa / Receita), com animação de slide suave no fundo ativo.

Bottom Sheet: Substitui modais. Nasce da base da tela, ocupa 85% da altura e possui um indicador de arraste (drag handle) no topo. Cobre a tela com um overlay escuro (blur opcional e contido).

5.2 Apresentação e Feedback
TransactionRow: Fila de extrato elegante. Ícone de categoria centralizado num círculo --surface-2. Título em texto base, data/cartão em --text-muted. Valor à extrema direita (cor semântica ou branco).

StatCard: Cartão de métrica sem ruído visual. Rótulo descritivo sutil, montante em destaque, sem fundos coloridos inteiros (apenas a tipografia indica a cor do valor se necessário).

UndoBar (Snack Bar): Faixa escura, flutuante na base da tela, exibida após excluir algo ou liquidar fatura. Dura 10 segundos, com botão "Desfazer" em texto.

Skeleton: Blocos de carregamento em #1A2336 pulsando suavemente a opacidade, sem animações extravagantes.

6. Especificação e Wireframes de Ecrãs Principais
6.1 Dashboard Financeiro (Início)
Topo: Mês selecionado e botões de utilidade globais.

Cartão Principal: Saldo real no centro, em destaque máximo. Subtítulo com o saldo previsto no encerramento da competência em cinza.

Grelha de Resumo: Dois StatCards minimalistas lado a lado: Total de Receitas e Total de Despesas Pagas.

Timeline Recente: Lista das últimas movimentações com scroll vertical suave, permitindo acesso rápido sem poluir a tela.

6.2 Lançamento Unificado (Bottom Sheet)
Ordem de Preenchimento Dinâmico:

Valor (MoneyInput em grande destaque).

Alternador de Natureza (Despesa | Receita).

Campo de Descrição.

Forma de Pagamento (Chips rápidos e espaçados).

Mais Opções (Acordeão discreto para parcelamentos, recorrência e alteração de data).

Botão "Salvar Lançamento" robusto, afixado na base do teclado.

6.3 Painel Operacional Wolf Driver
Acento Visual: Pequenos detalhes em âmbar no header e botão primário.

Indicadores Principais: Faturamento do Turno vs Custo Operacional, exibidos com clareza em numerais grandes.

Métricas Secundárias: Grid com dados de R$/km e horas ativas, alinhados com perfeição.

Veículo Ativo: Card informativo simples que permite troca de veículo com um toque.

7. Diretrizes de Acessibilidade e Auditoria (WCAG 2.2 AA)
Rácio de Contraste Garantido: A paleta definida no item 2 garante contraste mínimo de 4.5:1 para qualquer texto sobre superfícies e fundos.

Áreas de Toque Reais: Todos os botões, ícones acionáveis, chips e campos de entrada possuem área de interação invisível ou visível de no mínimo 44x44px.

Navegação por Teclado: Foco do navegador mantido e evidenciado através do contorno --focus-ring. Nenhuma funcionalidade oculta exclusivamente sob "hover".

Sem Dependência Exclusiva de Cor: Todo o erro de formulário é reportado por texto. Todo o lançamento de despesa traz um ícone correspondente além da cor.