# Regency Square Smart Stay — TODO

## Funcionalidades Implementadas

- [x] Dashboard principal com grid de unidades
- [x] Integração com Google Sheets (dados em tempo real)
- [x] Mapa de disponibilidade por andar (FloorMap)
- [x] Modal de detalhes da unidade (UnitDetailModal)
- [x] Sidebar com filtros por andar
- [x] FilterBar com filtros por tipologia
- [x] Conversor de moeda ao vivo (BRL, USD, EUR, ARS, CLP, UYU, PYG)
- [x] Comparador de unidades (CompareBar + ComparePanel)
- [x] Botão WhatsApp multilíngue com mensagem automática
- [x] Botão Copiar mensagem
- [x] Simulador de Fluxo de Caixa (/corretor)
- [x] Visão Analítica (/analytics)
- [x] Intro animada com logo
- [x] Plantas humanizadas via CDN

## Painel do Gestor (Implementado)

- [x] Banco de dados ativado (MySQL/TiDB)
- [x] Tabela de eventos de rastreamento (schema + migration)
- [x] Hook useTrack para rastreamento silencioso
- [x] Rastreamento de unit_view no UnitDetailModal
- [x] Rastreamento de whatsapp_click no UnitDetailModal e ComparePanel
- [x] Rastreamento de copy_click no UnitDetailModal e ComparePanel
- [x] Endpoint tRPC analytics.track (público, fire-and-forget)
- [x] Endpoint tRPC analytics.summary (protegido, admin only)
- [x] Página /gestor com painel de analytics
  - [x] KPIs: sessões únicas, total de eventos, unidades vistas, cliques WhatsApp
  - [x] Eventos por tipo com barra de progresso
  - [x] Gráfico de pizza: distribuição de moedas (origem dos leads)
  - [x] Gráfico de barras: atividade diária
  - [x] Top 10 unidades mais visualizadas
  - [x] Top 5 unidades com mais cliques em WhatsApp
  - [x] Seletor de período (7, 15, 30, 60, 90 dias)
- [x] Testes vitest para analytics (6 testes passando)
- [x] Remover botão "Gestor" do header (acesso só pelo link direto /gestor)

## Ficha de Reserva (Implementado)

- [x] Botão "Reservar esta Unidade" no modal de detalhes da unidade (só para unidades disponíveis)
- [x] Modal explicativo com as etapas da reserva (pré-lançamento / lançamento / fechamento do grupo)
- [x] Formulário de reserva com campos completos: nome, e-mail, telefone, data de nascimento, nacionalidade, naturalidade, CPF/RNM, órgão expeditor, data de expedição, profissão, estado civil, regime de comunhão, endereço, complemento, bairro, CEP, cidade, imobiliária, responsável pela venda
- [x] Campos para clientes estrangeiros (RNM, nacionalidade, naturalidade — opcionais)
- [x] Tabela de reservas no banco de dados
- [x] Geração de documento Word (.docx) estilizado com dados preenchidos
- [x] Botão de envio por WhatsApp direto para o gestor (48) 98874-9258
- [x] Seção de fichas de reserva no painel do gestor (/gestor) com download do Word

## Próximas Ideias

