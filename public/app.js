/* MikeOwlWolf was here and did some coding - 20220609 - #003 */

let xhr = new XMLHttpRequest(),
  anchor,
  map,
  remember,
  geocoder,
  symbol = window.location.href.split("?symbol=")[1];
date = window.location.href.split("?date=")[1];

document.getElementById('zholders').addEventListener("click", holdersData)
document.getElementById('zfinance').addEventListener("click", financialData)
//summaryData();

function addressToGeo(address, who) {
  geocoder.geocode({
    address: address
  }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      var marker = new google.maps.Marker({
        position: results[0].geometry.location,
        map,

        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          strokeColor: "#ff0",
          strokeOpacity: 1,
          strokeWeight: 1,
          fillOpacity: 1,
          fillColor: "#000",
          scale: 6,
        },
        title: who,
      });
    }
  });
}

function googleMap(lat = 37.40288313634961, lng = -122.10861982405612) {
  const W = {
    lat: lat,
    lng: lng
  };
  geocoder = new google.maps.Geocoder();
  map = new google.maps.Map(document.getElementById("zmap"), {
    mapId: "dbb06a73c56861a2",
    center: W,
    disableDefaultUI: true,
    zoom: 3,
    useStaticMap: false,
  });
  summaryData();
}

function summaryData() {
  xhr.open("GET", "/yahoo/summary/code/" + symbol);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      once(xhr.responseText);
      chartData();
      //candleStick();
    }
  };
  xhr.send();

  function once(json) {
    let R = JSON.parse(json);

    document.getElementById("zsymbol").textContent = symbol;
    document.getElementById("zlongName").textContent = R.longName;
    document.getElementById("zsummary").innerHTML = R.longBusinessSummary;
    document.getElementById("zfullTimeEmployees").textContent = R.fullTimeEmployees;
    document.getElementById("zaddress1").textContent = R.address1;
    document.getElementById("zcurrency").textContent = R.currency;
    document.getElementById("zcity").textContent = R.city;
    document.getElementById("zip").textContent = R.zip;
    document.getElementById("zstate").textContent = R.state;
    document.getElementById("zcountry").textContent = R.country;
    document.getElementById("zsector").textContent = R.sector;
    document.getElementById("zindustry").textContent = R.industry;
    document.getElementById("zmCap").textContent = R.mCap;
    document.getElementById("zebitda").textContent = R.ebitda;

    //addressToGeo( R.address1 + ", " + R.city + ", " + R.state, R.longName );
  }
}

function financialData(button) {
  xhr.open("GET", "/yahoo/financial/code/" + symbol);
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      zshow.innerHTML = xhr.responseText;
      button.target.parentNode.children[2].innerHTML = "summary";
    }
  }
  xhr.send();
}

async function holdersData(button) {
  const response = await fetch(
    `/yahoo/holders/code/${symbol}`,
    {
      method: 'GET',
      credentials: 'omit'
    })

  const data = await response.text();

  zshow.innerHTML = data;

  //remember = button.target.parentNode.children[2].innerHTML;

  button.target.parentNode.children[2].innerHTML = "summary";

}

function where(E) {

  let pt = zchart.createSVGPoint(); pt.x = E.clientX; pt.y = E.clientY;
  let loc = pt.matrixTransform(zchart.getScreenCTM().inverse());
  let W = document.getElementById("zcircle");
  if (W) {
    W.setAttribute("cx", loc.x);
    W.setAttribute("cy", loc.y);
  } else {
    let circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("id", "zcircle");
    circle.setAttribute("cx", 150);
    circle.setAttribute("cy", 10);
    circle.setAttribute("r", 6);
    circle.setAttribute("stroke", "none");
    circle.setAttribute("fill", "#f00");
    document.getElementById("zchart").appendChild(circle);
  }
}

function show(E) {

  if (E.target.hasAttribute("zclose")) {
    document.getElementById("timeDisplay").textContent = new Date(parseInt(E.target.getAttribute("ztime") * 1e3));
    document.getElementById("volumeDisplay").textContent = "volume: " + E.target.getAttribute("zvolume");
    document.getElementById("lowDisplay").textContent = "⯆ " + E.target.getAttribute("zlow");
    document.getElementById("openDisplay").textContent = "➽ " + E.target.getAttribute("zopen");
    document.getElementById("closeDisplay").textContent = E.target.getAttribute("zclose");
    if (E.target.getAttribute("zclose") > E.target.getAttribute("zopen")) {
      document.getElementById("redGreen").setAttribute("fill", "#0a0")
    } else {
      document.getElementById("redGreen").setAttribute("fill", "#a00");
    }
    document.getElementById("highDisplay").textContent = "⯅ " + E.target.getAttribute("zhigh");
  }
}


