// init one --------------------
let remember = 'Ø';
let href = window.location.href.split( "?" );
let getValues = {}
let symbols = href[ 1 ].split( "&" ).map( ( item ) => { let items = item.split( "=" ); getValues[ items[ 0 ] ] = items[ 1 ] } );
//init two ---------------------
let symbol = getValues[ "symbol" ];
let date = getValues[ "date" ]
let p1 = getValues[ "p1" ]
let p2 = getValues[ "p2" ]

getHistoryChartData();

function candleStickChart( prices ) {
  let x_w = 5000;
  let y_h = 1400
  let stroke = "#888";
  let color = '#f00';
  let w = x_w / prices.length / 2;
  let path = "";
  let max = 0;
  let min = 99999;

  let SVG = document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' );
  SVG.setAttribute( 'viewBox', '0 0 5000 1800' );

  prices.map( ( slot ) => {
    if ( slot.close > max ) max = slot.close;
    if ( slot.close < min ) min = slot.close;
  } )

  for ( let ix = 0; ix < prices.length; ix++ ) {

    ( ix > 0 && prices[ ix ].open > prices[ ix - 1 ].close ) ? color = "#F44747" : color = "#18BF69";

    let candle = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );

    path = "M "
      + stockPriceIntoXCord( ix, w ) + " , " + stockPriceIntoYCord( prices[ ix ].high, min, max, y_h )
      + " "
      + stockPriceIntoXCord( ix, w ) + " , " + stockPriceIntoYCord( prices[ ix ].low, min, max, y_h )


    candle.setAttribute( 'd', path );

    candle.setAttribute( 'data-high', prices[ ix ].high )
    candle.setAttribute( 'data-low', prices[ ix ].low )
    candle.setAttribute( 'stroke', stroke )
    candle.setAttribute( 'stroke-width', ( w / 5 ) )
    SVG.appendChild( candle )

    candle = document.createElementNS( 'http://www.w3.org/2000/svg', 'path' );

    path = "M "
      + stockPriceIntoXCord( ix, w ) + " ," + stockPriceIntoYCord( prices[ ix ].open, min, max, y_h )
      + " "
      + stockPriceIntoXCord( ix, w ) + " , " + stockPriceIntoYCord( prices[ ix ].close, min, max, y_h )

    candle.setAttribute( 'd', path );

    candle.setAttribute( 'data-time', prices[ ix ].dateISO )
    candle.setAttribute( 'data-open', prices[ ix ].open )
    candle.setAttribute( 'data-close', prices[ ix ].close )
    candle.setAttribute( 'stroke', color )
    candle.setAttribute( 'stroke-width', w )
    SVG.appendChild( candle )

  }

  return SVG

  function stockPriceIntoYCord( price, minY, maxY, height ) {
    let X = ( price - minY )
    let Y = ( maxY - minY )
    return parseInt( height + 200 - ( X / Y * height ) )
  }
  function stockPriceIntoXCord( slotNumber, columnWidth ) {
    return parseInt( slotNumber * columnWidth * 2 )
  }
}

function summaryData() {
  let xhr = new XMLHttpRequest();

  xhr.open( "GET", "/yahoo/summary/code/" + symbol );
  xhr.onreadystatechange = () => {
    if ( xhr.readyState === 4 ) {
      once( xhr.responseText );
    }
  };
  xhr.send();

  function once( json ) {
    let R = JSON.parse( json );

    document.getElementById( "zsymbol" ).textContent = symbol;
    document.getElementById( "zlongName" ).textContent = R.longName;
    document.getElementById( "zsummary" ).innerHTML = R.longBusinessSummary;
    document.getElementById( "zfullTimeEmployees" ).textContent = R.fullTimeEmployees;
    document.getElementById( "zaddress1" ).textContent = R.address1;
    document.getElementById( "zcurrency" ).textContent = R.currency;
    document.getElementById( "zcity" ).textContent = R.city;
    document.getElementById( "zip" ).textContent = R.zip;
    document.getElementById( "zstate" ).textContent = R.state;
    document.getElementById( "zcountry" ).textContent = R.country;
    document.getElementById( "zsector" ).textContent = R.sector;
    document.getElementById( "zindustry" ).textContent = R.industry;
    document.getElementById( "zmCap" ).textContent = R.mCap;
    document.getElementById( "zebitda" ).textContent = R.ebitda;

    //addressToGeo( R.address1 + ", " + R.city + ", " + R.state, R.longName );
  }
}

async function getHistoryChartData() {

  const buffer = await fetch( `yahoo/chart/history/code/${symbol}?p1=${p1}&p2=${p2}` )

  const data = await buffer.json();

  document.getElementById( 'zmain' ).appendChild( candleStickChart( data.prices ) )
}


function polarToCartesian( centerX, centerY, radius, angleInDegrees ) {

  let angleInRadians = ( ( angleInDegrees - 90 ) * Math.PI ) / 180.0;

  return {
    x: centerX + radius * Math.cos( angleInRadians ),
    y: centerY + radius * Math.sin( angleInRadians ),
  };
}