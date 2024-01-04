module.exports = function ( name, count, sum) {

let fill = "#0f0";

if (sum < 0) fill = "#f00"
    return `
    <svg id="ztarget" viewbox="0 0 300 300" style="width: 128px"
  xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="zdots" viewBox="0,0,9,9" width="6%" height="6%">
      <circle r="3" cx="3" cy="3" fill="#fff"></circle>
    </pattern>
    <radialGradient id="zhot">
      <stop stop-color="#000000A0" offset="0.2" />
      <stop stop-color="#00000080" offset="0.5" />
      <stop stop-color="#00000040" offset="1" />
    </radialGradient>
    <mask id="zmask">

      <circle cx="128" cy="128" r="102" fill="url(#zdots)"></circle>

    </mask>

  </defs>
  <g font-size="11" fill="#fff" text-anchor="middle" stroke="none" stroke-width="1"
    transform="translate(24 24)">

    <path id="ztop" fill="none"
      d="M 125.76609197602771 0.019495019981917494 A 128 128 0 1 0 128 0 Z">
    </path>
    <path id="zbottom" fill="none" d="M 13 128 A 115 115 0 0 0 243 128"></path>

    
    <circle cx="128" cy="128" r="102" fill="url(#zhot)" mask="url(#zmask)">
    </circle>
<g font-weight="700" >
    <text letter-spacing="1" x="128" y="138" font-size="200%" >
      ${sum}
    </text>
    <text x="128" y="178">
      Trades # ${count}
    </text>
  
  </g>
  </g>
</svg>
  `
  }