async function chartData() {

  const response = await fetch(
    `/yahoo/chart/code/${symbol}`,
    {
      method: 'GET',
      credentials: 'omit'
    })

  let dataSet = await response.text();

  doChart(dataSet);

  function doChart(json) {
    let T = JSON.parse(json);
    let S0;

    document.getElementById("currentPrice").textContent = T[T.length - 1].close;

    T.map((slot, ix) => {
      document.getElementById("zchart").appendChild(makeLine(slot));
      document.getElementById("zcandle").appendChild(makeStick(slot));
    });

    document.getElementById("zcandle").addEventListener("mousemove", where);
    document.getElementById("zcandle").addEventListener("mouseover", show);

    function makeStick(S, S0) {

      let offsetInMinutes =
        new Date(S.timestamp * 1e3).getHours() * 60 +
        new Date(S.timestamp * 1e3).getMinutes();
      let twoDollar = parseInt((S.close - 2)); // show only the tip of the column
      let aequator = 400;

      let g = document.createElementNS("http://www.w3.org/2000/svg", "g");

      g.setAttribute("ztime", S.timestamp);
      g.setAttribute("zclose", S.close);
      g.setAttribute("zopen", S.open);
      g.setAttribute("zhigh", S.high);
      g.setAttribute("zvolume", S.volume);
      g.setAttribute("zlow", S.low);

      let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

      line.setAttribute("x1", offsetInMinutes);
      line.setAttribute("y1", aequator - ((S.low - twoDollar) * 100));
      line.setAttribute("x2", offsetInMinutes);
      line.setAttribute("y2", aequator - ((S.high - twoDollar) * 100));
      line.setAttribute("stroke", "#625B71");
      line.setAttribute("stroke-width", 0.5);

      g.appendChild(line)

      line = document.createElementNS("http://www.w3.org/2000/svg", "line");

      line.setAttribute("x1", offsetInMinutes);
      line.setAttribute("y1", aequator - ((S.open - twoDollar) * 1e2));
      line.setAttribute("x2", offsetInMinutes);
      line.setAttribute("y2", aequator - ((S.close - twoDollar) * 1e2));
      line.setAttribute("stroke", redGreen(S));
      line.setAttribute("stroke-linecap", "round")
      line.setAttribute("stroke-width", 4);

      g.appendChild(line)

      let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      
      circle.setAttribute("cx", offsetInMinutes);
      circle.setAttribute("cy", 400 - ((S.close - twoDollar) * 100));
      circle.setAttribute("r", 2);
      circle.setAttribute("stroke", "none");
      circle.setAttribute("fill", "#ffa500");

      g.appendChild(circle)

      return g;
    }
    function redGreen(S) {

      return (S.open < S.close) ? "#aa6000" : "#009cff";
    }
    function makeLine(S) {

      let minutes =
        new Date(S.timestamp * 1e3).getHours() * 60 +
        new Date(S.timestamp * 1e3).getMinutes();

      let A = polarToCartesian(180, 180, 150 + ((S.high - S.close) * 20), minutes / 2);
      let B = polarToCartesian(180, 180, 150 - ((S.close - S.low) * 20), minutes / 2);

      let line = document.createElementNS("http://www.w3.org/2000/svg", "line");

      line.setAttribute("x1", A.x);
      line.setAttribute("y1", A.y);
      line.setAttribute("x2", B.x);
      line.setAttribute("y2", B.y);
      line.setAttribute("ztime", S.timestamp);
      line.setAttribute("zclose", S.close);
      line.setAttribute("zopen", S.open);
      line.setAttribute("zhigh", S.high);
      line.setAttribute("zvolume", S.volume);
      line.setAttribute("zlow", S.low);
      line.setAttribute("stroke", "#fff");
      line.setAttribute("stroke-width", 3);

      return line;

      function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        let angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

        return {
          x: centerX + radius * Math.cos(angleInRadians),
          y: centerY + radius * Math.sin(angleInRadians),
        };
      }
    }
    document.getElementById("zchart").addEventListener("mouseover", show);
    document.getElementById("zchart").addEventListener("mousemove", where);
  }
}