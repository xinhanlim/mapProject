window.addEventListener("load", function () {
  let singapore = [1.29, 103.85];
  let map = L.map("mapContainer", { zoomControl: false }).setView(
    singapore,
    14
  );
  let markers = [];
  let clusterMakerLayer = L.markerClusterGroup();

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenstreetMap</a>',
  }).addTo(map);

  // Add zoom control manually to the top right
  L.control
    .zoom({
      position: "topright",
    })
    .addTo(map);

  map.addLayer(clusterMakerLayer);

  let JSONBIN_API_KEY =
    "$2a$10$KwFo.bBhc5y1wL6uCEMo8efU.C5eISs9RMiN1LKnp9nbtH4hCexI";
  let BIN_ID = "67f8d0508561e97a50fd4ffb";
  let JSONBIN_ROOT_URL = "https://api.jsonbin.io/v3";

  let apiKEY = "fsq3mir5JyWmycFrvHEnipkB8SZI/HbogiUfPOy4JZQr2c0=";
  let apiURL = "https://api.foursquare.com/v3";
  let headers = {
    accept: "application/json",
    Authorization: apiKEY,
  };

  async function search(query) {
    let center = map.getCenter();
    let latlng = `${center.lat},${center.lng}`;
    let url = `${apiURL}/places/search?query=${query}&ll=${latlng}&radius=5000&limit=50`;
    // // this url is to let the system fetch later on.

    let response = await fetch(url, {
      headers: { ...headers },
    });

    return await response.json();
  }

  async function showResult() {
    let query = document.getElementById("searchInput").value;
    let result = await search(query);
    console.log(result);
    clusterMakerLayer.clearLayers();
    markers = [];

    for (let i = 0; i < result.results.length; i++) {
      let places = result.results[i];
      let placesCoordinate = [
        places.geocodes.main.latitude,
        places.geocodes.main.longitude,
      ];

      let marker = L.marker(placesCoordinate).bindPopup(
        `<strong>${places.name}</strong> <div>
         <button type="button" class="btn btn-sm btn-primary favourite-btn" data-name="${places.name}">
         Add to Favourites</button>
         </div>`
      );
      clusterMakerLayer.addLayer(marker);
      markers.push(marker);
    }
  }

  let favourites = [];

  function favouritesList() {
    let favouriteContainer = document.getElementById("favouritesList");
    favouriteContainer.innerHTML = "";

    let ul = document.createElement("ul");
    favourites.forEach((places) => {
      let li = document.createElement("li");
      li.textContent = places.name;
      ul.appendChild(li);
    });
    favouriteContainer.appendChild(ul);
  }

  document.addEventListener("click", function (event) {
    // Check if the clicked element is our "Add to Favourites" button
    if (event.target && event.target.className.includes("favourite-btn")) {
      let placeName = event.target.getAttribute("data-name");
      console.log(placeName);

      // Check if already in favourites
      let placeExisted = false;
      for (let i = 0; i < favourites.length; i++) {
        if (favourites[i].name === placeName) {
          placeExisted = true;
          break;
        }
      }

      if (!placeExisted) {
        let foundMarker = null;
        for (let i = 0; i < markers.length; i++) {
          let popupContent = markers[i].getPopup().getContent();
          if (popupContent.includes(placeName)) {
            foundMarker = markers[i];
            break;
          }
        }

        if (foundMarker !== null) {
          let latlng = foundMarker.getLatLng();
          favourites.push({
            name: placeName,
            lat: latlng.lat,
            lng: latlng.lng,
          });
          console.log(favourites);
          favouritesList();
        } else {
          alert("Marker not found!");
        }
      } else {
        alert("Already in Favourites");
      }
    }
  });

  document.getElementById("searchBtn").addEventListener("click", showResult);
  document
    .getElementById("favourites")
    .addEventListener("click", favouritesList);
  map.on("moveend", showResult);
});
