// Native file sharing is separate from these text/link compose URLs.
function socialShareLinks(text,url){
  const link=(base,params)=>{const target=new URL(base);for(const [key,value] of Object.entries(params))target.searchParams.set(key,value);return target.href;};
  const message=text+'\n\n'+url;
  return {
    facebook:link('https://www.facebook.com/sharer/sharer.php',{u:url}),
    threads:link('https://www.threads.com/intent/post',{text:message}),
    x:link('https://x.com/intent/tweet',{text:message}),
    whatsapp:link('https://wa.me/',{text:message})
  };
}
