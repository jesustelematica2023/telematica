mapboxgl.accessToken =
    "pk.eyJ1IjoiYmlndmVlenVzIiwiYSI6ImNsZjk3dWhuYjAzODc0M251aDZra2x3YWIifQ.DNAwOhvuwW2bQoJPHLhZmA";
const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: Arbol.geometry.coordinates,
    zoom: 11,
});

new mapboxgl.Marker()
    .setLngLat(Arbol.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({ offset: 25 }).setHTML(`<h3>${arbol.title}</h3>`)
    )
    .addTo(map);