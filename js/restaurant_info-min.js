let restaurant;var map;let modal=document.getElementById("r-modal");function showModal(){document.getElementById("r-name").focus(),document.getElementById("error").style.display="none",modal.style.display="block",document.onkeydown=function(e){27==(e=e||window.event).keyCode&&closeModal()}}function closeModal(){modal.style.display="none",document.onkeydown=null}function getSelectedRadio(e){for(var t=document.getElementsByName(e),n=0;n<t.length;n++)if(t[n].checked)return t[n].value}function submitModal(){let e=window.location.href.split("?id=")[1],t=document.getElementById("r-name").value,n=getSelectedRadio("r-list"),r=document.getElementById("r-comments").value;if(""==t||null==n||""==r)return void(document.getElementById("error").style.display="block");let a={restaurant_id:e,name:t,rating:n,comments:r};if(!navigator.onLine)return AddtoSyncRevDB(a),void closeModal();DBHelper.sendReview(a),closeModal(),location.reload()}window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),fetchRestaurantFromURL=(e=>{if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?DBHelper.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(fillRestaurantHTML(),e(null,n)):console.error(t)}):(error="No restaurant id in URL",e(error,null))}),fillRestaurantHTML=((e=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img",t.src=DBHelper.imageUrlForRestaurant(e),t.alt=DBHelper.altForRestaurant(e),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");for(let n in e){const r=document.createElement("tr"),a=document.createElement("td");a.innerHTML=n,r.appendChild(a);const l=document.createElement("td");l.innerHTML=e[n],r.appendChild(l),t.appendChild(r)}}),fillReviewsHTML=((e=self.restaurant.reviews)=>{const t=document.getElementById("reviews-container");if(!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const n=document.getElementById("reviews-list");e.forEach(e=>{n.appendChild(createReviewHTML(e))}),t.appendChild(n)}),createReviewHTML=(e=>{const t=document.createElement("li"),n=document.createElement("p");n.innerHTML=e.name,t.appendChild(n);const r=document.createElement("p");r.innerHTML=e.date,t.appendChild(r);const a=document.createElement("p");a.innerHTML=`Rating: ${e.rating}`,t.appendChild(a);const l=document.createElement("p");return l.innerHTML=e.comments,t.appendChild(l),t}),fillBreadcrumb=((e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,n.setAttribute("aria-current","page"),t.appendChild(n)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}),window.onclick=function(e){e.target==modal&&(modal.style.display="none")},window.addEventListener("online",doSync);