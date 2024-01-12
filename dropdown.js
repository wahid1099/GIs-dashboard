// Function to populate Upazila dropdown initially (before selecting District)

function populateUpazilaDropdown() {
  var upazilaDropdown = document.getElementById("upazila");
  upazilaDropdown.innerHTML = '<option value="all">All Upazilas</option>';
  var uniqueUpazilas = [
    ...new Set(
      geojsonData.features.map((feature) => feature.properties.Upazila)
    ),
  ];

  uniqueUpazilas.forEach((upazila) => {
    var option = document.createElement("option");
    option.value = upazila;
    option.text = upazila;
    upazilaDropdown.appendChild(option);
  });

  // Trigger function to update Union dropdown when Upazila changes
  upazilaDropdown.addEventListener("change", updateUnionDropdown);
}

// Function to populate Union dropdown initially (before selecting District and Upazila)
function populateUnionDropdown() {
  var unionDropdown = document.getElementById("union");
  unionDropdown.innerHTML = '<option value="all">All Unions</option>'; // Clear previous options

  var uniqueUnions = [
    ...new Set(geojsonData.features.map((feature) => feature.properties.Union)),
  ];

  uniqueUnions.forEach((union) => {
    var option = document.createElement("option");
    option.value = union;
    option.text = union;
    unionDropdown.appendChild(option);
  });
}

// Function to update Upazila dropdown based on selected District
function updateUpazilaDropdown() {
  var selectedDistrict = document.getElementById("district").value;
  var upazilaDropdown = document.getElementById("upazila");
  upazilaDropdown.innerHTML = '<option value="all">All Upazilas</option>'; // Clear previous options

  if (selectedDistrict !== "all") {
    var uniqueUpazilas = [
      ...new Set(
        geojsonData.features
          .filter((feature) => feature.properties.District === selectedDistrict)
          .map((feature) => feature.properties.Upazila)
      ),
    ];

    uniqueUpazilas.forEach((upazila) => {
      var option = document.createElement("option");
      option.value = upazila;
      option.text = upazila;
      upazilaDropdown.appendChild(option);

      // Trigger function to update Union dropdown when Upazila changes
      upazilaDropdown.addEventListener("change", updateUnionDropdown);
    });
  } else {
    // If "All Districts" is selected, clear the Upazila and Union dropdowns
    document.getElementById("upazila").innerHTML =
      '<option value="all">All Upazilas</option>';
    document.getElementById("union").innerHTML =
      '<option value="all">All Unions</option>';
  }

  // Update the map based on the selected filters
  updateMap();
}

// Function to update Union dropdown based on selected Upazila
function updateUnionDropdown() {
  var selectedDistrict = document.getElementById("district").value;
  var selectedUpazila = document.getElementById("upazila").value;
  var unionDropdown = document.getElementById("union");

  unionDropdown.innerHTML = '<option value="all">All Unions</option>'; // Clear previous options

  if (selectedDistrict !== "all" && selectedUpazila !== "all") {
    var uniqueUnions = [
      ...new Set(
        geojsonData.features
          .filter(
            (feature) =>
              feature.properties.District === selectedDistrict &&
              feature.properties.Upazila === selectedUpazila
          )
          .map((feature) => feature.properties.Union)
      ),
    ];

    uniqueUnions.forEach((union) => {
      var option = document.createElement("option");
      option.value = union;
      option.text = union;
      unionDropdown.appendChild(option);
    });
  }

  // Update the map based on the selected filters
  updateMap();
}

function updateVillageDropdown() {
  var selectedDistrict = document.getElementById("district").value;
  var selectedUpazila = document.getElementById("upazila").value;
  var selectedUnion = document.getElementById("union").value;

  // Filter villages based on the selected district, upazila, and union
  var uniqueFilteredVillages = [
    ...new Set(
      geojsonData.features
        .filter(
          (feature) =>
            (selectedDistrict === "all" ||
              feature.properties.District === selectedDistrict) &&
            (selectedUpazila === "all" ||
              feature.properties.Upazila === selectedUpazila) &&
            (selectedUnion === "all" ||
              feature.properties.Union === selectedUnion)
        )
        .map((feature) => feature.properties.Village)
    ),
  ];

  // Clear previous options and add the new filtered villages
  villageDropdown.innerHTML = '<option value="all">All Villages</option>';
  uniqueFilteredVillages.forEach((village) => {
    var option = document.createElement("option");
    option.value = village;
    option.text = village;
    villageDropdown.appendChild(option);
  });

  updateMap(); // Call updateMap after updating the village dropdown
}
