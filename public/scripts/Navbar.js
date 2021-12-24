window.onload = function(){
  return fetch('/navbar.html').then(res => {
    console.log(res);
    res.text().then(contents => {
      let html = new DOMParser().parseFromString(contents, 'text/html');
      html.querySelectorAll('body > div').forEach(child => {
        document.body.insertBefore(child, document.body.firstChild);
      });
    });
  })
}