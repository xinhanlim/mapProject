window.addEventListener("load", async function () {
  let singapore = [1.29, 103.85];
  let map = L.map("mapContainer", { zoomControl: false }).setView(
    singapore,
    14
  );
  //offcanvas close when click on empty map.
  map.on("click", function (e) {
    // Skip offcanvas closing if it was triggered from favourites
    if (justClickedFromFavourites) {
      justClickedFromFavourites = false; // reset flag
      return;
    }

    const clickedElement = e.originalEvent.target;
    const clickedInsidePopup =
      clickedElement.closest(".leaflet-popup") ||
      clickedElement.closest(".leaflet-marker-icon");

    if (!clickedInsidePopup) {
      const offcanvasEl = document.getElementById("offcanvasMenu");
      const offcanvasInstance =
        bootstrap.Offcanvas.getInstance(offcanvasEl) ||
        new bootstrap.Offcanvas(offcanvasEl);
      offcanvasInstance.hide();

      document.querySelectorAll("#offcanvasFavouritesList li").forEach((li) => {
        li.classList.remove("active");
      });
    }
  });

  let searchMarkers = [];
  let favouriteMarkers = [];
  //   let clusterMakerLayer = L.markerClusterGroup();
  let selectedFavouriteName = null;
  let favourites = [];

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

  //   map.addLayer(clusterMakerLayer)

  const BIN_ID = "67f8d0258a456b7966871caa";
  const JSONBIN_ROOT_URL = "https://api.jsonbin.io/v3";

  let apiKEY = "fsq3mir5JyWmycFrvHEnipkB8SZI/HbogiUfPOy4JZQr2c0=";
  let apiURL = "https://api.foursquare.com/v3";
  let headers = {
    accept: "application/json",
    Authorization: apiKEY,
  };

  function GET_JSONBIN_ROOT_URL(BIN_ID) {
    return JSONBIN_ROOT_URL + "/b/" + BIN_ID;
  }

  async function importFromJSONBIN() {
    let dataFromJSONBIN = await fetch(GET_JSONBIN_ROOT_URL(BIN_ID));
    dataFromJSONBIN = await dataFromJSONBIN.json();
    favourites = dataFromJSONBIN.record.favourites;
    favouriteMarkers.forEach((m) => map.removeLayer(m));
    favouriteMarkers = [];

    favourites.forEach((places) => {
      let marker = L.marker([places.lat, places.lng]).bindPopup(
        `<strong>${places.name}</strong>
      <button type="button" class="removeFavBtn btn btn-danger" data-name="${places.name}">Remove From Favourites</button>
      `
      );

      marker.placeName = places.name;
      //   clusterMakerLayer.addLayer(marker);
      marker.addTo(map);
      favouriteMarkers.push(marker);
    });
    favouritesList();
    console.log(dataFromJSONBIN);
  }
  importFromJSONBIN();

  async function exportToJSONBIN() {
    let JSONBIN_ACCESS_KEY =
      "$2a$10$KwFo.bBhc5y1wL6uCEMo8efU.C5eISs9RMiN1LKnp9nbtH4hCexI.";
    let dataFromJSONBIN = await fetch(GET_JSONBIN_ROOT_URL(BIN_ID), {
      method: "PUT",
      headers: {
        "Content-type": "application/json",
        "X-Access-Key": JSONBIN_ACCESS_KEY,
      },
      body: JSON.stringify({
        favourites: favourites,
      }),
    });
  }

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
    // clusterMakerLayer.clearLayers();
    searchMarkers.forEach((m) => map.removeLayer(m));
    searchMarkers = [];

    for (let i = 0; i < result.results.length; i++) {
      let places = result.results[i];
      let placesCoordinate = [
        places.geocodes.main.latitude,
        places.geocodes.main.longitude,
      ];

      let alreadyFavourited = favourites.some(
        (fav) => fav.name === places.name
      );
      let popupHTML = `<strong>${places.name}</strong> <div>`;
      if (alreadyFavourited) {
        popupHTML += `<button type="button" class="removeFavBtn btn btn-danger" data-name="${places.name}">Remove From Favourites</button>`;
      } else {
        popupHTML += `<button type="button" class="btn btn-sm btn-primary favourite-btn" data-name="${places.name}">
         Add to Favourites</button>`;
      }

      let marker = L.marker(placesCoordinate).bindPopup(popupHTML);
      //   clusterMakerLayer.addLayer(marker);
      marker.placeName = places.name;
      marker.addTo(map);
      searchMarkers.push(marker);
    }
    favourites.forEach((fav) => {
      const alreadyExists =
        searchMarkers.some((m) => m.placeName === fav.name) ||
        favouriteMarkers.some((m) => m.placeName === fav.name);

      if (!alreadyExists) {
        let marker = L.marker([fav.lat, fav.lng]).bindPopup(
          `<strong>${fav.name}</strong><br>
             <button type="button" class="remove-favourite-btn btn btn-danger" data-name="${fav.name}">
               Remove From Favourites
             </button>`
        );
        marker.placeName = fav.name;
        //   clusterMakerLayer.addLayer(marker);
        marker.addTo(map);
        favouriteMarkers.push(marker);
      }
    });
  }

  let hamburgerMenu = document.querySelector(".hamburgerMenu");
  let offcanvasElement = document.getElementById("offcanvasMenu");

  hamburgerMenu.addEventListener("click", function () {
    hamburgerMenu.classList.toggle("active");
  });
  offcanvasElement.addEventListener("hidden.bs.offcanvas", function () {
    hamburgerMenu.classList.remove("active");
  });

  function favouritesList() {
    let favouriteContainer = document.getElementById("offcanvasFavouritesList");
    favouriteContainer.innerHTML = "";

    favouriteContainer.classList.remove("menuHidden");

    let ul = document.createElement("ul");
    favourites.forEach((places) => {
      let li = document.createElement("li");
      li.textContent = places.name;

      if (places.name === selectedFavouriteName) {
        li.classList.add("active");
      }

      li.addEventListener("click", () => {
        document
          .querySelectorAll("#offcanvasFavouritesList li")
          .forEach((item) => {
            item.classList.remove("active");
          });
        li.classList.add("active");
        selectedFavouriteName = places.name;

        let targetMarker = null;
        let allMarkers = [...searchMarkers, ...favouriteMarkers];
        for (let i = 0; i < allMarkers.length; i++) {
          if (allMarkers[i].placeName === places.name) {
            targetMarker = allMarkers[i];
            break;
          }
        }
        if (targetMarker) {
          const latlng = targetMarker.getLatLng();
          justClickedFromFavourites = true;
          map.flyTo([latlng.lat, latlng.lng], 16);
          map.once("moveend", function () {
            targetMarker.openPopup();
            const offcanvasElement = document.getElementById("offcanvasMenu");
            const offcanvasInstance =
              bootstrap.Offcanvas.getInstance(offcanvasElement) ||
              new bootstrap.Offcanvas(offcanvasElement);

          });
        }
      });
      ul.appendChild(li);
    });
    favouriteContainer.appendChild(ul);
  }
  // Add Favorites
  document.addEventListener("click", function (event) {
    if (event.target && event.target.className.includes("favourite-btn")) {
      let placeName = event.target.getAttribute("data-name");
      console.log(placeName);

      let placeExisted = false;
      for (let i = 0; i < favourites.length; i++) {
        if (favourites[i].name === placeName) {
          placeExisted = true;
          break;
        }
      }

      if (!placeExisted) {
        let foundMarker = null;
        for (let i = 0; i < searchMarkers.length; i++) {
          let popupContent = searchMarkers[i].getPopup().getContent();
          if (popupContent.includes(placeName)) {
            foundMarker = searchMarkers[i];
            alert("Added Successfully to Favourites");
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
          //   console.log(favourites);
          let marker = L.marker([latlng.lat, latlng.lng]).bindPopup(
            `<strong>${placeName}</strong><br>
             <button type="button" class="removeFavBtn btn btn-danger" data-name="${placeName}">
             Remove From Favourites</button>`
          );
          marker.placeName = placeName;
          favouriteMarkers.push(marker);
          marker.addTo(map);

          favouritesList();
          exportToJSONBIN();
          showResult();
        } else {
          alert("Marker not found!");
        }
      } else {
        alert("Already in Favourites");
      }
    }
  });
  //Remove from Favourites
  document.addEventListener("click", function (event) {
    if (event.target && event.target.classList.contains("removeFavBtn")) {
      const placeName = event.target.dataset.name;
      favourites = favourites.filter((place) => place.name !== placeName);
      for (let i = 0; i < favouriteMarkers.length; i++) {
        if (favouriteMarkers[i].placeName === placeName) {
          map.removeLayer(favouriteMarkers[i]);
          favouriteMarkers.splice(i, 1);
          break;
        }
      }
      exportToJSONBIN();
      favouritesList();
      map.closePopup();
      alert(`${placeName} Removed From favourites`);
    }
  });

  document.getElementById("searchBtn").addEventListener("click", showResult);
  document
    .getElementById("favourites")
    .addEventListener("click", favouritesList);
  document
    .getElementById("toggleFavouritesBtn")
    .addEventListener("click", function () {
      const list = document.getElementById("offcanvasFavouritesList");
      list.classList.toggle("menuHidden");

      const isHidden = list.classList.contains("menuHidden");
      this.textContent = isHidden ? "+" : "−";
    });
});
