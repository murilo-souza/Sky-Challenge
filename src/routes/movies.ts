import axios from 'axios'
import { FastifyInstance } from 'fastify'
import { subtractValue } from '../utils/subtractValue'

interface Movie {
  filmes: Array<{
    titulo: string
    ano: number
    diretor: string
    genero: string[]
    duracao: number
    ratings: { valor: number; fonte: string }[]
    sinopse: { texto: string; idioma: string }[]
    premios: { nome: string; relevancia: number }[]
    orcamento: string
    bilheteria: string
  }>
}

interface ParsedMovie {
  titulo: string
  ano: number
  diretor: string
  genero: string[]
  duracaoSegundos: number
  notaIMDb: number
  lucro: string
  maiorPremiacao: string
  sinopse: string | undefined
}

export async function moviesRoutes(app: FastifyInstance) {
  app.get('/', async (req, res) => {
    try {
      const { data } = await axios.get<Movie>(
        'https://tv5hn2gvyijpl76yxlmsy66jwa0nlmxn.lambda-url.us-east-1.on.aws/',
      )

      if (!Array.isArray(data.filmes)) {
        throw new Error('Os dados recebidos não são um array de filmes.')
      }

      const filmesSimplificados: ParsedMovie[] = data.filmes.map((filme) => {
        const duracaoSegundos = filme.duracao * 60 // Converte minutos para segundos
        const notaIMDb =
          filme.ratings.find((rating) => rating.fonte === 'IMDb')?.valor || 0
        const lucro = subtractValue(filme.orcamento, filme.bilheteria)
        const maiorPremiacao = filme.premios.reduce((maior, premio) => {
          return premio.relevancia > maior.relevancia ? premio : maior
        }).nome
        const sinopse =
          filme.sinopse.find((s) => s.idioma === 'pt-br')?.texto ||
          filme.sinopse.find((s) => s.idioma === 'en')?.texto ||
          filme.sinopse.find((s) => s.idioma !== 'en' && s.idioma !== 'pt-br')
            ?.texto

        return {
          titulo: filme.titulo,
          ano: filme.ano,
          diretor: filme.diretor,
          genero: filme.genero,
          duracaoSegundos,
          notaIMDb,
          lucro,
          maiorPremiacao,
          sinopse,
        }
      })

      res.send(filmesSimplificados)
    } catch (error) {
      console.error(error)
      res.status(500).send('Erro ao chamar a API')
    }
  })
}
