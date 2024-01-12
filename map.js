let geojsonLayer;
let geojsonData;
let markers;
let map;
let pointLayer, polygonLayer;
let uniqueStTypeslegend;

document.addEventListener("DOMContentLoaded", function () {
  // Fetch GeoJSON data
  fetch("Shapefile.json")
    .then((response) => response.json())
    .then((data) => {
      geojsonData = data;

      // Populate District dropdown with unique districts from GeoJSON
      var districtDropdown = document.getElementById("district");
      var uniqueDistricts = [
        ...new Set(
          geojsonData.features.map((feature) => feature.properties.District)
        ),
      ];
      uniqueDistricts.forEach((district) => {
        var option = document.createElement("option");
        option.value = district;
        option.text = district;
        districtDropdown.appendChild(option);
      });
      var villageDropdown = document.getElementById("village");
      villageDropdown.innerHTML = '<option value="all">All Villages</option>'; // Clear previous options

      var uniqueVillages = [
        ...new Set(
          geojsonData.features.map((feature) => feature.properties.Village)
        ),
      ];

      uniqueVillages.forEach((village) => {
        var option = document.createElement("option");
        option.value = village;
        option.text = village;
        villageDropdown.appendChild(option);
      });

      // Populate Upazila dropdown initially (before selecting District)
      populateUpazilaDropdown();

      // Populate Union dropdown initially (before selecting District and Upazila)
      populateUnionDropdown();

      // Populate St_Type dropdown with unique structure types from GeoJSON
      var stTypeDropdown = document.getElementById("stType");

      stTypeDropdown.addEventListener("change", updateMap);

      var uniqueStTypes = [
        ...new Set(
          geojsonData.features.map((feature) => feature.properties.St_Type)
        ),
      ];

      uniqueStTypes.forEach((stType) => {
        var option = document.createElement("option");
        option.value = stType;
        option.text = stType;
        stTypeDropdown.appendChild(option);
      });

      // Initialize uniqueStTypes
      uniqueStTypeslegend = new Set();
      geojsonData.features.forEach((feature) => {
        uniqueStTypeslegend.add(feature.properties.St_Type);
      });
      uniqueStTypeslegend = Array.from(uniqueStTypeslegend);

      // Creating the map using the data
      createMap();
      createLegend();
      updateTotalCounts(geojsonData);
    })
    .catch((error) => {
      console.error("Error loading GeoJSON data:", error);
    });
});

function createMap() {
  map = L.map("map").setView([23.6943117, 90.344352], 5);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors",
  }).addTo(map);

  markers = L.markerClusterGroup();
  pointLayer = L.layerGroup().addTo(map); // New layer group for points
  polygonLayer = L.layerGroup().addTo(map); // New layer group for polygons

  L.geoJSON(geojsonData, {
    style: function (feature) {
      return { fillColor: "green", color: "white", weight: 2 };
    },
    onEachFeature: function (feature, layer) {
      var marker = L.marker(layer.getBounds().getCenter(), {
        icon: L.divIcon({
          className: "map-icon",
          html: '<i class="fas fa-map-marker-alt big-marker"></i>',
        }),
      });

      marker.bindPopup(getPopupContent(feature.properties));

      markers.addLayer(marker);
    },
  }).addTo(map);

  map.addLayer(markers);

  map.fitBounds(markers.getBounds());
}
// ...

// Add event listener to the village dropdown

// ...

