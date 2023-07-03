import { join } from 'path'
import { readFileSync, writeFileSync } from 'fs'
import fetch from 'node-fetch'

const root = process.cwd()
const api = 'http://servicodados.ibge.gov.br/api'

// Get data from IBGE API
export async function getData(endpoint) {
  const url = `${api}/${endpoint}`
  const data = await fetch(url)
  return data
}

// Get locals from IBGE API
export async function getLocals(endpoint) {
  const data = await getData(`v1/localidades/${endpoint}`)
  return data.json()
}

// Get geo metadata from IBGE API
export async function getGeoData(id) {
  const data = await getData(`v3/malhas/municipios/${id}/metadados`)

  try {
    const list = await data.json()
    return list[0]
  } catch {
    return null
  }
}

// Write data to a JSON file
export function writeData(data, file) {
  const dest = join(root, file)
  const json = JSON.stringify(data)
  writeFileSync(dest, json)
}

// Get regions from IBGE API and write to JSON files
export async function getRegions() {
  const data = await getLocals('regioes?orderBy=nome')
  const result = data.map((region) => {
    delete region.id
    return region
  })
  console.log(data.length, 'regiões...')
  writeData(data, 'regioes.json')
}

// Get states from IBGE API and write to JSON files
export async function getStates() {
  const data = await getLocals('estados?orderBy=nome')
  const result = data.map((state) => {
    state.regiao = state.regiao.sigla
    delete state.id
    return state
  })
  console.log(result.length, 'estados...')
  writeData(result, 'estados.json')
}

// Get cities from IBGE API and write to JSON files
export async function getCities() {
  const data = await getLocals('municipios?orderBy=nome')
  const result = await Promise.all(
    data.map((city, i) => {
      city.uf = city.microrregiao.mesorregiao.UF.sigla
      city.estado = city.microrregiao.mesorregiao.UF.nome
      city.regiao = city.microrregiao.mesorregiao.UF.regiao.sigla

      delete city.microrregiao
      delete city.mesorregiao
      delete city['regiao-imediata']

      return new Promise((resolve) => {
        setTimeout(async () => {
          const location = await getGeoData(city.id)
          city.centroide = location.centroide
          resolve(city)
        }, i * 10)
      })
    })
  )

  console.log(result.length, 'cidades...')
  writeData(result, 'cidades.json')
}

// Get Districts from IBGE API and write to JSON files
export async function getDistricts() {
  const data = await getLocals('distritos?orderBy=nome')
  const result = data.map((district) => {
    district.cid = district.municipio.id
    district.cidade = district.municipio.nome
    district.uf = district.municipio.microrregiao.mesorregiao.UF.sigla
    district.estado = district.municipio.microrregiao.mesorregiao.UF.nome
    district.regiao =
      district.municipio.microrregiao.mesorregiao.UF.regiao.sigla

    delete district.municipio

    return district
  })
  console.log(result.length, 'distritos...')
  writeData(result, 'distritos.json')
}

// Filter only capital cities from each state
export async function getCapitals() {
  // List of all capital cities
  const capitals = [
    { uf: 'AC', nome: 'Rio Branco' },
    { uf: 'AL', nome: 'Maceió' },
    { uf: 'AM', nome: 'Manaus' },
    { uf: 'AP', nome: 'Macapá' },
    { uf: 'BA', nome: 'Salvador' },
    { uf: 'CE', nome: 'Fortaleza' },
    { uf: 'DF', nome: 'Brasília' },
    { uf: 'ES', nome: 'Vitória' },
    { uf: 'GO', nome: 'Goiânia' },
    { uf: 'MA', nome: 'São Luís' },
    { uf: 'MG', nome: 'Belo Horizonte' },
    { uf: 'MS', nome: 'Campo Grande' },
    { uf: 'MT', nome: 'Cuiabá' },
    { uf: 'PA', nome: 'Belém' },
    { uf: 'PB', nome: 'João Pessoa' },
    { uf: 'PE', nome: 'Recife' },
    { uf: 'PI', nome: 'Teresina' },
    { uf: 'PR', nome: 'Curitiba' },
    { uf: 'RJ', nome: 'Rio de Janeiro' },
    { uf: 'RN', nome: 'Natal' },
    { uf: 'RO', nome: 'Porto Velho' },
    { uf: 'RR', nome: 'Boa Vista' },
    { uf: 'RS', nome: 'Porto Alegre' },
    { uf: 'SC', nome: 'Florianópolis' },
    { uf: 'SE', nome: 'Aracaju' },
    { uf: 'SP', nome: 'São Paulo' },
    { uf: 'TO', nome: 'Palmas' },
  ]
  const josn = join(root, 'cidades.json')
  const data = readFileSync(josn, 'utf8')
  const cities = JSON.parse(data)
  const result = await Promise.all(
    capitals.map(async (cap) => {
      const city = cities.find(
        (city) => city.nome === cap.nome && city.uf === cap.uf
      )

      // const location = await getLocationData(city.nome, city.estado)

      // if (location) {
      //   city.lat = location.lat
      //   city.lon = location.lon
      // }

      return city
    })
  )
  console.log(result.length, 'capitais...')
  writeData(result, 'capitais.json')
}

// Run all functions
console.log('Obtendo localidades da base IBGE...')
Promise.all([getRegions(), getStates(), getCities(), getDistricts()]).then(
  async () => {
    await getCapitals()
    console.log('Localidades salvas em arquivos JSON!')
  }
)
