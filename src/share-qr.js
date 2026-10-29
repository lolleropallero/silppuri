// Draw the exact package URL locally, with square pixels and a four-module quiet zone.
function createShareQr(link){
  const url=new URL(link);
  if(!['http:','https:'].includes(url.protocol)||!url.hash.startsWith('#s='))throw new Error('Paketin jakolinkki puuttuu.');
  return qrcodegen.QrCode.encodeText(link,qrcodegen.QrCode.Ecc.MEDIUM);
}
function drawShareQr(ctx,qr,x,y,size){
  const border=4,modules=qr.size+border*2,scale=Math.floor(size/modules);
  if(scale<2)throw new Error('Jakolinkki ei mahdu QR-koodiin.');
  const offset=Math.floor((size-modules*scale)/2)+border*scale;
  ctx.fillStyle='#fff';ctx.fillRect(x,y,size,size);ctx.fillStyle='#000';
  for(let row=0;row<qr.size;row++)for(let col=0;col<qr.size;col++){
    if(qr.getModule(col,row))ctx.fillRect(x+offset+col*scale,y+offset+row*scale,scale,scale);
  }
}
