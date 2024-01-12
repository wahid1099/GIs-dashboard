// Initialize and add the map
function initMap() {
    // The location of the first pin
    const pinLocation = { lat: -34.397, lng: 150.644 };
    // The map, centered at the first pin location
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 8,
        center: pinLocation,
    });
    // The marker, positioned at the first pin location
    const marker = new google.maps.Marker({
        position: pinLocation,
        map: map,
    });
}

// Call the function to initialize the map
initMap();
