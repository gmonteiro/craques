import type { RunState, PlayerCard, BoostCard, RngFn } from './types'
import { createRng, randomSeed, shuffle, pickN } from './rng'
import { selectActiveAttributes } from './attributes'
import { normalizePlayers } from './normalize'
import { calcularPontuacao, aplicarBoostsEvento } from './scoring'
import { gerarMeta } from './ai'
import { sortearTwist, aplicarTwist, twistDesativaCombos, twistDesativaBoosts } from './twists'
import allPlayers from '../../data/players.json'
import allBoosts from '../../data/boosts.json'
import config from '../../data/config.json'

const { run: runCfg, partida: partidaCfg, economia, baralho: baralhoCfg } = config

// ==========================================
// Criar nova run
// ==========================================
export function iniciarRun(seed?: number): RunState {
  const s = seed ?? randomSeed()
  const rng = createRng(s)

  // Sortear Era (atributos ativos)
  const era = selectActiveAttributes(rng, runCfg.atributosAtivos)

  // Normalizar todos os jogadores
  const normalized = normalizePlayers(allPlayers as PlayerCard[], era)

  // Sortear baralho inicial (sem lendas aposentadas — essas só aparecem na loja com 20% de chance)
  const pool = normalized.filter(p => p.clube !== 'APOSENTADO')
  const baralhoInicial = pickN(rng, pool.length > 0 ? pool : normalized, baralhoCfg.tamanhoInicial)

  // Gerar meta da primeira partida
  const rngMeta = createRng(s + 1)
  const metaInfo = gerarMeta(0, 0, rngMeta)

  // Comprar mão inicial
  const baralhoRestante = [...baralhoInicial]
  shuffle(rng, baralhoRestante)
  const mao = baralhoRestante.splice(0, Math.min(partidaCfg.tamanhoMao, baralhoRestante.length))

  return {
    seed: s,
    era,
    fase: 0,
    partidaAtual: 0,
    orcamento: economia.orcamentoInicial,
    baralho: baralhoRestante,
    mao,
    boosts: [],
    escalacao: [],
    descarte: [],
    tentativasRestantes: partidaCfg.tentativas,
    trocasRestantes: partidaCfg.trocas,
    status: 'escalando',
    meta: metaInfo.valor,
    twist: metaInfo.isClassico ? sortearTwist(createRng(s + 2), era) : null,
    ultimaPontuacao: null,
    lojaJogadores: [],
    lojaBoosts: [],
    pontuacoesPartida: [],
    streak: 0,
    prestigeLevel: 0,
    pathChoices: [],
  }
}

/** Criar run com prestige (NG+) */
export function iniciarRunPrestige(prestigeLevel: number, seed?: number): RunState {
  const run = iniciarRun(seed)
  // Prestige: meta +30% por nível, -1 troca, mas +$2 orçamento
  const metaMultiplier = 1 + prestigeLevel * 0.3
  return {
    ...run,
    prestigeLevel,
    meta: Math.round(run.meta * metaMultiplier),
    orcamento: run.orcamento + prestigeLevel * 2,
    trocasRestantes: Math.max(1, run.trocasRestantes - prestigeLevel),
  }
}

// ==========================================
// Ações do jogador
// ==========================================

/** Escala jogadores da mão para a área de escalação */
export function escalar(state: RunState, jogadorIds: string[]): RunState {
  if (state.status !== 'escalando') return state

  const novaMao = [...state.mao]
  const novaEscalacao = [...state.escalacao]

  for (const id of jogadorIds) {
    if (novaEscalacao.length >= partidaCfg.maxEscalacao) break
    const idx = novaMao.findIndex(p => p.id === id)
    if (idx !== -1) {
      novaEscalacao.push(novaMao.splice(idx, 1)[0])
    }
  }

  return { ...state, mao: novaMao, escalacao: novaEscalacao }
}

/** Remove jogador da escalação de volta para a mão */
export function desescalar(state: RunState, jogadorId: string): RunState {
  if (state.status !== 'escalando') return state

  const idx = state.escalacao.findIndex(p => p.id === jogadorId)
  if (idx === -1) return state

  const novaEscalacao = [...state.escalacao]
  const novaMao = [...state.mao]
  novaMao.push(novaEscalacao.splice(idx, 1)[0])

  return { ...state, mao: novaMao, escalacao: novaEscalacao }
}

