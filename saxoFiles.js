module.exports = function ( fileObject, index ) {
  let head = "";
  let sortKey = fileObject?.metadata?.metadata?.sortKeyColumn
  if ( sortKey === void 1 ) sortKey = 'n/a';
  if ( index === 0 ) head = ' <tr><th>name</th><th>updated</th><th>created</th><th>size</th><th>generation</th><th>bucket</th><th>SortKey</th></tr> '
  return `${head}
  <tr><td>${fileObject.name}</td><td>${fileObject.metadata.updated} </td><td>${fileObject.metadata.timeCreated}<td>${fileObject.metadata.size}</td><td>${fileObject.metadata.generation}</td><td>${fileObject.metadata.bucket}</td><td>${sortKey}</td></tr>`
} 