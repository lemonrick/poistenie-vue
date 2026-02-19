export const typMoznosti = [
  { label: 'Krátkodobé poistenie', value: 'kratkodobe' },
  { label: 'Celoročné poistenie', value: 'celorocne' }
]

export const balikMoznosti = [
  { id: 'zakladny', name: 'základný', kratkodoba_cena: 1.2, celorocna_cena: 39 },
  { id: 'rozsireny', name: 'rozšírený', kratkodoba_cena: 1.8, celorocna_cena: 49 },
  { id: 'extra', name: 'extra', kratkodoba_cena: 2.4, celorocna_cena: 59 }
]

export const MIN_PERSONS = 1
export const MAX_PERSONS = 100

export const pripoisteniaMoznosti = [
  { id: 'storno_cesty', name: 'storno cesty', kratkodoba_prirazka: 1.5, celorocna_prirazka: 1.2 },
  { id: 'sportove_aktivity', name: 'športové aktivity', kratkodoba_prirazka: 1.3, celorocna_prirazka: 1.1 }
]

const datePattern = /^(0?[1-9]|[12][0-9]|3[01])\.(0?[1-9]|1[012])\.\d{4}$/

export function parseDate(dateString) {
  if (typeof dateString !== 'string') {
    return null
  }

  const [day, month, year] = dateString.split('.').map(Number)
  if (!day || !month || !year) {
    return null
  }

  const parsed = new Date(year, month - 1, day)
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null
  }

  return parsed
}

export function isValidSkDate(dateString) {
  return datePattern.test(dateString) && parseDate(dateString) !== null
}

export function numberOfDays(first, second) {
  const firstUtc = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate())
  const secondUtc = Date.UTC(second.getFullYear(), second.getMonth(), second.getDate())
  const differenceInDays = Math.abs(secondUtc - firstUtc) / (1000 * 3600 * 24)
  return differenceInDays + 1
}

export function validateShortTermDateRange(startDate, endDate) {
  const start = parseDate(startDate)
  const end = parseDate(endDate)

  if (!start || !end) {
    return { valid: true, message: '' }
  }

  if (start.getTime() === end.getTime()) {
    return { valid: false, message: 'Poistenie musí trvať aspoň 2 dni.' }
  }

  if (end.getTime() < start.getTime()) {
    return { valid: false, message: 'Koniec poistenia musí byť po začiatku.' }
  }

  if (numberOfDays(start, end) > 364) {
    return { valid: false, message: 'Maximálna dĺžka krátkodobého poistenia je 364 dní.' }
  }

  return { valid: true, message: '' }
}

export function validatePersonCount(value, min = MIN_PERSONS, max = MAX_PERSONS) {
  const numericValue = Number(value)
  if (!Number.isInteger(numericValue)) {
    return { valid: false, message: `Počet osôb musí byť celé číslo od ${min} do ${max}.` }
  }
  if (numericValue < min || numericValue > max) {
    return { valid: false, message: `Počet osôb musí byť v rozsahu ${min} až ${max}.` }
  }
  return { valid: true, message: '' }
}

export function calculateInsuranceSum({
  typ,
  zaciatokPoistenia,
  koniecPoistenia,
  balikId,
  pocetOsob,
  pripoistenia = []
}) {
  const selectedBalik = balikMoznosti.find((item) => item.id === balikId)
  if (!selectedBalik) {
    throw new Error('Vyberte balík poistenia.')
  }

  const personCountValidation = validatePersonCount(pocetOsob)
  if (!personCountValidation.valid) {
    throw new Error(personCountValidation.message)
  }
  const personCount = Number(pocetOsob)

  const priceType = typ === 'kratkodobe' ? 'kratkodoba' : 'celorocna'
  const zakladnaCena = selectedBalik[`${priceType}_cena`]
  const prirazkaKey = `${priceType}_prirazka`
  const activeAddons = new Set(pripoistenia)

  const storno = activeAddons.has('storno_cesty')
    ? (pripoisteniaMoznosti.find((item) => item.id === 'storno_cesty')?.[prirazkaKey] || 1)
    : 1
  const sportove = activeAddons.has('sportove_aktivity')
    ? (pripoisteniaMoznosti.find((item) => item.id === 'sportove_aktivity')?.[prirazkaKey] || 1)
    : 1

  let pocetDni = 1
  if (typ === 'kratkodobe') {
    const rangeValidation = validateShortTermDateRange(zaciatokPoistenia, koniecPoistenia)
    if (!rangeValidation.valid) {
      throw new Error(rangeValidation.message)
    }

    const start = parseDate(zaciatokPoistenia)
    const end = parseDate(koniecPoistenia)
    pocetDni = numberOfDays(start, end)
  }

  return pocetDni * zakladnaCena * personCount * storno * sportove
}

export function formatCurrency(amount) {
  return `Suma: ${amount.toFixed(2).replace('.', ',')} €`
}
