module.exports = function ( name, count, sum ) {

let fill = "#2080a080";

if (sum < 0) fill = "#a0400080"
    return `
    <svg id="ztarget" viewbox="0 0 300 300" style="width: 512px"
  xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="zdots" viewBox="0,0,9,9" width="6%" height="6%">
      <circle r="3" cx="3" cy="3" fill="#fff"></circle>
    </pattern>

    <radialGradient id="zhollow">
      <stop stop-color="#F00" offset="0" />
      <stop stop-color="#FFA500" offset="0.1667" />
      <stop stop-color="#FF0" offset="0.3333" />
      <stop stop-color="#080" offset="0.5" />
      <stop stop-color="#00F" offset="0.6667" />
      <stop stop-color="#4B0082" offset="0.8" />
      <stop stop-color="#F00" offset="0.8333" />
      <stop stop-color="#EE82EE" offset="1" />
    </radialGradient>
    <radialGradient id="zhot">
      <stop stop-color="#FF0000A0" offset="0" />
      <stop stop-color="#FF000080" offset="0.5" />
      <stop stop-color="#FF000040" offset="1" />
    </radialGradient>
    <mask id="zmask">

      <circle cx="128" cy="128" r="102" fill="url(#zdots)"></circle>

    </mask>

  </defs>
  <g font-size="11" fill="#888" text-anchor="middle" stroke="none" stroke-width="1"
    transform="translate(24 24)">

    <path id="ztop" fill="none"
      d="M 125.76609197602771 0.019495019981917494 A 128 128 0 1 0 128 0 Z">
    </path>
    <path id="zround" fill="none" d="M 0 128 A 128 128 0 1 1 256 128"></path>
    <path id="zbottom" fill="none" d="M 13 128 A 115 115 0 0 0 243 128"></path>

    
    <circle cx="128" cy="128" r="102" fill="url(#zhot)" mask="url(#zmask)">
    </circle>

    <text font-size="16" font-weight="700">
      <textPath startOffset="50%" href="#zround">
        ${name}
      </textPath>
    </text>

    <text font-size="8" font-weight="100">
      <textPath startOffset="50%" href="#ztop">
       • 12,00
      </textPath>
    </text>
    
    <text x="128" y="100">
      P/L DKK
    </text>
    <text x="128" y="138" font-size="200%" font-weight="700" >
      ${sum}
    </text>
    <text x="128" y="178">
      Trades # ${count}
    </text>
  
  </g>
</svg>
  `
  }