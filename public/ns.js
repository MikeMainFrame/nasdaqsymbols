/*
 * @RAPID mm
 */
var xhr = new XMLHttpRequest(),
  anchor,
  map,
  geocoder,
  symbol = window.location.href.split( "?symbol=" )[ 1 ];  
  date = window.location.href.split( "?date=" )[ 1 ];

document.getElementById( "now" ).textContent = new Date();

//summaryData();

function addressToGeo( address, who ) {
  geocoder.geocode( {
    address: address
  }, function ( results, status ) {
    if ( status === google.maps.GeocoderStatus.OK ) {
      var marker = new google.maps.Marker( {
        position: results[ 0 ].geometry.location,
        map,

        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          strokeColor: "#ff0",
          strokeOpacity: 1,
          strokeWeight:1,
          fillOpacity: 1,
          fillColor: "#000",
          scale: 6,
        },
        title: who,
      } );
    }
  } );
}

function map1( lat = 37.40288313634961, lng = -122.10861982405612 ) {
  const W = {
    lat: lat,
    lng: lng
  };
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map( document.getElementById( "map" ), {
    mapId: "dbb06a73c56861a2",
    center: W,
    disableDefaultUI: true,
    zoom: 3,
    useStaticMap: false,
  } );
  summaryData();
}

function summaryData() {
  xhr.open( "GET", "/yahoo/summary/code/" + symbol );
  xhr.onreadystatechange = () => {
    if ( xhr.readyState === 4 ) {
      once( xhr.responseText );
      chartData();
    }
  };
  xhr.send();

  function once( json ) {
    var R = JSON.parse( json );

    document.getElementById( "symbol" ).textContent = symbol;
    document.getElementById( "longName" ).textContent = R.longName;
    document.getElementById( "summary" ).textContent = R.longBusinessSummary;
    document.getElementById( "fullTimeEmployees" ).textContent = R.fullTimeEmployees;
    document.getElementById( "address1" ).textContent = R.address1;
    document.getElementById( "currency" ).textContent = R.currency;
    document.getElementById( "city" ).textContent = R.city;
    document.getElementById( "zip" ).textContent = R.zip;
    document.getElementById( "state" ).textContent = R.state;
    document.getElementById( "country" ).textContent = R.country;
    document.getElementById( "sector" ).textContent = R.sector;
    document.getElementById( "industry" ).textContent = R.industry;
    document.getElementById( "mCap" ).textContent = R.mCap;
    document.getElementById( "ebitda" ).textContent = R.ebitda;

    addressToGeo( R.address1 + ", " + R.city + ", " + R.state, R.longName );
  }
}

function twice() {
  xhr.open( "GET", "/yahoo/financial/code/" + symbol );
  xhr.onreadystatechange = () => {
    if ( xhr.readyState === 4 ) console.log( xhr.responseText )
  };
  xhr.send();
}

function where( E ) {
  var pt = zchart.createSVGPoint();
  pt.x = E.clientX;
  pt.y = E.clientY;
  var loc = pt.matrixTransform( zchart.getScreenCTM().inverse() );
  var W = document.getElementById( "zcircle" );
  if ( W ) {
    W.setAttribute( "cx", loc.x );
    W.setAttribute( "cy", loc.y );
  } else {
    var circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute( "id", "zcircle" );
    circle.setAttribute( "cx", 150 );
    circle.setAttribute( "cy", 10 );
    circle.setAttribute( "r", 2 );
    circle.setAttribute( "stroke", "none" );
    circle.setAttribute( "fill", "#ffff0080" );
    document.getElementById( "zchart" ).appendChild( circle );
  }
}

function show( E ) {
  
  if ( E.target.hasAttribute( "zclose" ) ) {
    document.getElementById( "timeDisplay" ).textContent = new Date( parseInt( E.target.getAttribute( "ztime" ) * 1e3 ) );
    document.getElementById( "volumeDisplay" ).textContent = "volume: " + E.target.getAttribute( "zvolume" );
    document.getElementById( "lowDisplay" ).textContent = "⯆ " + E.target.getAttribute( "zlow" );
    document.getElementById( "openDisplay" ).textContent = "➽ " + E.target.getAttribute( "zopen" );
    document.getElementById( "closeDisplay" ).textContent = E.target.getAttribute( "zclose" );
    if ( E.target.getAttribute( "zclose" ) > E.target.getAttribute( "zopen" )) {
      document.getElementById( "redGreen" ).setAttribute( "fill", "#0a0" )
    } else {
      document.getElementById( "redGreen" ).setAttribute( "fill", "#a00" ); 
    }
    document.getElementById( "highDisplay" ).textContent = "⯅ " + E.target.getAttribute( "zhigh" );
  }
}


function chartData(callback) {
  xhr.open( "GET", "/yahoo/chart/code/" + symbol );
  xhr.onreadystatechange = () => {
    if ( xhr.readyState === 4 ) {
      doChart( xhr.responseText )
      twice();
    }
  };
  xhr.send();

  function doChart( json ) {
    var T = JSON.parse( json );

    document.getElementById( "currentPrice" ).textContent = T[ T.length - 1 ].close;

    T.map( ( slot, ix ) => {
      document.getElementById( "zchart" ).appendChild( makeLine( slot ) );
    } );

    function makeLine( S ) {
      var minutes =
        new Date( S.timestamp * 1e3 ).getHours() * 60 +
        new Date( S.timestamp * 1e3 ).getMinutes();
      var A = polarToCartesian( 180, 180, 150 + ( S.high - S.close ), minutes / 2 );
      var B = polarToCartesian( 180, 180, 150 - ( S.close - S.low ), minutes / 2 );

      var temp = document.createElementNS( "http://www.w3.org/2000/svg", "line" );

      temp.setAttribute( "x1", A.x );
      temp.setAttribute( "y1", A.y );
      temp.setAttribute( "x2", B.x );
      temp.setAttribute( "y2", B.y );
      temp.setAttribute( "ztime", S.timestamp );
      temp.setAttribute( "zclose", S.close );
      temp.setAttribute( "zopen", S.open );
      temp.setAttribute( "zhigh", S.high );
      temp.setAttribute( "zvolume", S.volume );
      temp.setAttribute( "zlow", S.low );
      temp.setAttribute( "stroke", "#fff" );
      temp.setAttribute( "stroke-width", 3 );

      return temp;

      function polarToCartesian( centerX, centerY, radius, angleInDegrees ) {
        var angleInRadians = ( ( angleInDegrees - 90 ) * Math.PI ) / 180.0;

        return {
          x: centerX + radius * Math.cos( angleInRadians ),
          y: centerY + radius * Math.sin( angleInRadians ),
        };
      }
    }
    document.getElementById( "zchart" ).addEventListener( "mouseover", show );
    document.getElementById( "zchart" ).addEventListener( "mousemove", where );
  }
}