function updateMap() {
  var selectedDistrict = document.getElementById("district").value;
  var selectedUpazila = document.getElementById("upazila").value;
  var selectedUnion = document.getElementById("union").value;
  var selectedVillage = document.getElementById("village").value;
  var selectedStType = document.getElementById("stType").value;

  var startDate = document.getElementById("startDate").value;
  var endDate = document.getElementById("endDate").value;

  // Remove the existing markers layer from the map
  if (map.hasLayer(markers)) {
    map.removeLayer(markers);
  }

  // Create a new markers layer
  markers = L.markerClusterGroup();

  var filteredGeojson = geojsonData.features.filter((feature) => {
    var date = new Date(feature.properties.Date);
    return (
      (selectedDistrict === "all" ||
        feature.properties.District === selectedDistrict) &&
      (selectedUpazila === "all" ||
        feature.properties.Upazila === selectedUpazila) &&
      (selectedUnion === "all" || feature.properties.Union === selectedUnion) &&
      (selectedVillage === "all" ||
        feature.properties.Village === selectedVillage) &&
      (selectedStType === "all" ||
        feature.properties.St_Type === selectedStType) &&
      (startDate === "" || date >= new Date(startDate)) &&
      (endDate === "" || date <= new Date(endDate))
    );
  });
  // Add the filtered GeoJSON to the markers layer
  // Add the filtered GeoJSON to the markers layer
  L.geoJSON(filteredGeojson, {
    style: function (feature) {
      return {
        fillColor: getColor(
          uniqueStTypeslegend.indexOf(feature.properties.St_Type)
        ),
        color: "white",
        weight: 2,
      };
    },
    onEachFeature: function (feature, layer) {
      var icon;

      // Choose icon based on St_Type
      if (feature.properties.St_Type === "Sanmark centre") {
        icon = L.divIcon({
          className: "map-icon",
          html: '<i class="fas fa-building big-marker"></i>',
        });
      } else if (feature.properties.St_Type === "Water Body") {
        icon = L.divIcon({
          className: "map-icon",
          html: '<i class="fas fa-water big-marker"></i>',
        });
      } else {
        // Default icon for other types
        icon = L.divIcon({
          className: "map-icon",
          html: '<i class="fas fa-map-marker-alt big-marker"></i>',
        });
      }

      var marker = L.marker(layer.getBounds().getCenter(), {
        icon: icon,
      });

      marker.bindPopup(getPopupContent(feature.properties));

      markers.addLayer(marker);
    },
  });
  // Add the markers layer to the map
  map.addLayer(markers);

  var bounds;
  if (filteredGeojson.length > 0) {
    bounds = markers.getBounds();

    updateCounts(selectedDistrict, selectedUpazila, selectedUnion);
    updateTotalCounts(filteredGeojson); // Call updateCounts
  } else {
    bounds = L.latLngBounds(L.latLng(-90, -180), L.latLng(90, 180));
  }

  map.fitBounds(bounds);

  updateCounts(selectedDistrict, selectedUpazila, selectedUnion);
  updateTotalCounts(filteredGeojson); // Call updateTotalCounts
  // Call updateCounts
}

// Function to show information in a popup
function getPopupContent(properties) {
  return `
    <h3>${properties.Village}</h3>
   
    <p>District: ${properties.District}</p>
    <p>Upazila: ${properties.Upazila}</p>
    <p>Union: ${properties.Union}</p>
    <p>St_Type: ${properties.St_Type}</p>
    <p>Date: ${formatDate(properties.Date)}</p>
    <!-- Add more properties as needed -->
  `;
}

// Function to format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function updateCounts(selectedDistrict, selectedUpazila, selectedUnion) {
  // Filter data for the selected district, upazila, and union
  var filteredData = geojsonData.features.filter((feature) => {
    return (
      (selectedDistrict === "all" ||
        feature.properties.District === selectedDistrict) &&
      (selectedUpazila === "all" ||
        feature.properties.Upazila === selectedUpazila) &&
      (selectedUnion === "all" || feature.properties.Union === selectedUnion)
    );
  });

  // Count occurrences for each St_Type
  var stTypeCounts = {};
  filteredData.forEach((feature) => {
    var stType = feature.properties.St_Type;
    stTypeCounts[stType] = (stTypeCounts[stType] || 0) + 1;
  });

  // Display counts in the HTML
  var countsElement = document.getElementById("counts");
  countsElement.innerHTML = ""; // Clear previous counts

  // Loop through each St_Type and display its count
  Object.keys(stTypeCounts).forEach((stType) => {
    var count = stTypeCounts[stType];
    var li = document.createElement("li");
    li.innerText = `${stType}: ${count}`;
    countsElement.appendChild(li);
  });
}

// Function to create the legend
function createLegend() {
  if (!geojsonData) {
    console.error("GeoJSON data is undefined. Cannot create legend.");
    return;
  }

  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function (map) {
    var div = L.DomUtil.create("div", "info legend");

    // Loop through the unique St_Type values and generate a label with a colored square for each
    uniqueStTypeslegend.forEach((stType, index) => {
      var color = getColor(index); // Use the getColor function to get a color
      div.innerHTML +=
        '<i style="background:' + color + '"></i> ' + stType + "<br>";
    });

    return div;
  };

  legend.addTo(map);
}

// Function to get a predefined color based on an index
function getColor(index) {
  var colors = [
    "#FF5733",
    "#33FF57",
    "#5733FF",
    "#FF5733",
    "#33FF57",
    "#5733FF",
  ];
  // You can add more colors to the array if needed
  return colors[index % colors.length];
}

// Add event listener to the village dropdown
function updateTotalCounts(filteredGeojson) {
  // Calculate total St_Types, total beneficiaries, total coverage area, total villages, and total unions
  var totalStTypescount = new Set();
  var totalBeneficiaries = 0;
  var totalCoverageArea = 0;
  var totalVillages = new Set();
  var totalUnions = new Set();

  filteredGeojson.forEach((feature) => {
    var stType = feature.properties.St_Type;
    totalStTypescount.add(stType);

    totalVillages.add(feature.properties.Village);
    totalUnions.add(feature.properties.Union);
  });

  // Update the HTML elements with the calculated counts
  document.getElementById("totalStTypes").innerText = totalStTypescount.size;
  document.getElementById("totalVillages").innerText = totalVillages.size;
  document.getElementById("totalUnions").innerText = totalUnions.size;
}

villageDropdown.addEventListener("change", updateMap);
