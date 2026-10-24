const mapElement = document.getElementById("map");
const mapToken = mapElement.dataset.token;
const listing = JSON.parse(mapElement.dataset.listing);

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: listing.geometry.coordinates,
  zoom: 8,
});
const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(listing.title))
  .addTo(map);
