module.exports = function block(html, css="ns-block") {
  return `<div class="${css}">${html}</div>`
}
