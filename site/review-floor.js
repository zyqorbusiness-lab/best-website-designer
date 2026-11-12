(function(){
  function floor(){
    var els = document.querySelectorAll('body *');
    for (var i=0;i<els.length;i++){
      var el = els[i];
      if (el.closest && el.closest('svg')) continue;
      if (!el.firstChild || el.children.length && !Array.prototype.some.call(el.childNodes,function(n){return n.nodeType===3&&n.textContent.trim();})) continue;
      var fs = parseFloat(getComputedStyle(el).fontSize);
      if (fs && fs < 12) el.style.fontSize = '12px';
    }
  }
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', floor); else floor();
  window.addEventListener('load', floor);
})();