- [ ] Simulador de ROI (retorno sobre investimento)
- [ ] Modo Apresentação (tela cheia sem menus)
- [ ] Proposta em PDF por unidade
- [ ] QR Code por unidade
- [ ] Modo "Meu Orçamento" (filtro por valor mensal)
- [ ] Link compartilhável por unidade
- [ ] Notificação automática para o gestor quando uma reserva for enviada
- [ ] Ranking de unidades quentes
- [x] Atualizar texto do aviso SPE no ReservationModal e no documento Word
- [x] Atualizar Etapa 2 (adicionar "Assinatura do contrato") e Etapa 3 (simplificar + quadro de exemplo) no ReservationModal
- [x] Reformatar Word no padrão da ficha cadastral original (cabeçalho, campos, estilo)
- [x] Adicionar upload de documentos no formulário (CNH + comprovante, até 3 arquivos)
- [x] Gerar ZIP com Word + documentos anexados
- [x] Atualizar botão de envio para WhatsApp do Gestor Comercial (+5548988749258)
- [x] Trocar "Alex" por "Gestor Comercial" no botão de envio
- [x] Corrigir Word para seguir a ficha original à risca (campo Unidade, todos os campos com linha tracejada quando vazio)
- [x] Corrigir geração e download do Word (.docx) na tela de sucesso
- [x] Corrigir envio de anexos junto com a mensagem do WhatsApp (limitação do WhatsApp — instruções claras para o corretor anexar manualmente)
- [x] Reformatar Word para seguir exatamente o modelo FICHADERESERVA613.docx (instruções no topo, todos os campos com linha tracejada quando vazio, campo de assinatura)
- [x] Adicionar campos obrigatórios de nome e telefone do corretor no formulário de reserva
- [x] Incluir dados do corretor no documento Word gerado
- [x] Implementar envio automático de e-mail com Word em anexo para contato@regencysmartstay.com.br e Adm@grupovectro.com
- [ ] Configurar credenciais SMTP (EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS) para ativar o envio
- [x] Tornar campo "Imobiliária" obrigatório no formulário de reserva
- [x] Remover limite de 3 anexos (permitir ilimitados)
- [x] Salvar ficha Word + anexos no Google Drive (estrutura: Imobiliária/Corretor dentro da pasta de Reservas)
- [x] Criar pasta automaticamente se imobiliária/corretor não existir no Drive
- [x] Enviar notificação Manus ao gestor com link do Drive quando ficha for enviada
- [x] Reformular tabela de campos cadastrais no Word com bordas visíveis estilo Excel (garantir texto horizontal)
- [x] Adicionar seção de fluxo de pagamento no documento Word (entrada, 42x mensais, 6 reforços) com dados da unidade
- [x] Passar dados do fluxo de pagamento da unidade para o backend ao submeter a ficha de reserva
- [x] Corrigir texto vertical no Word (usar WidthType.PERCENTAGE com tabela 100% para compatibilidade Google Docs)
- [x] Reordenar formulário de reserva: iniciar com dados do corretor, depois dados do cliente
- [x] Adicionar seção de fluxo no formulário: fluxo padrão com seletor de moeda + campo de adaptação personalizada
- [x] Atualizar gerador Word para incluir moeda selecionada e adaptação de fluxo do cliente
- [x] Conversão de moeda automática em tempo real no formulário (cotação via API)
- [x] Exibir valores convertidos na tela ao selecionar moeda diferente de BRL
- [x] Incluir valores convertidos no documento Word gerado
- [x] Reformatar Word para texto corrido sem tabela (campos organizados em linhas)
- [x] Remover assinatura do gestor no Word (manter só linha do investidor)
- [x] Estrutura de pastas no Drive: Imobiliária / Telefone+Nome do Corretor / Cota+Investidor
- [x] Substituir tabela do fluxo de pagamento por texto corrido no Word (eliminar texto vertical)
- [x] Criar tabela de corretores no banco (nome, telefone, imobiliária, e-mail, código único)
- [x] Endpoints tRPC para listar, criar, editar e remover corretores
- [x] Painel de gestão de corretores (acessível pelo gestor no dashboard)
- [x] Tela de escolha no modal de reserva: "Sou corretor" ou "Sou investidor"
- [x] Lista suspensa de corretores cadastrados no formulário de reserva
- [x] Formulário simplificado para investidor direto (sem campos de corretor)
- [x] Estrutura de pastas no Drive usando ID único do corretor ou subpasta "Investidor Direto"
- [x] Remover opção "Sou Investidor" da tela de escolha (manter só corretor, lógica interna preservada)
- [x] Seleção de fluxo obrigatória no formulário: 3 opções (padrão / personalizado / não definido)
- [x] Seção de fluxo só aparece no Word se corretor escolheu padrão ou personalizado
- [x] Link do Drive clicável no e-mail (hiperlink HTML)
- [x] Corrigir schema: campos de fluxo (fluxoValorTotal, fluxoEntrada, etc.) devem aceitar null
- [x] Corrigir fluxoMoeda varchar(8) -> varchar(16) para aceitar NAO_DEFINIDO
- [x] Normalizar undefined -> null nos campos de fluxo antes de inserir no banco
- [x] Adicionar opção "Autônomo(a)" no campo imobiliária do formulário
- [x] Atualizar status de reserva: reservado / assinado / vendido (enum atualizado no banco)
- [x] Criar planilha Google Sheets na pasta do Drive e alimentar automaticamente a cada reserva
- [x] Controle de status no painel do gestor (select Reservado/Assinado/Vendido por ficha)
- [x] Corrigir fluxoMoeda varchar(16) -> varchar(20) para aceitar NAO_DEFINIDO sem truncar
- [x] Melhorar campo Imobiliária no formulário manual: duas modalidades (Imobiliária / Autônomo(a)) com comportamento diferente por seleção
- [x] Corrigir Word: quando fluxo = NAO_DEFINIDO, a seção de fluxo não deve aparecer no documento
- [x] Corrigir SheetsService: erro 'require is not defined' no ambiente ESM do servidor (substituído por fetch nativo)
- [x] Corrigir pasta do corretor no Drive: normalizar imobiliária para Title Case + usar telefone normalizado como chave única da pasta do corretor
- [x] Word com câmbio: quando moeda estrangeira, mostrar valor convertido + valor original em BRL ao lado + aviso de que pagamento é em reais
- [x] Corrigir label da seção de anexos: adicionar "e outros" para deixar claro que não são só CNH e comprovante
- [x] Adicionar campo "Informações Extras" no formulário de reserva (país de origem, observações do cliente, etc.) + aparecer no Word
- [x] Corrigir falha ao salvar no Drive: token expirado sem refresh_token - adicionado retry automático com 3 tentativas + log de diagnóstico do imobPasta
- [x] Corrigir formulário de reserva: scroll automático ao topo ao mudar de step + seção do corretor destacada visualmente com borda e instrução "Preencha primeiro"
- [x] Corrigir campo de telefone do corretor: seletor de país (DDI) com 20 países + formato limpo sem pontos/traços
- [x] Corrigir planilha Google Sheets: token expirado sem renovação automática - implementado getAccessToken com verificação de expiry + renovação via rclone lsd
- [x] Corrigir PhoneField: guardar só dígitos no estado + combinar DDI na hora de enviar ao backend
- [x] Atualizar bloco de fluxo no modal: textos das etapas corrigidos + valores BRL ao lado dos valores em moeda estrangeira + aviso de pagamento em Reais (preço de custo)
- [x] Remover 'SPE' da nota inferior do bloco de etapas
- [x] Adicionar valores em BRL ao lado dos valores em moeda estrangeira no bloco de fluxo da ficha de reserva (seção 2 do formulário) - layout 3 colunas: label | moeda estrangeira | BRL
- [x] Download automático do Word ao clicar em 'Baixar Word e Enviar via WhatsApp': o Word é baixado antes de abrir o WhatsApp, protegendo os dados do corretor contra perda em caso de falha
- [x] Renovação automática do token do Google Drive a cada 45 minutos (tokenRefresher.ts) para evitar falhas de upload por token expirado
- [x] Corrigir falha de upload no Google Drive em produção: implementado via Google Apps Script Web App (sem expiração de token, funciona em produção)
- [x] Corrigir SheetsService em produção: substituir Sheets API com token OAuth por Google Apps Script Web App (sem expiração, funciona permanentemente)
- [x] Remover botão e rota do Simulador de Fluxo da interface (invisível para todos)
- [x] Atualizar ficha Word: reorganizar etapas (2 etapas sem datas) e ajustar rótulo do sinal no fluxo
- [x] Atualizar modal visual da unidade: 2 etapas sem datas e rótulo do sinal atualizado
- [x] Adicionar seção 'Gestão de Contratos' com botões Dashboard Administrativo e Acesso Corretor no Home.tsx
- [x] Criar página ContractFlow integrada via iframe no Regency dashboard
- [x] Atualizar URL dos botões para flow.regencysmartstay.com.br
- [x] Atualizar URL dos botões para flow.regencysmartstay.com.br
- [x] Corrigir upload para Google Drive: substituir Drive API direta (token expira) por Apps Script como método principal + rclone como fallback em dev
- [x] Corrigir sheetsService: usar redirect follow em vez de manual para compatibilidade com Apps Script
- [x] Corrigir campo Telefone na planilha: #ERROR! quando número tem prefixo +55 (Google Sheets interpreta + como fórmula)

