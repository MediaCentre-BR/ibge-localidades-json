# IBGE: Localidades JSON

Arquivos JSON de localidades do Brasil para Regiões, Estados, Cidades e Distritos. Compilados a partir da base pública de localidades do IBGE.

## Como usar estes dados?

Estes arquivos foram compilados para servir ao desenvolvimento aplicações que precisem de dados sobre localidades do Brasil.

Use-os livremente em seus projetos, mas lembre-se de citar a fonte.

## Arquivos

- `regioes.json` - 159b, 5 Regiões
- `estados.json` - 1.3K, 27 Estados
- `cidades.json` - 353K, 5.570 Cidades
- `distritos.json` - 1.1M, 10.670 Distritos
- `capitais.json` - 1.7K, 27 Capitais (também presentes em `cidades.json`)

## Interface dos dados

```ts
// regioes.json : Regiao[]
interface Regiao {
  sigla: string
  nome: string
}

// estados.json : Estado[]
interface Estado {
  sigla: string
  nome: string
  regiao: Regiao['sigla']
}

// cidades.json : Cidade[]
interface Cidade {
  id: number
  nome: string
  estado: Estado['sigla']
  regiao: Regiao['sigla']
}

// distritos.json : Distrito[]
interface Distrito {
  id: number
  nome: string
  cid: Cidade['id']
  cidade: Cidade['nome']
  estado: Estado['sigla']
  regiao: Regiao['sigla']
}
```

## Como atualizar estes dados?

Esses dados não são atualizados com frequência. Mas quando necessário atualizar, siga os passos abaixo:

- Clone este repositório com Git
- Abra-o como um projeto no VSCode (ou outro editor de sua preferência)
- Crie uma nova branch git para suas alterações
- Instale as dependências (Você precisa ter o Node.js instalado e o `npm`, `yarn` ou `pnpm` disponível)
- Execute o script `build` (`npm run build` ou `yarn build` ou `pnpm build`)
- Faça commit/push das alterações
- Abra um Pull Request para a branch `main` deste repositório
