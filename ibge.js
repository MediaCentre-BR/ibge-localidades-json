import { join } from 'path'
import { writeFileSync } from 'fs'
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
  const result = data.map((city) => {
    city.estado = city.microrregiao.mesorregiao.UF.sigla
    city.regiao = city.microrregiao.mesorregiao.UF.regiao.sigla

    delete city.microrregiao
    delete city.mesorregiao
    delete city['regiao-imediata']

    return city
  })
  console.log(result.length, 'cidades...')
  writeData(result, 'cidades.json')
}

// Get Districts from IBGE API and write to JSON files
export async function getDistricts() {
  const data = await getLocals('distritos?orderBy=nome')
  const result = data.map((district) => {
    district.cid = district.municipio.id
    district.cidade = district.municipio.nome
    district.estado = district.municipio.microrregiao.mesorregiao.UF.sigla
    district.regiao =
      district.municipio.microrregiao.mesorregiao.UF.regiao.sigla

    delete district.municipio

    return district
  })
  console.log(result.length, 'distritos...')
  writeData(result, 'distritos.json')
}

// Run all functions
console.log('Obtendo localidades da base IBGE...')
Promise.all([getRegions(), getStates(), getCities(), getDistricts()]).then(
  () => {
    console.log('Localidades prontas na pasta public/ibge!')
  }
)
