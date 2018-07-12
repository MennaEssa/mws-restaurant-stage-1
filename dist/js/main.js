let restaurants,
  neighborhoods,
  cuisines
var map
var markers = []

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */


DBHelper.indexdb_init();

document.addEventListener('DOMContentLoaded', (event) => {
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });

  updateRestaurants();
}

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
      var load = new LazyLoad();

    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  self.markers.forEach(m => m.setMap(null));
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}

//fav toggle

function toggleFav(item , restaurant_id) {

    //offline
    //toggle the button and push the request in queue for later sync.
    if(!navigator.onLine){

      if(item.className === 'fav-true'){
          item.classList.toggle('fav-false');
          item.className='fav-false';
          item.setAttribute('aria-label' , 'add restaurant to favorites') ;

          //fav_queue.push({'id' : restaurant_id , 'isFav' : false }); 
          AddtoSyncFavDB( restaurant_id ,  false );

      }
      else {
        item.classList.toggle('fav-true');
        item.className='fav-true';
        item.setAttribute('aria-label' , 'remove restaurant from favorites') ;

        //fav_queue.push({'id' : restaurant_id , 'isFav' : true }); 
        AddtoSyncFavDB(restaurant_id , true );

      } 
      return;         
    }

    //online 
    //if true , send request to set fav to false then change class to fav-false
    //if false , send request to set fav to true then change class to fav-true
    if(item.className === 'fav-true'){
      DBHelper.updateFav(restaurant_id,false).then(()=>{
          item.classList.toggle('fav-false');
          item.className='fav-false';
          item.setAttribute('aria-label' , 'add restaurant to favorites') ;

      });
    }
    else {
      DBHelper.updateFav(restaurant_id,true).then(()=> {
        item.classList.toggle('fav-true');
        item.className='fav-true';
        item.setAttribute('aria-label' , 'remove restaurant from favorites') ;

      });
    }  
  }


/**
 * Create restaurant HTML.
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
    //create toggle fav button
    let star = document.createElement('button');
    star.classList.add('fav-true' , 'fav-false');
    star.innerHTML= '✪';
    if (restaurant.is_favorite == true || restaurant.is_favorite == "true"){
        star.className='fav-true';
        star.setAttribute('aria-label' , 'remove restaurant from favorites') ;
    }
    else{
        star.className='fav-false';
        star.setAttribute('aria-label' , 'add restaurant to favorites') ;
    }
    star.setAttribute('onclick' , `toggleFav(this , ${restaurant.id})`);
    li.append(star);
  
  const image = document.createElement('img');
  image.className = 'restaurant-img'; 
  //adding to lazy loading list
  image.classList.add('lazy');

  // image.src = DBHelper.imageUrlForRestaurant(restaurant);

  //add datasrc 
  image.setAttribute('data-src' , `${DBHelper.imageUrlForRestaurant(restaurant)}`);

  image.alt = DBHelper.altForRestaurant(restaurant);
  li.append(image);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  name.id = restaurant.name.replace(/ /g, '');
  //console.log(name.id);
  li.append(name);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  li.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  address.id = name.id + "_a";
  li.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', "name :" + restaurant.name + ",address :" + restaurant.address + ", view details");
  //  more.setAttribute('aria-describedby' ,name.id);
  //  more.setAttribute('aria-details' , address.id);
  li.append(more);
  return li;
}

/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
}

function display_map() {
  document.getElementById('map-full').style.display='block';
  document.getElementById('show-map-container').style.display='none'
}

/*
*  Service worker stuff
*/


if (navigator.serviceWorker){
  navigator.serviceWorker.register('/sw.js' , { scope: '/' }).then(reg => {
      console.log('[sw] Registered.');
    }).catch(function(){
    console.log('[sw] Failed to register');
  });
} else {
  console.log('[sw] service not supported , bye.');
}


window.addEventListener('online', doSync);

