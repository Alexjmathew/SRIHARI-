// Initialize the map with modern settings
const map = L.map('map', {
  zoomControl: false,
  preferCanvas: true
}).setView([51.505, -0.09], 13);

// Add modern tile layer
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Custom control position
L.control.zoom({
  position: 'topright'
}).addTo(map);

// Custom markers
const customIcon = L.icon({
  iconUrl: '/static/images/markers/marker-primary.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Store markers and routes
const markers = {};
let currentRoute = null;
let routePoints = [];

// Add landmark button functionality
document.getElementById('add-landmark').addEventListener('click', () => {
  const modal = new bootstrap.Modal(document.getElementById('landmarkModal'));
  modal.show();
  
  // Clear previous coordinates
  document.getElementById('landmarkLat').value = '';
  document.getElementById('landmarkLng').value = '';
  
  // Set up map click handler
  const mapClickHandler = e => {
    document.getElementById('landmarkLat').value = e.latlng.lat.toFixed(6);
    document.getElementById('landmarkLng').value = e.latlng.lng.toFixed(6);
    
    // Add temporary marker
    if (window.tempMarker) {
      map.removeLayer(window.tempMarker);
    }
    window.tempMarker = L.marker(e.latlng, {
      icon: customIcon,
      zIndexOffset: 1000
    }).addTo(map);
    
    map.off('click', mapClickHandler);
  };
  
  map.on('click', mapClickHandler);
});

// Landmark form submission
document.getElementById('landmarkForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const landmark = {
    name: document.getElementById('landmarkName').value,
    description: document.getElementById('landmarkDescription').value,
    coordinates: {
      lat: parseFloat(document.getElementById('landmarkLat').value),
      lng: parseFloat(document.getElementById('landmarkLng').value)
    },
    type: document.getElementById('landmarkType').value
  };
  
  try {
    const response = await fetch('/api/landmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(landmark)
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      landmark._id = data.id;
      addLandmarkToMap(landmark);
      bootstrap.Modal.getInstance(document.getElementById('landmarkModal')).hide();
      
      // Remove temporary marker
      if (window.tempMarker) {
        map.removeLayer(window.tempMarker);
        window.tempMarker = null;
      }
      
      // Show success notification
      showNotification('Landmark added successfully!', 'success');
    }
  } catch (error) {
    console.error('Error:', error);
    showNotification('Failed to add landmark', 'error');
  }
});

// Add landmark to map with beautiful popup
function addLandmarkToMap(landmark) {
  const marker = L.marker([
    landmark.coordinates.lat, 
    landmark.coordinates.lng
  ], {
    icon: getIconForType(landmark.type)
  }).addTo(map);
  
  const popupContent = `
    <div class="landmark-popup">
      <h4>${landmark.name}</h4>
      <p>${landmark.description || 'No description provided'}</p>
      <div class="popup-actions">
        <button class="btn btn-sm btn-primary view-details" data-id="${landmark._id}">
          <i class="fas fa-info-circle"></i> Details
        </button>
        ${current_user.role === 'admin' || landmark.created_by === current_user.id ? `
        <button class="btn btn-sm btn-danger delete-landmark" data-id="${landmark._id}">
          <i class="fas fa-trash"></i> Delete
        </button>
        ` : ''}
      </div>
    </div>
  `;
  
  marker.bindPopup(popupContent);
  markers[landmark._id] = marker;
  
  // Add event listeners to popup buttons
  marker.on('popupopen', () => {
    document.querySelector(`.view-details[data-id="${landmark._id}"]`)
      .addEventListener('click', () => showLandmarkDetails(landmark._id));
      
    document.querySelector(`.delete-landmark[data-id="${landmark._id}"]`)
      ?.addEventListener('click', () => deleteLandmark(landmark._id));
  });
}

// Get appropriate icon for landmark type
function getIconForType(type) {
  const iconColors = {
    'point': 'primary',
    'building': 'secondary',
    'nature': 'success',
    'historic': 'danger'
  };
  
  return L.icon({
    iconUrl: `/static/images/markers/marker-${iconColors[type] || 'primary'}.png`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
}

// Show beautiful notification
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type} fade-in`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Panel collapse functionality
document.querySelector('.collapse-panel').addEventListener('click', () => {
  const panel = document.querySelector('.control-panel');
  panel.classList.toggle('collapsed');
  
  const icon = panel.querySelector('.collapse-panel i');
  if (panel.classList.contains('collapsed')) {
    icon.classList.remove('fa-chevron-left');
    icon.classList.add('fa-chevron-right');
  } else {
    icon.classList.remove('fa-chevron-right');
    icon.classList.add('fa-chevron-left');
  }
});

// Initial load of landmarks
async function loadLandmarks() {
  try {
    const response = await fetch('/api/landmarks');
    const landmarks = await response.json();
    
    landmarks.forEach(landmark => {
      addLandmarkToMap(landmark);
      addToLandmarkList(landmark);
    });
  } catch (error) {
    console.error('Error loading landmarks:', error);
  }
}

// Add landmark to sidebar list
function addToLandmarkList(landmark) {
  const listItem = document.createElement('div');
  listItem.className = 'landmark-item';
  listItem.innerHTML = `
    <div class="landmark-icon">
      <img src="/static/images/markers/marker-${landmark.type || 'point'}.png" alt="${landmark.type}">
    </div>
    <div class="landmark-info">
      <h5>${landmark.name}</h5>
      <p>${landmark.description?.substring(0, 50) || ''}...</p>
    </div>
  `;
  
  listItem.addEventListener('click', () => {
    map.setView([landmark.coordinates.lat, landmark.coordinates.lng], 15);
    markers[landmark._id].openPopup();
  });
  
  document.querySelector('.landmark-list .list-container').appendChild(listItem);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  loadLandmarks();
  
  // Add smooth transitions
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 200);
    });
  });
});
