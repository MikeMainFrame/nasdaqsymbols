'use strict'
const express = require( 'express' )
const A = express()
const axios = require( 'axios' ).default
const { PubSub } = require( '@google-cloud/pubsub' );
const { Storage } = require( '@google-cloud/storage' )
const timestamp = require( './timestamp.js' );
const keyData = require( './keyData.js' );


//let template = 'Ø'

// is this in github ?

A.use( express.json() )

A.use( '/', express.static( 'public', { index: 'nsMain.html', } ) )

A.listen( process.env.PORT || 3000, () => {
  publishMessage( 'server started at: ' + timestamp() )
  //synchronousPull();
  console.log( 'all ears ear ea r, Press Ctrl+C to quit.' )
} )

A.get( '/yahoo/csv', async ( request, response ) => {
  let temp = await getTemplate( 'saxo2022.txt' )
  let x = [], y = [];
  let D = temp.split( '\x0D\x0A' )
  D.map( ( element ) => {
    var L = element.split( "," );    
    for ( let ix = 0; ix < L.length; ix++ ) {
      x.push(tdWrap( L[ ix ] ))
    }
    y.push( trWrap( x.join('')));
    x = [];
  } )

  response.type( 'html' )
  response.send( tableWrap( y.join('') ) )
} )

A.get( '/yahoo/summary/code/:code', async ( request, response ) => {

  const nasdaq = await axios.get( 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary', {
    params: {
      symbol: request.params.code,
      region: 'US',
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    },
  } )

  var specs = {}

  specs.longName = nasdaq.data.price[ 'longName' ]
  specs.longBusinessSummary = nasdaq.data.summaryProfile[ 'longBusinessSummary' ].split( '.' ).join( '.<br>' )
  specs.fullTimeEmployees = nasdaq.data.summaryProfile[ 'fullTimeEmployees' ]
  specs.address1 = nasdaq.data.summaryProfile[ 'address1' ]
  specs.currency = nasdaq.data.earnings[ 'financialCurrency' ]
  specs.city = nasdaq.data.summaryProfile[ 'city' ]
  specs.zip = nasdaq.data.summaryProfile[ 'zip' ]
  specs.state = nasdaq.data.summaryProfile[ 'state' ]
  specs.country = nasdaq.data.summaryProfile[ 'country' ]
  specs.industry = nasdaq.data.summaryProfile[ 'industry' ]
  specs.sector = nasdaq.data.summaryProfile[ 'sector' ]
  specs.mCap = nasdaq.data.summaryDetail[ 'marketCap' ].longFmt
  specs.ebitda = nasdaq.data.financialData[ 'ebitdaMargins' ].fmt

  response.type( 'json' )
  response.send( JSON.stringify( specs, null, 2 ) )
} )


A.get( '/yahoo/financial/code/:code', async ( request, response ) => {

  const nasdaq = await axios.get( 'https://yh-finance.p.rapidapi.com/stock/v2/get-financials', {
    params: {
      symbol: request.params.code,
      region: 'US',
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    }
  } )


  response.type( 'html' )
  response.send( keyData( nasdaq.data.price ) )

} )


A.get( '/yahoo/chart/code/:code', async ( request, response ) => {

  const nasdaq = await axios.get( 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart', {
    params: {
      interval: '5m',
      symbol: request.params.code,
      region: 'US',
    },
    headers: {
      'x-rapidapi-key': process.env.YAHOO,
      'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    },
  } )

  putNASDAQ( nasdaq.data, nasdaq.data.chart.result[ 0 ].meta )

  let collection = []

  nasdaq.data.chart.result[ 0 ].timestamp.map( ( T, ix ) => {
    var slot = {}
    slot.timestamp = T
    slot.dateISO = new Date( slot.timestamp * 1e3 ).toISOString()
    slot.close = fixed99( nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].close[ ix ] )
    slot.volume = fixed99( nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].volume[ ix ] )
    slot.low = fixed99( nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].low[ ix ] )
    slot.high = fixed99( nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].high[ ix ] )
    slot.open = fixed99( nasdaq.data.chart.result[ 0 ].indicators?.quote[ 0 ].open[ ix ] )

    collection.push( slot )
  } )

  response.type( 'json' )
  response.send( JSON.stringify( collection, null, 2 ) )
} )

