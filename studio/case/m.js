/* Kilnfold case study - phone build has no extra layer: core.js does reveals, frames, scrubber, demos.
   This file only plays the scrubber once when it scrolls into view (no autoplay under reduced motion). */
(function(){
  'use strict';
  var CS=window.CS||{}, fire=document.querySelector('.fire');
  if(!fire||CS.reduced||!('IntersectionObserver' in window))return;
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting&&fire._fire){fire._fire();io.disconnect();}})},{threshold:0.6});
  io.observe(fire);
})();
