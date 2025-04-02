// Initialize Three.js scene, camera, renderer, controls, and Earth
let scene, camera, renderer, controls;
const earthRadius = 50;
const markers = [];
const markerLifetime = 10000; // 10 seconds in milliseconds

function initGlobe() {
  // Create scene and camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 0.1, 1000
  );
  camera.position.set(0, 0, earthRadius * 2);  // start at equator, pulled back

  // Lighting (soft ambient light and a directional light for a day/night effect)
  const ambientLight = new THREE.AmbientLight(0x333333);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(earthRadius, earthRadius, earthRadius);
  scene.add(directionalLight);

  // Texture loader for remote textures
  const textureLoader = new THREE.TextureLoader();

  // Earth geometry and material with remote textures
  const earthGeom = new THREE.SphereGeometry(earthRadius, 64, 64);
  const earthMat = new THREE.MeshPhongMaterial({
    map: textureLoader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg'),
    normalMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg'),
    specularMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_specular_2048.jpg'),
    emissiveMap: textureLoader.load('https://threejs.org/examples/textures/planets/earth_lights_2048.jpg'), // City lights
    emissive: new THREE.Color(0xffffff), // Set emissive color to white
    emissiveIntensity: 0.5, // Adjust intensity of city lights
    normalScale: new THREE.Vector2(0.85, 0.85) // Scale for normal map effect
  });
  const earthMesh = new THREE.Mesh(earthGeom, earthMat);
  scene.add(earthMesh);

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Append renderer canvas to the container div
  const container = document.getElementById('globe-container');
  container.appendChild(renderer.domElement);

  // OrbitControls for interaction
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);       // look at Earth's center
  controls.enableDamping = true;      // smooth inertia
  controls.dampingFactor = 0.1;
  controls.autoRotate = true;        // slowly rotate globe automatically
  controls.autoRotateSpeed = 0.5;    // rotation speed (slow)

  // Handle window resize for responsive canvas
  window.addEventListener('resize', onWindowResize);
  // Start the animation/render loop
  animate();
}

// Convert lat, lon to 3D position and add a glowing marker dot
function addMarker(lat, lon, isSuspicious) {
  // Convert degrees to radians
  const latRad = lat * Math.PI / 180;
  const lonRad = lon * Math.PI / 180;
  // Spherical to Cartesian conversion (Y axis as up):
  // x = R * cos(lat) * cos(lon)
  // y = R * sin(lat)
  // z = R * cos(lat) * sin(lon)
  const x = earthRadius * Math.cos(latRad) * Math.cos(lonRad);
  const y = earthRadius * Math.sin(latRad);
  const z = earthRadius * Math.cos(latRad) * Math.sin(lonRad);
  // Slightly elevate the marker above the surface to avoid z-fighting
  const out = 1.02;  // factor to raise marker 2% above surface
  const markerPos = new THREE.Vector3(x * out, y * out, z * out);

  // Create a small sphere for the marker
  const markerGeom = new THREE.SphereGeometry(0.5, 8, 8);
  const color = isSuspicious ? 0xff0000 : 0xffffff;  // red for suspicious, white for normal
  const markerMat = new THREE.MeshBasicMaterial({ color: color });
  // MeshBasicMaterial is not affected by light, so it appears "glowing" in its pure color
  const markerMesh = new THREE.Mesh(markerGeom, markerMat);
  markerMesh.position.copy(markerPos);
  scene.add(markerMesh);

  // Save marker with timestamp for removal later
  markers.push({ mesh: markerMesh, createdAt: Date.now() });
}

function animate() {
  requestAnimationFrame(animate);
  // Update controls (needed for autoRotate and damping)&#8203;:contentReference[oaicite:1]{index=1}
  controls.update();
  // Remove markers that have exceeded their lifetime
  const now = Date.now();
  for (let i = markers.length - 1; i >= 0; i--) {
    if (now - markers[i].createdAt > markerLifetime) {
      scene.remove(markers[i].mesh);
      markers.splice(i, 1);
    }
  }
  // Render the scene with the current camera
  renderer.render(scene, camera);
}

function onWindowResize() {
  // Adjust camera and renderer on window resize for responsiveness
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
