module.exports = function tdWrap( text, rowspan="" ) {
  return `<td class="na-td" ${rowspan}>${text}</td>`
}