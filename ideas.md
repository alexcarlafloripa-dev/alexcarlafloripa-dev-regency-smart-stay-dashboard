# Brainstorming de Design - Regency Square Smart Stay Dashboard

## Contexto
Dashboard interativo para visualização de unidades e fluxos de pagamento do empreendimento Regency Square Smart Stay. O objetivo é permitir que clientes naveguem pelas unidades, filtrem por andares/tipologia e visualizem os fluxos de pagamento de forma clara e visual.

---

<response>
<probability>0.08</probability>
<text>

## Ideia 1: Arquitetura Brutalista Digital

### Design Movement
Brutalismo Web com influências de interfaces industriais e plantas arquitetônicas.

### Core Principles
1. **Estrutura Exposta**: Grid visível, bordas duras, tipografia bold que não se esconde
2. **Contraste Extremo**: Preto e branco dominantes com acentos em amarelo construção
3. **Funcionalidade Crua**: Elementos que parecem "construídos", não decorados
4. **Hierarquia Brutal**: Tamanhos de fonte extremamente contrastantes

### Color Philosophy
- **Primário**: Preto carbono (#0A0A0A) - solidez, concreto
- **Secundário**: Branco gesso (#FAFAFA) - luz, espaço
- **Acento**: Amarelo construção (#FFD600) - atenção, ação, energia
- **Suporte**: Cinza concreto (#6B6B6B) - textura industrial

### Layout Paradigm
Layout de planta baixa: o site simula uma planta arquitetônica onde cada andar é uma "faixa" horizontal. Navegação por scroll horizontal dentro de cada andar, criando sensação de explorar um projeto real.

### Signature Elements
1. **Grid Blueprint**: Linhas de grade sutis como papel milimetrado
2. **Etiquetas Técnicas**: Informações em caixas com bordas tracejadas
3. **Setas Direcionais**: Indicadores de fluxo estilo planta técnica

### Interaction Philosophy
Interações diretas e mecânicas - cliques produzem feedback imediato com transições curtas e precisas. Hover states revelam informações técnicas adicionais.

### Animation
- Transições de 150ms com easing linear
- Cards "deslizam" como gavetas de arquivo
- Números de valores "contam" ao aparecer
- Linhas de conexão se desenham entre elementos relacionados

### Typography System
- **Display**: Space Grotesk Bold (títulos principais)
- **Body**: IBM Plex Mono (dados, valores, informações técnicas)
- **Hierarchy**: 48px → 24px → 16px → 12px

</text>
</response>

---

<response>
<probability>0.06</probability>
<text>

## Ideia 2: Elegância Imobiliária Premium

### Design Movement
Luxury Real Estate Design com influências de revistas de arquitetura high-end e galerias de arte.

### Core Principles
1. **Sofisticação Silenciosa**: Menos é mais, cada elemento tem propósito
2. **Materialidade Digital**: Texturas sutis que evocam mármore, madeira, metal
3. **Espaço como Luxo**: Margens generosas, respiro visual abundante
4. **Detalhes Refinados**: Micro-interações elegantes, transições suaves

### Color Philosophy
- **Primário**: Verde esmeralda profundo (#1B4332) - sofisticação, natureza, prosperidade
- **Secundário**: Creme champagne (#F5F0E8) - elegância, calor, exclusividade
- **Acento**: Dourado fosco (#C9A962) - luxo discreto, destaque premium
- **Suporte**: Grafite (#2D3436) - texto legível, ancoragem visual

### Layout Paradigm
Layout de galeria assimétrica: cards de unidades em tamanhos variados como uma exposição de arte. Unidades premium (2 dormitórios) recebem cards maiores. Navegação vertical com seções que ocupam viewport inteira.

### Signature Elements
1. **Bordas Douradas Sutis**: Linhas finas douradas em elementos de destaque
2. **Tipografia Serifada**: Elegância clássica nos títulos
3. **Fotografias Atmosféricas**: Imagens com tratamento cinematográfico

### Interaction Philosophy
Interações fluidas e orgânicas - elementos respondem com suavidade, como se flutuassem. Hover states são revelações graduais, não mudanças abruptas.

### Animation
- Transições de 400-600ms com easing cubic-bezier suave
- Fade-in com leve movimento ascendente ao entrar na viewport
- Cards expandem suavemente ao serem selecionados
- Valores aparecem com efeito de "revelação" da esquerda para direita

### Typography System
- **Display**: Playfair Display (títulos, nomes de unidades)
- **Body**: Lato Light/Regular (informações, valores)
- **Hierarchy**: 56px → 32px → 18px → 14px

</text>
</response>

---

<response>
<probability>0.07</probability>
<text>

## Ideia 3: Interface Tecnológica Imersiva

### Design Movement
Glassmorphism + Dark Mode Tech com influências de dashboards financeiros modernos e interfaces de PropTech.

### Core Principles
1. **Profundidade Através de Transparência**: Camadas de vidro fosco sobre fundos dinâmicos
2. **Dados como Protagonista**: Números grandes, gráficos claros, informação acessível
3. **Navegação Intuitiva**: Sidebar fixa com ícones, conteúdo fluido
4. **Feedback Visual Rico**: Estados claros para cada interação

### Color Philosophy
- **Primário**: Azul oceano profundo (#0F172A) - confiança, tecnologia, profundidade
- **Secundário**: Azul elétrico (#3B82F6) - ação, destaque, modernidade
- **Acento**: Ciano vibrante (#06B6D4) - energia, inovação
- **Suporte**: Slate (#64748B) - texto secundário, bordas sutis
- **Superfície**: Branco com 10% opacidade - cards de vidro

### Layout Paradigm
Dashboard com sidebar colapsável à esquerda (navegação por andares) e área principal com grid de cards. Filtros no topo em pills clicáveis. Modal/drawer lateral para detalhes de fluxo de pagamento.

### Signature Elements
1. **Cards de Vidro**: Background blur com bordas luminosas sutis
2. **Gradientes Mesh**: Fundos com gradientes orgânicos em movimento lento
3. **Indicadores Luminosos**: Status de disponibilidade com "LEDs" coloridos

### Interaction Philosophy
Interações responsivas e informativas - cada ação produz feedback visual imediato. Tooltips ricos aparecem no hover. Transições suaves entre estados.

### Animation
- Transições de 200-300ms com spring physics
- Cards têm leve "lift" no hover (translateY + shadow)
- Modais deslizam da direita com backdrop blur
- Números animam com contador ao carregar
- Gradientes de fundo se movem sutilmente (parallax lento)

### Typography System
- **Display**: Inter Bold/Black (títulos, valores grandes)
- **Body**: Inter Regular/Medium (informações, labels)
- **Monospace**: JetBrains Mono (valores monetários)
- **Hierarchy**: 40px → 24px → 16px → 13px

</text>
</response>

---

## Decisão Final

**Escolha: Ideia 3 - Interface Tecnológica Imersiva**

Esta abordagem foi selecionada porque:
1. **Familiaridade**: Usuários de Power BI e dashboards financeiros se sentirão em casa
2. **Clareza de Dados**: O foco em números grandes e hierarquia clara facilita a leitura dos fluxos
3. **Modernidade**: Glassmorphism transmite inovação e tecnologia
4. **Navegabilidade**: Sidebar + filtros é um padrão intuitivo para explorar muitas unidades
5. **Responsividade**: O layout se adapta bem a mobile (sidebar vira menu hambúrguer)

### Implementação
- Tema escuro como padrão
- Sidebar com andares (2º ao 7º + Lojas)
- Grid de cards com unidades
- Modal lateral com fluxo detalhado
- Filtros por tipologia (Studio, 2 Dorm, Loja)
- Cores de status: Verde (disponível), Amarelo (reservado), Vermelho (vendido)
