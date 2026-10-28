// This host is only for the ordinary web page, not the embedded visualization.
(()=>{
  const key='silppuri:state:v1:'+location.pathname;
  let state=null;
  try{
    const legacy='codex:visualization-widget-state-v2:'+JSON.stringify([location.pathname,location.search]);
    state=JSON.parse(localStorage.getItem(key)||localStorage.getItem(legacy)||'null');
  }catch{/* Private browsing/storage restrictions must not disable the calculator. */}
  window.openai={widgetState:state,setWidgetState(next){
    this.widgetState=next;
    try{localStorage.setItem(key,JSON.stringify(next));}catch{}
  }};
})();
