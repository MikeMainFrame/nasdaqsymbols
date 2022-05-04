"use strict";
const express = require( "express" );
const A = express();
const axios = require( "axios" ).default;
const {
  Storage
} = require( '@google-cloud/storage' );
const storage = new Storage();
var template = 'Ø';
var splits = [];
var nasdaq = "";
var chart = "";
var specs = {};


A.use( express.json() );

A.use( "/", express.static( "public", {
  index: "nsMain.html"
} ) );
A.listen( process.env.PORT || 3000, () => {
  console.log( "all ears ear ea r, Press Ctrl+C to quit." );
} );
A.get( "/yahoo/summary/code/:code", async ( request, response ) => {

  axios.request( {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-summary',
      params: {
        symbol: request.params.code,
        region: 'US',
      },
      headers: {
        'x-rapidapi-key': process.env.YAHOO,
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    } )
    .then( function ( nasdaq ) {
      var specs = {};

      specs.longName = nasdaq.data.price[ "longName" ];
      specs.longBusinessSummary = nasdaq.data.summaryProfile[ "longBusinessSummary" ];
      specs.fullTimeEmployees = nasdaq.data.summaryProfile[ "fullTimeEmployees" ];
      specs.address1 = nasdaq.data.summaryProfile[ "address1" ];
      specs.currency = nasdaq.data.earnings[ "financialCurrency" ];
      specs.city = nasdaq.data.summaryProfile[ "city" ];
      specs.zip = nasdaq.data.summaryProfile[ "zip" ];
      specs.state = nasdaq.data.summaryProfile[ "state" ];
      specs.country = nasdaq.data.summaryProfile[ "country" ];
      specs.industry = nasdaq.data.summaryProfile[ "industry" ];
      specs.sector = nasdaq.data.summaryProfile[ "sector" ];
      specs.mCap = nasdaq.data.summaryDetail[ "marketCap" ].longFmt;
      specs.ebitda = nasdaq.data.financialData[ "ebitdaMargins" ].fmt;

      response.set( "Content-Type", "application/json; charset=UTF-8" );
      response.send( JSON.stringify( specs ) );
    } )
    .catch( E => {
      console.log( E )
    } );
} );
A.get( "/yahoo/holders/code/:code", async ( request, response ) => {

  axios.request( {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-holders',
      params: {
        symbol: request.params.code,
        region: 'US',
      },
      headers: {
        'x-rapidapi-key': process.env.YAHOO,
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    } )
    .then( function ( nasdaq ) {
      var specs = [];

      nasdaq.data.insiderTransactions.transactions.map( ( O ) => {
        if ( "value" in O ) {
          specs.push( O )
        }
      } )
      //specs.longName = nasdaq.data.price.insiderTransactions.transactions[0].filerName;


      response.set( "Content-Type", "application/json; charset=UTF-8" );
      response.send( JSON.stringify( specs ) );
    } )
    .catch( E => {
      console.log( E )
    } );
} );
A.get( "/yahoo/market", async ( request, response ) => {

  var slam = await getTemplate();

  splits = slam.split( "##" );

  axios.request( {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/market/get-popular-watchlists',
      headers: {
        'x-rapidapi-key': process.env.YAHOO,
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    } )

    .then( function ( nasdaq ) {

      var O = trWrap( thWrap( "Name" ) + thWrap( "Desc." ) )
      nasdaq.data.finance.result[ 0 ].portfolios.map( ( N ) => {
        O = O + trWrap( tdWrap( N.name ) + tdWrap( N.description ) )
      } );
      O = tableWrap( O )
      response.type( 'html' )
      response.send( splits[ 0 ] + O + splits[ 2 ] );

    } )
    .catch( E => {
      console.log( E )
    } );

} );
A.get( "/yahoo/financial/code/:code", async ( request, response ) => {

  axios.request( {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-financials',
      params: {
        symbol: request.params.code,
        region: 'US',
        interval: '5m',
        range: '1d'
      },
      headers: {
        'x-rapidapi-key': process.env.YAHOO,
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    } )
    .then( function ( nasdaq ) {

      specs.incomeStatementHistory = nasdaq.body?.incomeStatementHistoryprice;

      response.set( "Content-Type", "application/json; charset=UTF-8" );
      response.send( JSON.stringify( specs ) );
    } )
    .catch( E => {
      console.log( E )
    } );

} );

A.get( "/yahoo/chart/code/:code", ( request, response ) => {

  axios.request( {
      method: 'GET',
      url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-chart',
      params: {
        interval: '5m',
        symbol: request.params.code,
        region: 'US'
      },
      headers: {
        'x-rapidapi-key': process.env.YAHOO,
        'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
      }
    } )
    .then( function ( nasdaq ) {

      var collection = [];

      chart = nasdaq.data.chart.result[ 0 ]

      chart.timestamp.map( ( T, ix ) => {
        var slot = {};

        slot.timestamp = T;
        slot.close = parseInt( chart.indicators.quote[ 0 ].close[ ix ] );
        slot.volume = parseInt( chart.indicators.quote[ 0 ].volume[ ix ] );
        slot.low = parseInt( chart.indicators.quote[ 0 ].low[ ix ] );
        slot.high = parseInt( chart.indicators.quote[ 0 ].high[ ix ] );
        slot.open = parseInt( chart.indicators.quote[ 0 ].open[ ix ] );

        collection.push( slot );
      } );
      response.type( 'json' )
      response.send( JSON.stringify( collection ) );
    } )
    .catch( E => {
      console.log( E )
    } );

} )

A.get( "/yahoo/chart/history/code/:code", ( request, response ) => {

  axios.request( {
      method: 'GET',
      url: 'https://yh-finance.p.rapidapi.com/stock/v3/get-chart',
      params: {
        interval: '1d',
        symbol: request.params.code,        
        region: 'US',
        period1: request.query.p1,
        period2: request.query.p2,
        includePrePost: 'false',
        useYfid: 'true',
        includeAdjustedClose: 'true',
        events: 'capitalGain,div,split'
      },
      headers: {
        'X-RapidAPI-Host': 'yh-finance.p.rapidapi.com',
        'X-RapidAPI-Key': process.env.YAHOO
      }
    } )
   
    .then( function ( nasdaq ) {

      var collection = [];

      nasdaq.data.chart.result[ 0 ].timestamp.map( ( T, ix ) => {
        var slot = {};
        slot.timestamp = T;
        slot.dateISO = new Date(T * 1e3).toISOString();
        slot.close = parseInt( chart.indicators.quote[ 0 ].close[ ix ] );
        slot.volume = parseInt( chart.indicators.quote[ 0 ].volume[ ix ] );
        slot.low = parseInt( chart.indicators.quote[ 0 ].low[ ix ] );
        slot.high = parseInt( chart.indicators.quote[ 0 ].high[ ix ] );
        slot.open = parseInt( chart.indicators.quote[ 0 ].open[ ix ] );

        collection.push( slot );
      } );
      response.type( 'json' )
      response.send( JSON.stringify( collection ) );
    } )
    .catch( E => {
      console.log( E )
    } );

} )


A.get( "/yahoo/holders/code/:code", ( request, response ) => {

  getTemplate()
    .then( ( value ) => {

      axios.request( {
          method: 'GET',
          url: 'https://apidojo-yahoo-finance-v1.p.rapidapi.com/stock/v2/get-holders',
          params: {
            symbol: request.params.code,
            region: 'US',
          },
          headers: {
            'x-rapidapi-key': process.env.YAHOO,
            'x-rapidapi-host': 'apidojo-yahoo-finance-v1.p.rapidapi.com'
          }
        } )
        .then( function ( nasdaq ) {

          splits = value.split( "##" ); // template is split in head body and footer - we pump up body  i.e. splits[1]

          var W = {};

          for ( var ix = 0; ix < nasdaq.data?.insiderTransactions.transactions.length; ix++ ) {
            W = nasdaq.data.insiderTransactions.transactions[ ix ]
            if ( 'filerName' in W ) splits[ 1 ] = splits[ 1 ] + "name:" + W.filerName
          }
          response.type( 'html' )
          response.send( splits.join( "" ) );
        } )
        .catch( E => {
          console.log( E )
        } );
    } )
} )


async function getTemplate() {
  return new Promise( ( resolve, reject ) => {
    const page = storage.bucket( 'nasdaqcomponents' ).file( 'ns.html' );
    var data = [];
    var aggregate = "";

    aggregate = page.createReadStream();
    aggregate.on( 'data', ( fragment ) => {
      data.push( fragment )
    } );
    aggregate.on( 'end', () => {
      template = Buffer.concat( data ).toString( 'utf8' )
      resolve( template );
    } )
    aggregate.on( 'error', ( E ) => reject( E ) );
  } );
}

function tdWrap( text ) {
  return "<td>" + text + "</td>"
}

function thWrap( text ) {
  return "<th>" + text + "</th>"
}

function trWrap( text ) {
  return "<tr>" + text + "</tr>"
}

function tableWrap( text ) {
  return "<table>" + text + "</table>"
}