## Apresentação ao Cliente (Abril 2026)
- [x] Criar página /apresentacao com grid de 6 unidades selecionáveis
- [x] Cada card: planta baixa + fluxo de pagamento
- [x] Seletor de unidade por card (trocar qual unidade exibir)
- [x] Troca de idioma: PT / ES / EN
- [x] Troca de moeda: BRL / USD / ARS com cotação em tempo real
- [x] Link para site regencysmartstay.com.br no rodapé
- [x] Botão "Apresentação Cliente" no header do Home.tsx
- [x] Adicionar rota /apresentacao no App.tsx
- [x] Redesenhar layout compacto: 6 cards visíveis de uma vez na tela (3x2, sem scroll)

## Melhorias Solicitadas (Abril 2026 - v2)
- [x] Adicionar link/botão "Ver Site" na página Home apontando para regencysmartstay.com.br
- [x] Corrigir layout Apresentação: 6 cards visíveis sem scroll (preencher tela inteira)
- [x] Garantir API de cotação em tempo real (BRL/USD/ARS) funcionando no servidor
- [x] Adicionar EUR e CLP como opções de moeda na Apresentação
- [x] Tema branco com contornos marrom na página de Apresentação ao Cliente

## Pendências para Testar / Corrigir (Próxima Sessão)
- [ ] Testar botões de troca de moeda (BRL/USD/ARS/EUR/CLP) na página Apresentação
- [ ] Testar botões de tradução (PT/ES/EN) na página Apresentação
- [ ] Investigar e corrigir Visão Analítica (/analytics) — parece não estar se comunicando com o banco

