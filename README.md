# Trajeto

**Visualize seus caminhos ao longo do tempo.**

Trajeto é uma aplicação web responsiva para visualizar arquivos JSON exportados da Linha do Tempo do Google Maps. O histórico é organizado por mês e por dia em um mapa interativo, com visitas, deslocamentos, distâncias e trajetos registrados quando essas informações estão disponíveis no arquivo.

## Privacidade

O histórico de localização é processado localmente no navegador. Nesta versão, o arquivo importado não é enviado para servidor, banco de dados ou serviço externo e não há autenticação ou persistência do histórico.

Ao recarregar ou fechar a aplicação, os dados importados podem ser descartados.

## Funcionalidades

- Importação de arquivo JSON da Linha do Tempo do Google Maps.
- Identificação automática dos meses presentes no histórico.
- Visualização mensal e diária.
- Mapa interativo com visitas e deslocamentos.
- Uso de `timelinePath` quando o arquivo contém pontos detalhados do trajeto.
- Resumo de distância, deslocamentos, locais visitados e dias com registros.
- Timeline cronológica diária.
- Interface responsiva para desktop, tablet e celular.
- Processamento local do arquivo de histórico.

## Formato suportado

O parser atualmente reconhece o formato de exportação com registros contendo `startTime` e `endTime` e dados de:

- `visit`: locais visitados e candidatos de lugar;
- `activity`: origem, destino, distância e tipo provável de deslocamento;
- `timelinePath`: pontos intermediários registrados ao longo do trajeto.

O Trajeto não deve apresentar como rota exata um percurso que não esteja representado pelos pontos registrados no arquivo.

## Desenvolvimento

### Requisitos

- Node.js 22 ou compatível
- npm

### Instalação

```bash
npm install
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

A aplicação fica disponível por padrão em `http://localhost:3000`.

### Validação

```bash
npm run lint
npm run build
```

### Executar build de produção

```bash
npm run start
```

## Estrutura principal

```text
src/
  components/
  features/
    filters/
    import/
    map/
    timeline/
  lib/
    location-history/
      coordinates.ts
      dates.ts
      filters.ts
      normalizer.ts
      parser.ts
      types.ts
  routes/
```

A lógica de leitura e normalização do histórico fica isolada em `src/lib/location-history`, enquanto componentes de interface são organizados por funcionalidade.

## Tecnologias

React, TypeScript, TanStack Start, TanStack Router, Vite, Tailwind CSS, Leaflet e React Leaflet.
