'use strict'
const express = require('express')
const A = express()
const axios = require('axios').default
const { Storage } = require('@google-cloud/storage')
const storage = new Storage()
//let template = 'Ø'

// is this in github ?

A.use(express.json())

A.use('/', express.static('public', { index: 'nsMain.html', }))

A.listen(process.env.PORT || 3000, () => { console.log('all ears ear ea r, Press Ctrl+C to quit.') })

A.get('/yahoo/summary/code/:code', async (request, response) => {

  const nasdaq = await axios.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary', {
    params: {
      symbol: request.params.code,
      region: 'US',
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    },
  })

  var specs = {}

  specs.longName = nasdaq.data.price['longName']
  specs.longBusinessSummary = nasdaq.data.summaryProfile['longBusinessSummary'].split('.').join('.<br>')
  specs.fullTimeEmployees = nasdaq.data.summaryProfile['fullTimeEmployees']
  specs.address1 = nasdaq.data.summaryProfile['address1']
  specs.currency = nasdaq.data.earnings['financialCurrency']
  specs.city = nasdaq.data.summaryProfile['city']
  specs.zip = nasdaq.data.summaryProfile['zip']
  specs.state = nasdaq.data.summaryProfile['state']
  specs.country = nasdaq.data.summaryProfile['country']
  specs.industry = nasdaq.data.summaryProfile['industry']
  specs.sector = nasdaq.data.summaryProfile['sector']
  specs.mCap = nasdaq.data.summaryDetail['marketCap'].longFmt
  specs.ebitda = nasdaq.data.financialData['ebitdaMargins'].fmt

  response.type('json')
  response.send(JSON.stringify(specs, null, 2))
})


A.get('/yahoo/financial/code/:code', async (request, response) => {

  const nasdaq = await axios.get('https://yh-finance.p.rapidapi.com/stock/v2/get-financials', {
    params: {
      symbol: request.params.code,
      region: 'US',
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    }
  })

  let splits = [];

  splits.push(trWrap(thWrap(`Open Price ${nasdaq.data.price.currencySymbol}${ tdWrap(nasdaq.data.price.regularMarketOpen.fmt)}`)))  
  splits.push(trWrap(thWrap("Previous Close ") + tdWrap(nasdaq.data.price.regularMarketPreviousClose.fmt))) 
  splits.push(trWrap(thWrap("Volume ") + tdWrap(nasdaq.data.price.regularMarketVolume.longFmt)))
  splits.push(trWrap(thWrap("Price ") + tdWrap(nasdaq.data.price.regularMarketPrice.fmt)))
  splits.push(trWrap(thWrap("Day ⬆️ ") + tdWrap(nasdaq.data.price.regularMarketDayHigh.fmt)))
  splits.push(trWrap(thWrap("Day ⬇ ") + tdWrap(nasdaq.data.price.regularMarketDayLow.fmt)))  

  splits.push(trWrap(thWrap("Pre Time") + tdWrap(new Date(nasdaq.data.price.preMarketTime * 1e3).toTimeString().substring(0,17)))) 
  splits.push(trWrap(thWrap("Pre Price") + tdWrap(nasdaq.data.price.preMarketPrice.fmt))) 
  splits.push(trWrap(thWrap("Pre Change") + tdWrap(nasdaq.data.price.preMarketChange.fmt))) 
  
  splits.push(trWrap(thWrap("Post Time") + tdWrap(new Date(nasdaq.data.price.postMarketTime * 1e3).toTimeString().substring(0,17)))) 
  splits.push(trWrap(thWrap("Post Price") + tdWrap(nasdaq.data.price.postMarketPrice.fmt))) 
  splits.push(trWrap(thWrap("Post Change") + tdWrap(nasdaq.data.price.postMarketChange.fmt))) 

  splits.push(trWrap(thWrap("Deadline ") + tdWrap(new Date(nasdaq.data.price.regularMarketTime * 1e3).toTimeString().substring(0,17))))



response.type('html')
response.send(tableWrap(splits.join(" ")))

})


