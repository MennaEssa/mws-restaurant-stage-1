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
          '/img/1.jpg',
          '/img/2.jpg',
          '/img/3.jpg',
          '/img/4.jpg',
          '/img/5.jpg',
          '/img/6.jpg',
          '/img/7.jpg',
          '/img/8.jpg',
          '/img/9.jpg',
          '/img/10.jpg'
        ]);
      }
    )
  );
});



//get photos from cache and resturant json from indexdb
//respond from caches

self.addEventListener('fetch', function(event) {
  //fix restaurant url to match cache
  let requestUrl = new URL(event.request.url);

  if (requestUrl.pathname.startsWith('/restaurants/')) {
    return;
  }

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

  //anything else is peaceful  
});

