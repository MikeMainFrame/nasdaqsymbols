( function wrapUp( wwObject ) {

  var transaction = document.implementation.createDocument( "", "", null );
  var temp = window.location.search.split( "=" );
  var now = new Date();

  var zWho = transaction.createElement( "who" );
  zWho.setAttribute( "id", temp[ 1 ] );

  var zTask = transaction.createElement( "task" );
  zTask.setAttribute( "id", 9999 );
  zTask.setAttribute( "lat", wwObject.lat );
  zTask.setAttribute( "lng", wwObject.lng );
  zTask.setAttribute( "timestamp", wwObject.timestamp );
  zTask.setAttribute( "address", wwObject.address );
  zTask.setAttribute( "duration", now.getTime() - wwObject.timestamp );
  zWho.appendChild( zTask );

  transaction.appendChild( zWho );

  var xmlhttp = new XMLHttpRequest();

  xmlhttp.onreadystatechange = function () {
    if ( xmlhttp.readyState === 4 && xmlhttp.status === 200 ) {
      document.body.innerHTML = "<h1>Pre Process By Karin & Mike</h1>";
    }
  };
  xmlhttp.open( "POST", "nsRaw.js", true );
  xmlhttp.send( transaction );
} )( {
  lat: 44,
  lng: 33,
  timestamp: 1122331234,
  address: 'adr',
  duration: 123456
} )