A.get( '/yahoo/chart/history/local/code/:code', async ( request, response ) => {

  const storage = new Storage()
  const [ collection ] = await storage.bucket( 'nasdaqprices' ).getFiles( { prefix: 'symbols/' + request.params.code } )

  collection.forEach( file => {
    html += tdWrap( file.metadata.name )
    html = trWrap( html )
  } )

  html = tableWrap( html )
  response.type( 'html' )
  response.send( html )

} )

A.get( '/yahoo/chart/history/code/:code', async ( request, response ) => {

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

  let collection = []

  nasdaq.data.chart.result[ 0 ].timestamp.map( ( T, ix ) => {
    let slot = {}
    slot.timestamp = T
    slot.dateISO = new Date( T * 1e3 ).toISOString()
    slot.close = nasdaq.data.chart.result[ 0 ].close[ ix ]
    slot.volume = nasdaq.data.chart.result[ 0 ].volume[ ix ]
    slot.low = nasdaq.data.chart.result[ 0 ].low[ ix ]
    slot.high = nasdaq.data.chart.result[ 0 ].high[ ix ]
    slot.open = nasdaq.data.chart.result[ 0 ].open[ ix ]

    collection.push( slot )
  } )

  response.type( 'json' )
  response.send( JSON.stringify( collection, null, 2 ) )
} )


A.get( '/yahoo/newsletter/code/:code', async ( request, response ) => {
  const { newsLetter } = require( './newsLetter.js' );
  if ( request.params.code === 'owlwolf' ) newsLetter();
} )

A.get( '/yahoo/holders/code/:code', async ( request, response ) => {

  const nasdaq = await axios.get( 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-holders',
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

  let splits = [];
  let W = {}

  html = trWrap( thWrap( 'who' ) + thWrap( 'what' ) + thWrap( 'when' ) + thWrap( 'value' ) );

  for ( let ix = 0; ix < nasdaq.data?.insiderTransactions.transactions.length; ix++ ) {
    W = nasdaq.data?.insiderTransactions.transactions[ ix ] || {}
    if ( 'filerName' in W ) html = html
      + trWrap(
        tdWrap( W.filerName )
        + tdWrap( W.transactionText )
        + tdWrap( W.startDate.fmt )
        + tdWrap( W.shares.fmt )
      )
  }
  html = tableWrap( html )
  response.type( 'html' )
  response.send( html )
  //response.send(splits.join(''))
} )


async function getTemplate( what ) {


  const storage = new Storage()
  const nasdaqTemplate = storage.bucket( 'nasdaqcomponents' ).file( what )

  let data = [];
  let aggregate = '';
  let template = '';

  aggregate = nasdaqTemplate.createReadStream()
  aggregate.on( 'data', ( fragment ) => { data.push( fragment ) } )

  return new Promise( ( resolve, reject ) => {
    aggregate.on( 'end', () => { template = Buffer.concat( data ).toString( 'utf8' ); resolve( template ) } )
    aggregate.on( 'error', ( E ) => reject( E ) )
  } )

}

function putNASDAQ( apiData, meta ) {
  let fileName = "-" + timestamp( meta.regularMarketTime * 1e3 )
  const storage = new Storage()
  const F = storage.bucket( 'nasdaqprices' ).file( `symbols/${meta.symbol}.${fileName}.json` );
  F.save( JSON.stringify( apiData ), function ( E ) { if ( E ) console.log( E ) } )
}

function fixed99( str ) {
  return Number.parseFloat( str ).toFixed( 2 );
}

function tdWrap( text ) {
  return "<td style='border: solid; padding: .5em;text-align: center;' >" + text + '</td>'
}

function thWrap( text, noOfCols = 1 ) {
  return `<th style='text-align: center; padding: .5em' colspan=${noOfCols} > ${text}</th>`
}

function trWrap( text ) {
  return "<tr>" + text + '</tr>'
}

function tableWrap( str ) {
  return "<table style='border-collapse:collapse'>" + str + "</table>"
}

async function publishMessage( what ) {

  const pubSubClient = new PubSub();
  const dataBuffer = Buffer.from( what );

  try {
    const messageId = await pubSubClient
      .topic( 'news' )
      .publishMessage( { data: dataBuffer } );
  } catch ( error ) {
    console.error( `Received error while publishing: ${error.message}` );
    process.exitCode = 1;
  }
}



