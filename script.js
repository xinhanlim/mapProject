window.addEventListener('load', function(){
    let singapore = [1.29, 103.85];
    let map = L.map("mapContainer"). setView(singapore, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom:19,
        attribution:
        '&copy; <a href="httpL//www.openstreetmap.org/copyright">OpenstreetMap</a>',
    }).addTo(map);
})