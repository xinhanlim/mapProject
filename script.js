window.addEventListener('load', function(){
    let singapore = [1.29, 103.85];
    let map = L.map("mapContainer", {zoomControl:false}). setView(singapore, 14);
    let markers =[];

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

    async function search(query) {
        let center = map.getCenter();
        let latlng = `${center.lat},${center.lng}`;
        let url = `${apiURL}/places/search?query=${query}&ll=${latlng}&radius=3000&limit=50`;
        // // this url is to let the system fetch later on.
        // let url = `${apiURL}/places/search?query=${query}&bbox=${bbox}&limit=50`;

        let response = await fetch(url,{
            headers: {...headers},
        })

        return await response.json();

    }

    async function showResult(){
        let query = document.getElementById('searchInput').value;
        let result = await search(query);
        console.log(result);

        markers.forEach(marker => map.removeLayer(marker));
        markers = [];
        for(let i=0; i < result.results.length; i++){
            let places = result.results[i];
            let placesCoordinate = [
                places.geocodes.main.latitude,
                places.geocodes.main.longitude,
            ]
            let marker = L.marker(placesCoordinate)
            .addTo(map)
            .bindPopup(`<strong>${places.name}</strong>`);
            markers.push(marker);
        }
    }

    document.getElementById('searchBtn').addEventListener('click', showResult)
    map.on('moveend', showResult)

})