/** Joga (submete a escalação e calcula pontuação) */
export function jogar(state: RunState): RunState {
  if (state.status !== 'escalando') return state
  if (state.escalacao.length === 0) return state
  if (state.tentativasRestantes <= 0) return state

  // Aplicar twist se houver
  let escalacaoFinal = state.escalacao
  if (state.twist) {
    escalacaoFinal = aplicarTwist(state.twist, escalacaoFinal, state.era)
  }

  // Filtrar boosts se twist desativa
  const boostsAtivos = twistDesativaBoosts(state.twist) ? [] : state.boosts

  // Aplicar boosts de evento na meta
  const metaFinal = aplicarBoostsEvento(boostsAtivos, state.meta)

  // Calcular pontuação (sem combos se twist desativa)
  const resultado = calcularPontuacao(
    twistDesativaCombos(state.twist) ? escalacaoFinal.map(p => ({ ...p, clube: '_', nacionalidade: '_', posicao: 'ATA' as const })) : escalacaoFinal,
    boostsAtivos,
    state.era,
    metaFinal,
    state.mao.length
  )

  const novasPontuacoes = [...state.pontuacoesPartida, resultado.total]

  // Verificar se bateu a meta
  if (resultado.total >= metaFinal) {
    return {
      ...state,
      tentativasRestantes: state.tentativasRestantes - 1,
      ultimaPontuacao: resultado,
      pontuacoesPartida: novasPontuacoes,
      status: 'resultado',
      meta: metaFinal,
    }
  }

  // Não bateu — ainda tem tentativas?
  const tentativasRestantes = state.tentativasRestantes - 1

  if (tentativasRestantes <= 0) {
    // Sem tentativas → derrota (streak resets)
    return {
      ...state,
      tentativasRestantes: 0,
      ultimaPontuacao: resultado,
      pontuacoesPartida: novasPontuacoes,
      status: 'derrota',
      meta: metaFinal,
      streak: 0,
    }
  }

  // Ainda tem tentativas — volta a escalar
  return {
    ...state,
    tentativasRestantes,
    ultimaPontuacao: resultado,
    pontuacoesPartida: novasPontuacoes,
    escalacao: [],
    mao: [...state.mao, ...state.escalacao],
  }
}

/** Troca jogadores selecionados (descarta e compra novos) */
export function trocar(state: RunState, jogadorIds: string[]): RunState {
  if (state.status !== 'escalando') return state
  if (state.trocasRestantes <= 0) return state

  const novaMao = [...state.mao]
  const novaEscalacao = [...state.escalacao]
  const novoDescarte = [...state.descarte]
  let novoBaralho = [...state.baralho]

  // Remover jogadores selecionados da mão e da escalação
  for (const id of jogadorIds) {
    let idx = novaMao.findIndex(p => p.id === id)
    if (idx !== -1) {
      novoDescarte.push(novaMao.splice(idx, 1)[0])
      continue
    }
    idx = novaEscalacao.findIndex(p => p.id === id)
    if (idx !== -1) {
      novoDescarte.push(novaEscalacao.splice(idx, 1)[0])
    }
  }

  // Se baralho vazio, reciclar descarte (exceto cartas recém-descartadas)
  if (novoBaralho.length === 0 && novoDescarte.length > 0) {
    const rng = createRng(state.seed + state.fase * 777 + state.trocasRestantes)
    novoBaralho = shuffle(rng, [...novoDescarte])
    novoDescarte.length = 0
  }

  // Comprar novos do baralho
  const nComprar = Math.min(jogadorIds.length, novoBaralho.length)
  for (let i = 0; i < nComprar; i++) {
    novaMao.push(novoBaralho.pop()!)
  }

  return {
    ...state,
    mao: novaMao,
    escalacao: novaEscalacao,
    descarte: novoDescarte,
    baralho: novoBaralho,
    trocasRestantes: state.trocasRestantes - 1,
  }
}

// ==========================================
// Progressão
// ==========================================

/** Calcula recompensa após vitória */
function calcularRecompensa(state: RunState): number {
  let recompensa = economia.recompensaVitoria

  // Bônus por folga (% acima da meta)
  if (state.ultimaPontuacao && state.meta > 0) {
    const folga = (state.ultimaPontuacao.total - state.meta) / state.meta
    recompensa += Math.round(folga * 100 * economia.recompensaFolga)
  }

  // Bônus por trocas não usadas
  recompensa += state.trocasRestantes * economia.recompensaTrocasNaoUsadas

  // Juros sobre o caixa
  const juros = Math.min(Math.floor(state.orcamento * economia.juros), economia.maxJuros)
  recompensa += juros

  // Streak bonus: +1$ por vitória consecutiva (max +3)
  recompensa += Math.min(state.streak, 3)

  return recompensa
}

