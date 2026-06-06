/**
 * Skins de carta — desbloqueadas ao completar coleções temáticas
 */

export interface CardSkin {
  id: string
  nome: string
  descricao: string
  requisito: { tipo: 'nacionalidade' | 'posicao'; valores: string[]; min: number }
  estilo: {
    bgGradient: string
    borderColor: string
    glowColor: string
  }
}

export const SKINS: CardSkin[] = [
  {
    id: 'skin_brasil',
    nome: 'Canarinho',
    descricao: 'Desbloqueie todos os brasileiros',
    requisito: { tipo: 'nacionalidade', valores: ['BRASIL'], min: 7 },
    estilo: {
      bgGradient: 'linear-gradient(180deg, #009739 0%, #FFDF00 50%, #009739 100%)',
      borderColor: '#FFDF00',
      glowColor: 'rgba(255,223,0,.4)',
    },
  },
  {
    id: 'skin_espanha',
    nome: 'La Roja',
    descricao: 'Desbloqueie todos os espanhóis',
    requisito: { tipo: 'nacionalidade', valores: ['ESPANHA'], min: 4 },
    estilo: {
      bgGradient: 'linear-gradient(180deg, #AA151B 0%, #F1BF00 50%, #AA151B 100%)',
      borderColor: '#F1BF00',
      glowColor: 'rgba(241,191,0,.4)',
    },
  },
  {
    id: 'skin_franca',
    nome: 'Les Bleus',
    descricao: 'Desbloqueie todos os franceses',
    requisito: { tipo: 'nacionalidade', valores: ['FRANCA'], min: 5 },
    estilo: {
      bgGradient: 'linear-gradient(90deg, #002395 0%, #FFFFFF 50%, #ED2939 100%)',
      borderColor: '#002395',
      glowColor: 'rgba(0,35,149,.4)',
    },
  },
  {
    id: 'skin_atacante',
    nome: 'Artilheiro',
    descricao: 'Desbloqueie 15 atacantes',
    requisito: { tipo: 'posicao', valores: ['ATA'], min: 15 },
    estilo: {
      bgGradient: 'linear-gradient(180deg, #df524d 0%, #8b0000 100%)',
      borderColor: '#df524d',
      glowColor: 'rgba(223,82,77,.4)',
    },
  },
]

/** Verifica quais skins estão desbloqueadas baseado nos jogadores da coleção */
export function getUnlockedSkins(
  unlockedPlayerIds: string[],
  allPlayers: { id: string; nacionalidade: string; posicao: string }[]
): string[] {
  const unlocked = new Set(unlockedPlayerIds)
  const myPlayers = allPlayers.filter(p => unlocked.has(p.id))

  return SKINS
    .filter(skin => {
      const matching = myPlayers.filter(p => {
        if (skin.requisito.tipo === 'nacionalidade') {
          return skin.requisito.valores.includes(p.nacionalidade)
        }
        return skin.requisito.valores.includes(p.posicao)
      })
      return matching.length >= skin.requisito.min
    })
    .map(s => s.id)
}
