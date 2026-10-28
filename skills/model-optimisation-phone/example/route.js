// desktop (index.html) and phone (m.html) are separate builds that load the same model; pick by screen width
(function () { try {
  var phone = matchMedia('(max-width: 760px)').matches, onPhonePage = /\/m\.html$/.test(location.pathname);
  if (/[?&]stay/.test(location.search)) return;
  if (phone && !onPhonePage) location.replace(location.pathname.replace(/(index\.html)?$/, 'm.html') + location.search + location.hash);
  else if (!phone && onPhonePage) location.replace(location.pathname.replace(/m\.html$/, '') + location.search + location.hash);
} catch (e) {} })();
