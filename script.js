window.addEventListener('load', function(){
    let singapore = [1.29, 103.85];
    let map = L.map("mapContainer", {zoomControl:false}). setView(singapore, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom:19,
        attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenstreetMap</a>',
    }).addTo(map);
    
    // Add zoom control manually to the top right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
    
    let apiKEY = "fsq3mir5JyWmycFrvHEnipkB8SZI/HbogiUfPOy4JZQr2c0=";
    let apiURL = "https://api.foursquare.com/v3";
    let headers = {
            accept: 'application/json',
            Authorization: apiKEY
          }

    async function search(lat,lng,query) {
        let latlng = `${lat}, ${lng}`;
        // this url is to let the system fetch later on.
        let url = `apiURL/places/search?query=${query}&ll=${latlng}`;

        let response = await fetch(url,{
            headers: {...headers},
        })

        return await response.json();

    }

    })