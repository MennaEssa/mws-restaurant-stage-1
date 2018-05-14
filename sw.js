let cache_name = 're-cache';
//adding all pages to cache
self.addEventListener('install', function(event) {
  console.log('[sw] Installed.');
  event.waitUntil(
    caches.open(cache_name).then(
      function(cache) {
        return cache.addAll(['/index.html',
          '/css/styles.css',
          '/restaurant.html',
          '/js/dbhelper.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          'dist/img/1.jpg',
          'dist/img/2.jpg',
          'dist/img/3.jpg',
          'dist/img/4.jpg',
          'dist/img/5.jpg',
          'dist/img/6.jpg',
          'dist/img/7.jpg',
          'dist/img/8.jpg',
          'dist/img/9.jpg',
          'dist/img/10.jpg'
        ]);
      }
    )
  );
});



//get photos from cache and resturant json from indexdb
//respond from caches

self.addEventListener('fetch', function(event) {
  // /restaurants and /restaurant are handled by indexdb.
  let requestUrl = new URL(event.request.url);

  //get image from cache
  if(requestUrl.pathname.startsWith('/img/')){
    event.respondWith(caches.match(event.request.url).then(function(response) {
    return response || fetch(event.request);
    }));
    return;
  }
  

  event.respondWith(
    caches.open(cache_name).then(function(cache) {
      return cache.match(event.request).then(function (response) {
        return response || fetch(event.request).then(function(response) {
          cache.put(event.request, response.clone());
          return response;
        });
      });
    })
  );

});

