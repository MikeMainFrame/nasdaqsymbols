function keyData( sub ) {

  let what = '', value = '';

  what += cellHeading( "Close" )
  value += cellContent( sub.regularMarketPreviousClose.fmt )

  what += cellHeading( "Open" )
  value += cellContent( sub.regularMarketOpen.fmt )

  what += cellHeading( "Price " + sub.currencySymbol )
  value += cellContent( sub.regularMarketPrice.fmt )

  what += cellHeading( "High ⬆️" )
  value += cellContent( sub.regularMarketDayHigh.fmt )

  what += cellHeading( "⬇ low" )
  value += cellContent( sub.regularMarketDayLow.fmt )

  what += cellHeading( "Volume " )
  value += cellContent( sub.regularMarketVolume.longFmt )

  what += cellHeading( "Post Time" )
  value += cellContent( new Date( sub.postMarketTime * 1e3 ).toTimeString().substring( 0, 8 ) )

  what += cellHeading( "Post Price" )
  value += cellContent( sub.postMarketPrice.fmt )

  what += cellHeading( "Post Change" )
  value += cellContent( sub.postMarketChange.fmt )

  if ( sub?.preMarketTime !== undefined ) {
    what += cellHeading( "Pre Time" )
    value += cellContent( ( new Date( sub.preMarketTime * 1e3 ).toTimeString().substring( 0, 8 ) ) )
    what += cellHeading( "Pre Price" )
    value += cellContent( sub.preMarketPrice.fmt )
    what += cellHeading( "Pre Change" )
    value += cellContent( sub.preMarketChange.fmt )
  }

  what += cellHeading( "Deadline " )
  value += cellContent( new Date( sub.regularMarketTime * 1e3 ).toTimeString().substring( 0, 8 ) )

  html += row( what )
  html += row( value )
  return sheet( html )

  function cellContent( text ) {
    return "<td>" + text + '</td>'
  }

  function cellHeading( text, noOfCols = 1 ) {
    return `<th colspan=${noOfCols} > ${text}</th>`
  }

  function row( text ) {
    return "<tr>" + text + '</tr>'
  }

  function sheet( str ) {
    return "<table style='margin: 0.2em'>" + str + "</table>"
  }


}