// Keep the existing icon attribution in the downloaded file's metadata without
// adding a footer to the picture. iTXt is a standard, uncompressed PNG text chunk.
async function creditSharePng(blob){
  const bytes=new Uint8Array(await blob.arrayBuffer());
  const credit='Claw slashes by Lorc / Game-icons.net. CC BY 3.0. Colour adapted. '+
    'https://game-icons.net/1x1/lorc/claw-slashes.html https://creativecommons.org/licenses/by/3.0/';
  const content=new TextEncoder().encode('Attribution\0\0\0\0\0'+credit);
  const chunk=new Uint8Array(content.length+12),view=new DataView(chunk.buffer);
  view.setUint32(0,content.length);chunk.set([105,84,88,116],4);chunk.set(content,8);
  let crc=0xffffffff;
  for(const value of chunk.subarray(4,-4)){
    crc^=value;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);
  }
  view.setUint32(chunk.length-4,(crc^0xffffffff)>>>0);
  // Every canvas PNG starts with its 8-byte signature and 25-byte IHDR chunk.
  return new Blob([bytes.subarray(0,33),chunk,bytes.subarray(33)],{type:'image/png'});
}
