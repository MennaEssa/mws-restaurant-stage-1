/*Sync the queue when back online!*/

function AddtoSyncFavDB(restuarant_id , isFav)
{
    let dbPromise= DBHelper.indexdb_init();
    dbPromise.then(db => {
                var tx = db.transaction(syncFav_store , 'readwrite');
                var rev_store = tx.objectStore(syncFav_store);
                rev_store.put({'id': restuarant_id , 'isFav':isFav}, restuarant_id);
                tx.complete.then(console.log('added fav to sync to indexdb'));
              });

}

function AddtoSyncRevDB(rev_params)

{
    let dbPromise= DBHelper.indexdb_init();
    dbPromise.then(db => {
                var tx = db.transaction(syncRev_store , 'readwrite');
                var rev_store = tx.objectStore(syncRev_store);
                rev_store.put(rev_params , rev_params.name+rev_params.restaurant_id);
                tx.complete.then(console.log('added review to sync to indexdb'));
              });

}

function doSync() {


    //Sync favourites
    let dbPromise = DBHelper.indexdb_init();
    dbPromise.then(function(db) {
        var tx = db.transaction(syncFav_store);
        var store = tx.objectStore(syncFav_store);
        store.getAll().then(favs => {
            favs.forEach(fav => {
                DBHelper.updateFav(fav.id , fav.isFav).then(()=>{
                    var txd=db.transaction(syncFav_store , 'readwrite');
                    var str = txd.objectStore(syncFav_store);
                    str.delete(fav.id);
                }).catch(error => console.log(`failed to sync fav ${fav.id} : ${error}`));
            });
        });
      }); 

    //sync reviews

    dbPromise.then(function(db) {
        var tx = db.transaction(syncRev_store);
        var store = tx.objectStore(syncRev_store);
        store.getAll().then(reviews => {
            reviews.forEach(review => {
                DBHelper.sendReview(review).then(()=>{
                    var txd=db.transaction(syncRev_store , 'readwrite');
                    var str = txd.objectStore(syncRev_store);
                    str.delete(review.name+review.restuarant_id);
                }).catch(error => console.log(`failed to sync fav ${fav.id} : ${error}`));
            });
        });
      }); 

      /*
  fav_queue.forEach( var_object => {
    DBHelper.updateFav(var_object.id,var_object.isFav).then(()=>{
      console.log(`synced fav element ${var_object.id}`);
      fav_queue.shift();
    }).catch((error)=> {
      console.log(`sync failed for element ${var_object.id}`);
      console.log(error);
    });
  });
  */
}

window.addEventListener('online', doSync);