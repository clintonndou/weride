//service worker
//register a service worker
 if('serviceWorker' in navigator){
     navigator.serviceWorker.register('./service-worker.js')
         .then(function(){
             console.log("SW registered");
         });
}