let cache_name = "re-cache";
//adding all pages to cache
self.addEventListener('install', function(event) {
  console.log("[sw] Installed.");
  event.waitUntil(
    caches.open(cache_name).then(
      function(cache) {
        return cache.addAll(['/index.html',
          '/css/styles.css',
          '/restaurant.html',
          '/js/dbhelper.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          '/data/restaurants.json',
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
        ])
      }
    )
  )
})

//respond from caches
self.addEventListener('fetch', function(event) {
  //fix restaurant url to match cache
  if (event.request.url.includes('restaurant.html?')) {
    let noParamUrl = event.request.url.split('?')[0];
    //console.log(noParamUrl);
    event.respondWith(chaches.match(noParamUrl).then(function(resp) {
      return resp || fetch(event.request);
    }));
    return;
  }
  //anything else is peaceful
  event.respondWith(caches.match(event.request.url).then(function(resp) {
    return resp || fetch(event.request);
  }));
})