/** Avança para a próxima partida ou fase (após vitória) */
export function avancar(state: RunState): RunState {
  if (state.status !== 'resultado') return state

  const novaStreak = state.streak + 1
  const recompensa = calcularRecompensa({ ...state, streak: novaStreak })
  const novoOrcamento = state.orcamento + recompensa

  const proximaPartida = state.partidaAtual + 1
  const totalPartidas = runCfg.partidasPorFase

  // Ainda tem partidas na fase?
  if (proximaPartida < totalPartidas) {
    const rng = createRng(state.seed + (state.fase + 1) * 100 + proximaPartida)
    const metaInfo = gerarMeta(state.fase, proximaPartida, rng)

    return resetarPartida({
      ...state,
      orcamento: novoOrcamento,
      partidaAtual: proximaPartida,
      meta: metaInfo.valor,
      streak: novaStreak,
      twist: metaInfo.isClassico ? sortearTwist(createRng(state.seed + (state.fase + 1) * 200 + proximaPartida), state.era) : null,
    })
  }

  // Fim da fase → abrir loja (ou vitória se era a Final)
  const proximaFase = state.fase + 1

  if (proximaFase >= runCfg.fasesNomes.length) {
    // Campeão!
    return { ...state, orcamento: novoOrcamento, status: 'vitoria' }
  }

  // Mostrar escolha de caminho entre fases
  const paths = gerarCaminhos(createRng(state.seed + proximaFase * 999), proximaFase)
  return {
    ...state,
    orcamento: novoOrcamento,
    fase: proximaFase,
    partidaAtual: 0,
    streak: novaStreak,
    status: 'escolhendo_caminho',
    pathChoices: paths,
  }
}

/** Gera 2-3 caminhos para escolher entre fases */
function gerarCaminhos(rng: RngFn, fase: number): import('./types').PathChoice[] {
  const paths: import('./types').PathChoice[] = [
    {
      id: 'normal',
      nome: 'Caminho Seguro',
      descricao: 'Meta normal, recompensa padrao',
      metaMultiplier: 1,
      recompensaExtra: 0,
      legendaGarantida: false,
    },
    {
      id: 'dificil',
      nome: 'Caminho Difícil',
      descricao: 'Meta +40%, mas +$3 extra',
      metaMultiplier: 1.4,
      recompensaExtra: 3,
      legendaGarantida: false,
    },
  ]

  // A partir da fase 2, chance de caminho lendário
  if (fase >= 2 && rng() < 0.5) {
    paths.push({
      id: 'lendario',
      nome: 'Caminho Lendário',
      descricao: 'Meta +60%, lenda garantida na loja',
      metaMultiplier: 1.6,
      recompensaExtra: 2,
      legendaGarantida: true,
    })
  }

  return paths
}

/** Jogador escolheu um caminho */
export function escolherCaminho(state: RunState, pathId: string): RunState {
  if (state.status !== 'escolhendo_caminho') return state

  const path = state.pathChoices.find(p => p.id === pathId)
  if (!path) return state

  return abrirLoja({
    ...state,
    pathChoices: [],
    orcamento: state.orcamento + path.recompensaExtra,
    // Meta multiplier será aplicado quando gerar meta da próxima partida
  }, path)
}

/** Reseta estado para nova partida */
function resetarPartida(state: RunState): RunState {
  // Juntar mão + escalação de volta ao baralho
  const todosJogadores = [...state.baralho, ...state.mao, ...state.escalacao, ...state.descarte]
  const rng = createRng(state.seed + state.fase * 1000 + state.partidaAtual)
  shuffle(rng, todosJogadores)

  // Mão curta: 5 cartas em vez de 8
  const tamanhoMao = state.twist?.id === 'mao_curta' ? 5 : partidaCfg.tamanhoMao
  const mao = todosJogadores.splice(0, Math.min(tamanhoMao, todosJogadores.length))

  // Meta blindada: +50%
  const meta = state.twist?.id === 'meta_blindada'
    ? Math.round(state.meta * 1.5)
    : state.meta

  return {
    ...state,
    baralho: todosJogadores,
    mao,
    escalacao: [],
    descarte: [],
    tentativasRestantes: partidaCfg.tentativas,
    trocasRestantes: partidaCfg.trocas,
    status: 'escalando',
    ultimaPontuacao: null,
    pontuacoesPartida: [],
    meta,
  }
}

// ==========================================
// Loja
// ==========================================

/** Abre a loja entre fases */
function abrirLoja(state: RunState, path?: import('./types').PathChoice): RunState {
  const rng = createRng(state.seed + state.fase * 500)

  // Normalizar todos os jogadores com a Era ativa
  const todosNormalizados = normalizePlayers(allPlayers as PlayerCard[], state.era)

  // Jogadores na loja: excluir os que já estão no baralho do jogador
  const idsBaralho = new Set([...state.baralho, ...state.mao, ...state.escalacao, ...state.descarte].map(p => p.id))
  const disponiveis = todosNormalizados.filter(p => !idsBaralho.has(p.id))

  // Separar lendas e normais
  const lendas = disponiveis.filter(p => p.raridade === 'lendario' && (p.clube === 'APOSENTADO' || (p.atributos.idade ?? 0) > 50))
  const normais = disponiveis.filter(p => !lendas.includes(p))

  // Lenda garantida se caminho lendário, senão 30% chance
  const temLenda = (path?.legendaGarantida || rng() < 0.3) && lendas.length > 0
  let lojaJogadores: PlayerCard[]
  if (temLenda) {
    const lenda = pickN(rng, lendas, 1)
    const outros = pickN(rng, normais, economia.tamanhosLoja.jogadores - 1)
    lojaJogadores = [...lenda, ...outros]
  } else {
    lojaJogadores = pickN(rng, normais, economia.tamanhosLoja.jogadores)
  }

  const lojaBoosts = pickN(rng, allBoosts as BoostCard[], economia.tamanhosLoja.boosts)

  return {
    ...state,
    status: 'loja',
    lojaJogadores,
    lojaBoosts,
  }
}

