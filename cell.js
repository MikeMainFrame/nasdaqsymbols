module.exports = function cellTitle ( html,  rowspan="1", colspan="1" ) {
  return `<td class='ns-td' rowspan='${rowspan}' colspan='${colspan}' >${html}</td>`
}