A.get('/yahoo/chart/code/:code', async (request, response) => {

  const nasdaq = await axios.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart', {
    params: {
      interval: '5m',
      symbol: request.params.code,
      region: 'US',
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    },
  })

  let collection = []

  nasdaq.data.chart.result[0].timestamp.map((T, ix) => {
    var slot = {}
    slot.timestamp = T
    slot.dateISO = new Date(slot.timestamp * 1e3).toISOString()
    slot.close = fixed99(nasdaq.data.chart.result[0].indicators?.quote[0].close[ix])
    slot.volume = fixed99(nasdaq.data.chart.result[0].indicators?.quote[0].volume[ix])
    slot.low = fixed99(nasdaq.data.chart.result[0].indicators?.quote[0].low[ix])
    slot.high = fixed99(nasdaq.data.chart.result[0].indicators?.quote[0].high[ix])
    slot.open = fixed99(nasdaq.data.chart.result[0].indicators?.quote[0].open[ix])

    collection.push(slot)
  })

  response.type('json')
  response.send(JSON.stringify(collection, null, 2))
})


A.get('/yahoo/chart/history/code/:code', async (request, response) => {

  const nasdaq = await axios.get(
    'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart',
    {
      params: {
        interval: '1d',
        symbol: request.params.code,
        region: 'US',
        period1: request.query.p1,
        period2: request.query.p2,
        includePrePost: 'false',
        useYfid: 'true',
        includeAdjustedClose: 'true',
        events: 'capitalGain,div,split',
      },
      headers: {
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
        'X-RapidAPI-Key': process.env.YAHOO,
      },
    }
  )

  var collection = []

  nasdaq.data.chart.result[0].timestamp.map((T, ix) => {
    var slot = {}
    slot.timestamp = T
    slot.dateISO = new Date(T * 1e3).toISOString()
    slot.close = nasdaq.data.chart.result[0].close[ix]
    slot.volume = nasdaq.data.chart.result[0].volume[ix]
    slot.low = nasdaq.data.chart.result[0].low[ix]
    slot.high = nasdaq.data.chart.result[0].high[ix]
    slot.open = nasdaq.data.chart.result[0].open[ix]

    collection.push(slot)
  })

  response.type('json')
  response.send(JSON.stringify(collection, null, 2))
})


A.get('/yahoo/holders/code/:code', async (request, response) => {


  //const template = await getTemplate('ns.html')

  const nasdaq = await axios.get('https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-holders',
    {
      params: {
        symbol: request.params.code,
        region: 'US',
      },
      headers: {
        'x-rapidapi-key': process.env.YAHOO,
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
      },
    }
  )
  //var splits = template.split('##'), W = {};
  var W = {}
  splits[1] = trWrap(thWrap('who') + thWrap('what') + thWrap('when') + thWrap('value'));

  for (var ix = 0; ix < nasdaq.data?.insiderTransactions.transactions.length; ix++) {
    W = nasdaq.data?.insiderTransactions.transactions[ix] || {}
    if ('filerName' in W) splits[1] = splits[1]
      + trWrap(
        tdWrap(W.filerName)
        + tdWrap(W.transactionText)
        + tdWrap(W.startDate.fmt)
        + tdWrap(W.shares.fmt)
      )
  }
  splits[1] = tableWrap(splits[1])
  response.type('html')
  response.send(splits[1])
  //response.send(splits.join(''))
})


async function getTemplate(what) {

  const nasdaqTemplate = storage.bucket('nasdaqcomponents').file(what)

  var data = [], aggregate = ''

  aggregate = nasdaqTemplate.createReadStream()
  aggregate.on('data', (fragment) => { data.push(fragment) })

  return new Promise((resolve, reject) => {
    aggregate.on('end', () => { template = Buffer.concat(data).toString('utf8'); resolve(template) })
    aggregate.on('error', (E) => reject(E))
  })

}
function fixed99(str) {
  return Number.parseFloat(str).toFixed(2);
}

function tdWrap(text) {
  return "<td>" + text + '</td>'
}

function thWrap(text) {
  return "<th>" + text + '</th>'
}

function trWrap(text) {
  return "<tr>" + text + '</tr>'
}

function tableWrap(str) {
  return "<table style='margin: 0.2em'>" + str + "</table>"
}
