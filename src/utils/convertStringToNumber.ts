export function convertStringToNumber(value: string) {
  const valueClean = value.replace(/\$|\s/g, '')

  // Verifica se o valor está em bilhões
  if (valueClean.includes('bilhões') || valueClean.includes('bilhão')) {
    const numberValue = parseFloat(valueClean.replace('bilhões', '')) * 1e9 // Multiplica por 10^9
    return isNaN(numberValue) ? 0 : numberValue
  }

  if (valueClean.includes('milhões')) {
    const numberValue = parseFloat(valueClean.replace('milhões', '')) * 1e6 // Multiplica por 10^6
    return isNaN(numberValue) ? 0 : numberValue
  }

  return parseFloat(valueClean) || 0
}
