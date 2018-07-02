/**
 * Common database helper functions.
 */

const indexdb_name='restaurants_info';
const reviews_store = 'reviews';
const indexdb_store = 'restaurants';
const port = 1337;

class DBHelper {



  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 ;// Change this to your server port
    return `http://localhost:${port}/restaurants`;
  }
  /**
   * Fetch all restaurants.
   */
   static indexdb_init() {
    return idb.open(indexdb_name , 1  , function(upgradeDb) {
      switch(upgradeDb.oldVersion){
          case 0:
            upgradeDb.createObjectStore( indexdb_store , { keyPath : 'id'}) ;
            upgradeDb.createObjectStore(reviews_store);
      }
    });
  }


  //help from SO https://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
static timeConverter(t) {     
   var a = new Date(t);
    var today = new Date();
    var yesterday = new Date(Date.now() - 86400000);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var year = a.getFullYear();
    var month = months[a.getMonth()];
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    if (a.setHours(0,0,0,0) == today.setHours(0,0,0,0))
        return 'today, ' + hour + ':' + min;
    else if (a.setHours(0,0,0,0) == yesterday.setHours(0,0,0,0))
        return 'yesterday, ' + hour + ':' + min;
    else if (year == today.getFullYear())
        return date + ' ' + month + ', ' + hour + ':' + min;
    else
        return date + ' ' + month + ' ' + year + ', ' + hour + ':' + min;
}



   static getCachedRestaurants(){
     let dbPromise = DBHelper.indexdb_init();
      return dbPromise.then(function(db) {
        var tx = db.transaction(indexdb_store);
        var restaurant_store = tx.objectStore(indexdb_store);
        return restaurant_store.getAll();
      });
  }

  static getChachedReviews(id){
    let dbPromise=DBHelper.indexdb_init();
    return dbPromise.then(function(db) {
        var tx = db.transaction(reviews_store);
        var restaurant_store = tx.objectStore(reviews_store);
        return restaurant_store.get(id);
      });
  }

  static getRestaurantReview(id){
    let review_url = `http://localhost:${port}/reviews/?restaurant_id=${id}`;
    return fetch(review_url).then(j_response => {
      return j_response.json().then(j_reviews =>{
        return j_reviews;
      });
    });
  }

  static fetchRestaurants(callback){

    //stage2
    //fetch from network first and update indexdb.
    fetch(DBHelper.DATABASE_URL).then( j_response => {
            j_response.json().then(j_resturants => { 
              let dbPromise=DBHelper.indexdb_init();
              dbPromise.then(function(db) {
              var tx = db.transaction(indexdb_store, 'readwrite');
              var resturant_store = tx.objectStore(indexdb_store);
              for (var r in j_resturants){
                resturant_store.put(j_resturants[r]);
              }
              callback(null,j_resturants);
              tx.complete.then(console.log('updating db.'));
            });
          });
        }).catch( (reject) => {
          DBHelper.getCachedRestaurants().then(restaurants => {
            if(restaurants.length>0)
              return callback(null,restaurants);
            else //indexdb failed as well
              return callback('failed to fetch restaurant data', null);
          }).catch( () => callback('failed to fetch restaurants data from db' , null));
            
      });  
  }



  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          DBHelper.getRestaurantReview(id).then( result => {
            //fetch most recent reviews
            restaurant.reviews= result;
            restaurant.reviews.forEach(review => review.date=DBHelper.timeConverter(review.createdAt));

            //update indexdb.
            let dbPromise= DBHelper.indexdb_init();
            dbPromise.then(db => {
              var tx = db.transaction(reviews_store , 'readwrite');
              var rev_store = tx.objectStore(reviews_store);
              rev_store.put(restaurant.reviews , id );
              console.log(restaurant.reviews);
              tx.complete.then(console.log(`updated review with id ${id}`)).catch(error => console.log(error));
            });

            //and on we go.

            callback(null, restaurant);
            })
          .catch(() =>{
            //we failed , fall back to indexdb
              DBHelper.getChachedReviews(id).then(result => {
                restaurant.reviews=result;
                console.log("this is form indexdb");
                console.log(restaurant.reviews)
                callback(null,restaurant);
              });
            });
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */


  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  
  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    if(restaurant.photograph!=null)
      return (`dist/img/${restaurant.photograph}.webp`);
    else
      return 'dist/img/not_available.webp';

  }

  static altForRestaurant(restaurant){
    return (`photograph of ${restaurant.name}`);
  }
  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
