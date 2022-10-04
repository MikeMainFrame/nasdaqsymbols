'use strict'
const express = require( 'express' )
const A = express()
const axios = require( 'axios' ).default
const { PubSub } = require( '@google-cloud/pubsub' );
const { Storage } = require( '@google-cloud/storage' )
const timestamp = require( './timestamp.js' );

//let template = 'Ø'

// is this in github ?

A.use( express.json() )

A.use( '/', express.static( 'public', { index: 'nsMain.html', } ) )

A.listen( process.env.PORT || 3000, () => {
  publishMessage( 'server started at: ' + timestamp() )
  //synchronousPull();
  console.log( 'all ears ear ea r, Press Ctrl+C to quit.' )
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

  let splits = [];

  splits[ 0 ] += thWrap( "Open" )
  splits[ 1 ] += tdWrap( `${nasdaq.data.price.regularMarketOpen.fmt}` )

  splits[ 0 ] += thWrap( "Prev" )
  splits[ 1 ] += tdWrap( nasdaq.data.price.regularMarketPreviousClose.fmt )

  splits[ 0 ] += thWrap( "Volume " )
  splits[ 1 ] += tdWrap( nasdaq.data.price.regularMarketVolume.longFmt )

  splits[ 0 ] += thWrap( nasdaq.data.price.currencySymbol )
  splits[ 1 ] += tdWrap( nasdaq.data.price.regularMarketPrice.fmt )

  splits[ 0 ] += thWrap( "⬆️" )
  splits[ 1 ] += tdWrap( nasdaq.data.price.regularMarketDayHigh.fmt )

  splits[ 0 ] += thWrap( "⬇" )
  splits[ 1 ] += tdWrap( nasdaq.data.price.regularMarketDayLow.fmt )

  splits[ 0 ] += thWrap( "Pre T" )
  splits[ 1 ] += tdWrap( new Date( nasdaq.data.price.preMarketTime * 1e3 ).toTimeString().substring( 0, 8 ) )

  splits[ 0 ] += thWrap( "Pre Price" )
  splits[ 1 ] += tdWrap( nasdaq.data.price.preMarketPrice.fmt )

  splits[ 0 ] += thWrap( "Pre Change" )
  splits[ 1 ] += tdWrap( nasdaq.data.price.preMarketChange.fmt )

  splits[ 0 ] += thWrap( "Post T" )
  splits[ 1 ] += tdWrap( new Date( nasdaq.data.price.postMarketTime * 1e3 ).toTimeString().substring( 0, 8 ) )

  splits[ 0 ] += thWrap( "Post Price" )
  splits[ 1 ] += tdWrap( nasdaq.data.price.postMarketPrice.fmt )

  splits[ 0 ] += thWrap( "Post Change" )
  splits[ 1 ] += tdWrap( nasdaq.data.price.postMarketChange.fmt )

  splits[ 0 ] += thWrap( "Deadline " )
  splits[ 1 ] += tdWrap( new Date( nasdaq.data.price.regularMarketTime * 1e3 ).toTimeString().substring( 0, 8 ) )


  response.type( 'html' )
  response.send( tableWrap( trWrap( splits[ 0 ] ) + trWrap( splits[ 1 ] ) ) )

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

  let html = "";
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

  var collection = []

  nasdaq.data.chart.result[ 0 ].timestamp.map( ( T, ix ) => {
    var slot = {}
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
  if ( request.params.code === 'owlwolf' ) newsletter();
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

  splits[ 1 ] = trWrap( thWrap( 'who' ) + thWrap( 'what' ) + thWrap( 'when' ) + thWrap( 'value' ) );

  for ( var ix = 0; ix < nasdaq.data?.insiderTransactions.transactions.length; ix++ ) {
    W = nasdaq.data?.insiderTransactions.transactions[ ix ] || {}
    if ( 'filerName' in W ) splits[ 1 ] = splits[ 1 ]
      + trWrap(
        tdWrap( W.filerName )
        + tdWrap( W.transactionText )
        + tdWrap( W.startDate.fmt )
        + tdWrap( W.shares.fmt )
      )
  }
  splits[ 1 ] = tableWrap( splits[ 1 ] )
  response.type( 'html' )
  response.send( splits[ 1 ] )
  //response.send(splits.join(''))
} )


async function getTemplate( what ) {

  const nasdaqTemplate = storage.bucket( 'nasdaqcomponents' ).file( what )

  let data = [];
  let aggregate = '';

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
  return "<td>" + text + '</td>'
}

function thWrap( text ) {
  return "<th>" + text + '</th>'
}

function trWrap( text ) {
  return "<tr>" + text + '</tr>'
}

function tableWrap( str ) {
  return "<table style='margin: 0.2em'>" + str + "</table>"
}

async function publishMessage( data ) {

  const pubSubClient = new PubSub();
  const dataBuffer = Buffer.from( data );

  try {
    const messageId = await pubSubClient
      .topic( 'news' )
      .publishMessage( { data: dataBuffer } );
  } catch ( error ) {
    console.error( `Received error while publishing: ${error.message}` );
    process.exitCode = 1;
  }
}

async function synchronousPull() {

  const { PubSub } = require( '@google-cloud/pubsub' );
  const pubsub = new PubSub();

  const topic = pubsub.topic( 'projects/nasdaqsymbols/topics/news' );
  const subscription = topic.subscription( 'projects/nasdaqsymbols/subscriptions/news' );

  subscription.on( 'message', message => {
    console.log( JSON.stringify( Buffer.from( message.data ).toString( 'utf8' ), null, 2 ) )
    message.ack();
  } );


}
