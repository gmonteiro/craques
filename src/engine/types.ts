// === Tipos centrais do jogo ===

export interface PlayerCard {
  id: string
  nome: string
  apelido: string
  nacionalidade: string
  clube: string
  posicao: 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA'
  raridade: string
  atributos: Record<string, number>
  clubesCarreira: string[]
  visual?: {
    numeroCarta?: number
    numeroCamisa?: number
    headerBar?: string
    jersey?: string
    sleeve?: string
    collar?: string
    numberColor?: string
    hair?: string
    skin?: string
    badgeText?: string
  }
  // Preenchido na normalização
  pontosNormalizados?: Record<string, number>
  tiersPorAtributo?: Record<string, TierName>
}

export type TierName = 'lendario' | 'elite' | 'bom' | 'regular' | 'fraco'

export interface TierConfig {
  label: string
  percentil: number
  pontos: number
  cor: string
}

export interface AttributeConfig {
  id: string
  nome: string
  tipo: 'hard' | 'soft'
  descricao: string
}

export interface BoostCard {
  id: string
  nome: string
  descricao: string
  tipo: 'aditivo' | 'multiplicativo' | 'condicional' | 'evento'
  raridade: string
  preco: number
  efeito: Record<string, unknown>
}

export interface Combo {
  id: string
  nome: string
  tipo: 'base' | 'mult'
  valor: number
  descricao: string
}

export interface ScoreResult {
  base: number
  mult: number
  total: number
  combos: Combo[]
  detalhes: ScoreDetalhe[]
}

export interface ScoreDetalhe {
  jogadorId: string
  pontosPorAtributo: Record<string, number>
  subtotal: number
}

export interface Twist {
  id: string
  nome: string
  descricao: string
}

export type RunStatus = 'escalando' | 'resultado' | 'loja' | 'vitoria' | 'derrota'

export interface RunState {
  seed: number
  era: string[] // IDs dos atributos ativos
  fase: number // 0-4
  partidaAtual: number // 0-2
  orcamento: number
  baralho: PlayerCard[]
  mao: PlayerCard[]
  boosts: BoostCard[]
  escalacao: PlayerCard[]
  descarte: PlayerCard[]
  tentativasRestantes: number
  trocasRestantes: number
  status: RunStatus
  meta: number
  twist: Twist | null
  ultimaPontuacao: ScoreResult | null
  lojaJogadores: PlayerCard[]
  lojaBoosts: BoostCard[]
  pontuacoesPartida: number[] // pontuações de cada tentativa na partida
}

export type RngFn = () => number