## Melhorias Solicitadas (Abril 2026 - v3)
- [ ] Tema branco em TODO o site: Home, Analytics, Corretor, Gestor (não só Apresentação) — bordas marrom-dourado, cada aba com identidade visual distinta
- [ ] Corrigir/testar botões de troca de moeda (BRL/USD/ARS/EUR/CLP) na Apresentação
- [ ] Corrigir/testar botões de tradução (PT/ES/EN) na Apresentação
- [ ] Investigar e corrigir Visão Analítica (/analytics) — não está se comunicando com o banco
- [ ] Adicionar botão "Ver Site" na primeira página (Home) apontando para regencysmartstay.com.br
- [ ] Adicionar botão "Planilha Excel" na Home — abre aba com planilha Google Sheets em tempo real
- [ ] Adicionar botão "Maquete 3D" na Home — link para https://www.regencysmartstay.com.br/planta-3d
- [ ] Reduzir tamanho dos botões do header — deixar mais sutis e compactos

## Correções Mobile (Abril 2026)
- [x] Corrigir layout mobile da seção de botões de atalho na Home (Ver Site, Maquete, Planilha)
- [x] Corrigir layout mobile da página de Apresentação ao Cliente (cards 3x2 → 1 coluna no celular)
- [x] Adicionar botão "Apres. Cliente" nos atalhos rápidos da Home (após Planilha)

## Animação de Carregamento (Abril 2026)
- [x] Skeleton loading nos 6 cards da Apresentação enquanto dados carregam
- [x] Animação de entrada suave (fade + slide) quando os cards aparecem
- [x] Shimmer de carregamento nas imagens das plantas baixas
- [x] Indicador de carregamento (spinner) no botão de moeda enquanto busca cotação

## Planilha em Espelho (Abril 2026)
- [ ] Criar página /planilha com iframe do Google Sheets embutido
- [ ] Adicionar botão "Planilha" no header da Home apontando para /planilha
- [ ] Adicionar rota /planilha no App.tsx

## Planilha em Espelho (Abril 2026)
- [x] Criar página /planilha com iframe do Google Sheets em tela cheia (100vw x 100vh)
- [x] Pequeno botão "Voltar" discreto no canto superior esquerdo
- [x] Adicionar rota /planilha no App.tsx
- [x] Atualizar botão "Planilha" nos atalhos da Home para apontar para /planilha
- [x] Botão "Abrir no Google Sheets" para editar a planilha original

## Melhoria Planilha (Abril 2026)
- [x] Ajustar zoom do iframe para mostrar mais colunas (zoom 75%)
- [x] Adicionar dica de navegação e controles de zoom (−/+)
- [x] Adicionar botões "Baixar PDF" e "Baixar Excel" na barra da página Planilha

## Book do Empreendimento (Abril 2026)
- [x] Adicionar botão "Book" nos atalhos da Home apontando para pasta do Google Drive

## Material Completo (Abril 2026)
- [x] Adicionar botão "Material Completo" nos atalhos da Home apontando para pasta do Google Drive

## Redesign Mobile Atalhos (Abril 2026)
- [x] Transformar atalhos rápidos em ícones quadrados arredondados compactos no mobile (estilo app, grade 4x2)
- [x] Manter layout de cards no desktop
- [x] Gradientes de cor suaves + sombras coloridas nos ícones mobile
- [x] Animação de toque (scale-95) nos ícones mobile
- [x] Labels compactos abaixo de cada ícone
- [x] Alterar label do ícone mobile de 'Apresentar' para 'Apresentação Cliente'
- [x] Corrigir cores dos textos descritivos nos cards de atalhos (desktop) — trocar cores claras por marrom Regency para melhorar legibilidade
- [x] Trocar cores claras por marrom Regency na seção de entrada/hero da Home (textos difíceis de ler)
- [x] Corrigir cores dos valores no modal de reserva (primeira página com exemplo R$ 30 mil) — difícil de ler
- [x] Converter Comparativo de Unidades do tema escuro para fundo branco com textos escuros legíveis
- [x] Converter animação de entrada (intro) do tema escuro para fundo branco/bege com identidade Regency
