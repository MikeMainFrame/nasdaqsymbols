module.exports = function candleStickChart(  prices ) {
  let x_w = 5000;
  let y_h = 1400
  let stroke = "#888";
  let color = '#f00'
  let SVG = []
  let w = x_w / prices.length / 2;
  let HTML = "";
  let path = "";
  let max = 0;
  let min = 99999;

  prices.map( ( slot ) => {
    if ( slot.close > max ) max = slot.close;
    if ( slot.close < min ) min = slot.close;
  } )

  for ( let ix = 0; ix < prices.length; ix++ ) {

    ( ix > 0 && prices[ ix ].open > prices[ ix - 1 ].close ) ? color = "#F44747" : color = "#18BF69";

    path = "M "
      + stockPriceIntoXCord( ix, w ) + " , " + stockPriceIntoYCord( prices[ ix ].high, min, max, y_h ) + " "
      + stockPriceIntoXCord( ix, w ) + " , " + stockPriceIntoYCord( prices[ ix ].low, min, max, y_h )

    SVG.push( `<path data-high='${prices[ix].high}' data-low='${prices[ix].low}' d='${path}' stroke='${stroke}' stroke-width='${( w / 5 )}'/>` );

    path = "M "
      + stockPriceIntoXCord( ix, w ) + " ," + stockPriceIntoYCord( prices[ ix ].open, min, max, y_h ) + " "
      + stockPriceIntoXCord( ix, w ) + " , " + stockPriceIntoYCord( prices[ ix ].close, min, max, y_h )

    SVG.push( `<path data-open='${prices[ix].open}' data-close='${prices[ix].close}'  data-time='${prices[ix].dateISO}' d='${path}' stroke='${color}' stroke-width='${w}'/>` );

  }
  HTML = `<svg xmlns='http://www.w3.org/2000/svg'  viewBox="0 0 5000 1800 "  style="width: 100%">` + SVG.join( '' ) + "</svg";
  return HTML

  function stockPriceIntoYCord( price, minY, maxY, height ) {
    let X = ( price - minY )
    let Y = ( maxY - minY )
    return parseInt( height + 200 - ( X / Y * height ) )
  }
  function stockPriceIntoXCord( slotNumber, columnWidth ) {
    return parseInt( slotNumber * columnWidth * 2 )
  }
}