/** Compra um jogador da loja */
export function comprarJogador(state: RunState, jogadorId: string): RunState {
  if (state.status !== 'loja') return state

  const idx = state.lojaJogadores.findIndex(p => p.id === jogadorId)
  if (idx === -1) return state

  // Preço baseado na raridade
  const preco = precoRaridade(state.lojaJogadores[idx].raridade)
  if (state.orcamento < preco) return state

  const totalJogadores = state.baralho.length + state.mao.length + state.escalacao.length + state.descarte.length
  if (totalJogadores >= baralhoCfg.maxBaralho) return state

  const novaLoja = [...state.lojaJogadores]
  const jogador = novaLoja.splice(idx, 1)[0]

  return {
    ...state,
    orcamento: state.orcamento - preco,
    baralho: [...state.baralho, jogador],
    lojaJogadores: novaLoja,
  }
}

/** Compra um boost da loja */
export function comprarBoost(state: RunState, boostId: string): RunState {
  if (state.status !== 'loja') return state

  const idx = state.lojaBoosts.findIndex(b => b.id === boostId)
  if (idx === -1) return state

  const boost = state.lojaBoosts[idx]
  if (state.orcamento < boost.preco) return state
  if (state.boosts.length >= baralhoCfg.maxBoosts) return state

  const novaLoja = [...state.lojaBoosts]
  novaLoja.splice(idx, 1)

  return {
    ...state,
    orcamento: state.orcamento - boost.preco,
    boosts: [...state.boosts, boost],
    lojaBoosts: novaLoja,
  }
}

/** Vende um jogador do baralho */
export function venderJogador(state: RunState, jogadorId: string): RunState {
  if (state.status !== 'loja') return state

  const idx = state.baralho.findIndex(p => p.id === jogadorId)
  if (idx === -1) return state

  const preco = Math.floor(precoRaridade(state.baralho[idx].raridade) / 2)
  const novoBaralho = [...state.baralho]
  novoBaralho.splice(idx, 1)

  return {
    ...state,
    orcamento: state.orcamento + preco,
    baralho: novoBaralho,
  }
}

/** Reroll da loja (gera novos itens) */
export function rerollLoja(state: RunState): RunState {
  if (state.status !== 'loja') return state
  if (state.orcamento < economia.custoReroll) return state

  return abrirLoja({
    ...state,
    orcamento: state.orcamento - economia.custoReroll,
    seed: state.seed + 7,
  })
}

/** Refresh da loja sem custo (após abrir pacote) */
export function refreshLoja(state: RunState): RunState {
  if (state.status !== 'loja') return state
  return abrirLoja({
    ...state,
    seed: state.seed + 13, // Seed diferente = cartas diferentes
  })
}

/** Sai da loja e começa próxima fase */
export function sairDaLoja(state: RunState): RunState {
  if (state.status !== 'loja') return state

  const rng = createRng(state.seed + (state.fase + 1) * 100)
  const metaInfo = gerarMeta(state.fase, 0, rng)

  return resetarPartida({
    ...state,
    meta: metaInfo.valor,
    twist: null,
  })
}

// ==========================================
// Utilidades
// ==========================================

function precoRaridade(raridade: string): number {
  const precos: Record<string, number> = {
    comum: 2,
    incomum: 3,
    bom: 4,
    raro: 5,
    elite: 6,
    lendario: 8,
  }
  return precos[raridade] ?? 4
}

/** Retorna nome da fase atual */
export function nomeFase(fase: number): string {
  return runCfg.fasesNomes[fase] ?? `Fase ${fase}`
}

/** Retorna info do adversário atual */
export function infoPartida(state: RunState) {
  const rng = createRng(state.seed + (state.fase + 1) * 100 + state.partidaAtual)
  const metaInfo = gerarMeta(state.fase, state.partidaAtual, rng)
  return {
    fase: nomeFase(state.fase),
    partida: state.partidaAtual + 1,
    totalPartidas: runCfg.partidasPorFase,
    adversario: metaInfo.adversario,
    isClassico: metaInfo.isClassico,
    meta: state.meta,
    twist: state.twist,
  }
}
