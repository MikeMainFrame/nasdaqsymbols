module.exports = function thWrap( text, noOfCols = 1 ) {
  return `<th  class="na-th" colspan=${noOfCols} > ${text}</th>`
}