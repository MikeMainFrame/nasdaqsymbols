module.exports = function timestamp( milliseconds = new Date() ) {  

  let date = new Date( milliseconds );
  
  return ( date.getUTCFullYear() * 1e8 )
    + ( ( date.getMonth() + 1 ) * 1e6 )
    + ( ( date.getDate() ) * 1e4 )
    + ( date.getHours() * 1e2 )
    + date.getMinutes()
}