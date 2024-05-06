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

      const parsedMovies: ParsedMovie[] = data.filmes.map((filme) => {
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

      res.send(parsedMovies)
    } catch (error) {
      console.error(error)
      res.status(500).send('Erro ao chamar a API')
    }
  })

  app.get('/:name', async (req, res) => {
    try {
      const { data } = await axios.get<Movie>(
        'https://tv5hn2gvyijpl76yxlmsy66jwa0nlmxn.lambda-url.us-east-1.on.aws/',
      )
      const { name } = req.params

      const movieByName = data.filmes.find(
        (filme) => filme.titulo.toLowerCase() === name.toLowerCase(),
      )

      if (!movieByName) {
        return res.code(404).send({ message: 'Filme não encontrado.' })
      }

      const duracaoSegundos = movieByName!.duracao * 60 // Converte minutos para segundos
      const notaIMDb =
        movieByName.ratings.find((rating) => rating.fonte === 'IMDb')?.valor ||
        0
      const lucro = subtractValue(movieByName.orcamento, movieByName.bilheteria)
      const maiorPremiacao = movieByName.premios.reduce((maior, premio) => {
        return premio.relevancia > maior.relevancia ? premio : maior
      }).nome
      const sinopse =
        movieByName.sinopse.find((s) => s.idioma === 'pt-br')?.texto ||
        movieByName.sinopse.find((s) => s.idioma === 'en')?.texto ||
        movieByName.sinopse.find(
          (s) => s.idioma !== 'en' && s.idioma !== 'pt-br',
        )?.texto

      const parsedMovie: ParsedMovie = {
        titulo: movieByName.titulo,
        ano: movieByName.ano,
        diretor: movieByName.diretor,
        genero: movieByName.genero,
        duracaoSegundos,
        notaIMDb,
        lucro,
        maiorPremiacao,
        sinopse,
      }

      res.send(parsedMovie)
    } catch (error) {
      console.error(error)
      res.status(500).send('Erro ao chamar a API')
    }
  })
}
