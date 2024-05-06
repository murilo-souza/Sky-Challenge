import { convertStringToNumber } from './convertStringToNumber'

export function subtractValue(
  orcamentoString: string,
  bilheteriaString: string,
) {
  const boxOffice = convertStringToNumber(bilheteriaString)
  const budget = convertStringToNumber(orcamentoString)

  const result = boxOffice - budget

  if (result / 1e9 > 0.999) {
    return `$${(result / 1e9).toFixed(2)} bilhões`
  }

  if (result / 1e9 < 0.999) {
    return `$${(result / 1e6).toFixed(0)} milhões`
  }

  return result.toString()
}
