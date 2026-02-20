function renderEventsModule() {
    document.getElementById('moduleContent').innerHTML = `
        <div class="space-y-8">
            <header class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Event Manager</h2>
                    <p class="text-sm text-gray-500 mt-1">Plan and monitor event sustainability and safe crowd density.</p>
                </div>
            </header>

            <!-- Tabs -->
            <div class="flex border-b border-gray-200 gap-6">
                <button class="event-tab active-tab pb-2 px-1 font-semibold text-primary border-b-2 border-primary" data-target="preEvent">Pre-Event Plan</button>
                <button class="event-tab pb-2 px-1 font-semibold text-gray-500 border-b-2 border-transparent hover:text-gray-700" data-target="liveMap">Live Zone Map</button>
                <button class="event-tab pb-2 px-1 font-semibold text-gray-500 border-b-2 border-transparent hover:text-gray-700" data-target="postEvent">Post-Event Report</button>
            </div>

            <!-- Pre-Event Plan -->
            <div id="preEvent" class="tab-pane active fade-in">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Event Details & Estimation</h3>
                    <form id="preEventForm" class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                                <input type="text" id="eventName" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" id="eventDate" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                                <select id="eventVenue" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent">
                                    <option value="Main Auditorium">Main Auditorium (Max 500)</option>
                                    <option value="Sports Ground">Sports Ground (Max 2000)</option>
                                    <option value="Open Air Theatre">Open Air Theatre (Max 300)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Expected Attendees</label>
                                <input type="number" id="eventAttendees" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-accent" placeholder="e.g. 400">
                                <p id="capacityWarning" class="hidden text-xs text-danger mt-1 font-semibold">Warning: Exceeds safe venue capacity!</p>
                            </div>
                        </div>

                        <div class="border-t border-gray-100 pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- Resources -->
                            <div class="bg-gray-50 p-4 rounded border border-gray-200">
                                <h4 class="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Resources</h4>
                                <div class="space-y-3">
                                    <div class="flex justify-between items-center text-sm">
                                        <label>Generators</label>
                                        <input type="number" id="resGens" class="w-16 px-2 py-1 border rounded" value="0" min="0">
                                    </div>
                                    <div class="flex justify-between items-center text-sm">
                                        <label>AC Units</label>
                                        <input type="number" id="resAc" class="w-16 px-2 py-1 border rounded" value="0" min="0">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Food -->
                            <div class="bg-gray-50 p-4 rounded border border-gray-200">
                                <h4 class="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Food Offering</h4>
                                <select id="foodType" class="text-sm w-full px-3 py-2 border rounded outline-none">
                                    <option value="veg">All Vegetarian (Eco-friendly)</option>
                                    <option value="mixed">Mixed (Standard)</option>
                                    <option value="non-veg">Heavy Non-Veg (High Carbon)</option>
                                </select>
                            </div>

                            <!-- Transport -->
                            <div class="bg-gray-50 p-4 rounded border border-gray-200">
                                <h4 class="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Transport Est. (%)</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between items-center text-sm">
                                        <label>Bus/Walk</label>
                                        <input type="number" id="transGreen" class="w-16 px-2 py-1 border rounded" value="70" min="0" max="100">
                                    </div>
                                    <div class="flex justify-between items-center text-sm">
                                        <label>Private Car</label>
                                        <input type="number" id="transCar" class="w-16 px-2 py-1 border rounded" value="30" min="0" max="100">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="flex justify-between items-center pt-4">
                            <div class="text-lg">Predicted Sustainability Score: <span id="predictedScore" class="font-bold text-accent">--/100</span></div>
                            <button type="submit" class="bg-primary hover:bg-[#122e22] text-white py-2 px-6 rounded shadow transition-colors font-medium">Create Event</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Live Zone Map -->
            <div id="liveMap" class="tab-pane hidden fade-in">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="text-lg font-bold text-gray-800">Venue Density Map</h3>
                            <div class="flex gap-2 text-xs font-semibold">
                                <span class="bg-green-100 text-green-800 px-2 py-1 rounded">Safe (< 1.0 p/m²)</span>
                                <span class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Caution (1.0 - 2.0)</span>
                                <span class="bg-red-100 text-red-800 px-2 py-1 rounded">Danger (> 2.0)</span>
                            </div>
                        </div>
                        
                        <!-- Map Container -->
                        <div id="heatmapContainer" class="w-full aspect-video bg-gray-50 rounded border border-gray-200 relative overflow-hidden flex items-center justify-center">
                            <!-- Fallback/Base SVG map representing zones -->
                            <svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                <g id="zone-svg-layer">
                                    <rect x="5" y="5" width="40" height="30" fill="rgba(0,0,0,0.05)" stroke="#ccc" stroke-dasharray="2" />
                                    <text x="25" y="20" font-size="4" text-anchor="middle" fill="#666">Stage (Z1)</text>

                                    <rect x="50" y="5" width="45" height="40" fill="rgba(0,0,0,0.05)" stroke="#ccc" stroke-dasharray="2" />
                                    <text x="72.5" y="25" font-size="4" text-anchor="middle" fill="#666">Seating A (Z2)</text>

                                    <rect x="5" y="40" width="40" height="50" fill="rgba(0,0,0,0.05)" stroke="#ccc" stroke-dasharray="2" />
                                    <text x="25" y="65" font-size="4" text-anchor="middle" fill="#666">Seating B (Z3)</text>

                                    <rect x="50" y="50" width="45" height="40" fill="rgba(0,0,0,0.05)" stroke="#ccc" stroke-dasharray="2" />
                                    <text x="72.5" y="70" font-size="4" text-anchor="middle" fill="#666">Food Court (Z4)</text>
                                </g>
                            </svg>
                            <!-- Heatmap instance will be mounted over this div -->
                            <div id="heatmapLayer" class="absolute inset-0 pointer-events-none"></div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-800 mb-4">Update Headcount</h3>
                        <p class="text-xs text-gray-500 mb-4">Staff on ground should periodically submit crowd counts.</p>
                        
                        <form id="zoneUpdateForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Select Zone</label>
                                <select id="zoneSelect" class="w-full px-3 py-2 border border-gray-300 rounded outline-none text-sm">
                                    <option value="Z1" data-area="120">Stage (120 m²)</option>
                                    <option value="Z2" data-area="180">Seating A (180 m²)</option>
                                    <option value="Z3" data-area="200">Seating B (200 m²)</option>
                                    <option value="Z4" data-area="150">Food Court (150 m²)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Headcount</label>
                                <input type="number" id="zoneCount" required class="w-full px-3 py-2 border border-gray-300 rounded outline-none text-sm" placeholder="Current people count">
                            </div>
                            <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded shadow transition-colors">
                                Apply Update
                            </button>
                        </form>
                        
                        <div id="zoneDensityStatus" class="mt-4 p-3 rounded text-sm hidden">
                            <!-- Status injects here -->
                        </div>
                    </div>
                </div>
            </div>

            <!-- Post-Event Report -->
            <div id="postEvent" class="tab-pane hidden fade-in">
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 py-12">
                    <p>Post-event actuals form will load here after an event is marked complete.</p>
                </div>
            </div>

        </div>
    `;

    // --- Tab Logic ---
    document.querySelectorAll('.event-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.getAttribute('data-target');

            // UI inactive
            document.querySelectorAll('.event-tab').forEach(b => {
                b.classList.remove('active-tab', 'text-primary', 'border-primary');
                b.classList.add('text-gray-500', 'border-transparent');
            });
            // Tab active
            e.target.classList.add('active-tab', 'text-primary', 'border-primary');
            e.target.classList.remove('text-gray-500', 'border-transparent');

            // Panels
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
            document.getElementById(target).classList.remove('hidden');
        });
    });

    // --- Capacity Warning Logic ---
    document.getElementById('eventAttendees').addEventListener('input', (e) => {
        const venue = document.getElementById('eventVenue').value;
        const attendees = parseInt(e.target.value) || 0;
        const warning = document.getElementById('capacityWarning');

        let max = 0;
        if (venue.includes('500')) max = 500;
        else if (venue.includes('2000')) max = 2000;
        else if (venue.includes('300')) max = 300;

        if (attendees > max) {
            warning.classList.remove('hidden');
        } else {
            warning.classList.add('hidden');
        }
    });

    // --- Pre-Event Submission ---
    document.getElementById('preEventForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        window.Router.showLoader();

        try {
            const payload = {
                schoolId: 'school-1',
                name: document.getElementById('eventName').value,
                venue: document.getElementById('eventVenue').value,
                expectedAttendees: parseInt(document.getElementById('eventAttendees').value),
                foodType: document.getElementById('foodType').value,
                resources: {
                    generators: parseInt(document.getElementById('resGens').value),
                    ac: parseInt(document.getElementById('resAc').value)
                },
                transport: {
                    walking: parseInt(document.getElementById('transGreen').value),
                    bus: 0,
                    cycling: 0
                }
            };

            const res = await window.API.request('/events', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            document.getElementById('predictedScore').innerText = res.score + '/100';

            window.Router.hideLoader();
            window.Router.showToast(`Event created! Score: ${res.score}`, 'success');

        } catch (err) {
            window.Router.hideLoader();
            window.Router.showToast(err.message, 'error');
        }
    });

    // --- Heatmap Initialization ---
    // We defer slightly to ensure the DOM has painted the map bounds
    setTimeout(() => {
        const heatmapConfig = {
            container: document.getElementById('heatmapLayer'),
            radius: 40,
            maxOpacity: .6,
            minOpacity: 0,
            blur: .85,
            gradient: {
                // Map density mapping to colors (Green -> Yellow -> Red)
                '.1': 'green',
                '.5': 'yellow',
                '.8': 'red'
            }
        };
        const heatmapInstance = h337.create(heatmapConfig);

        // Expose to window for the update form to access
        window.activeHeatmap = heatmapInstance;
    }, 100);

    // --- Zone Update Form ---
    document.getElementById('zoneUpdateForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        window.Router.showLoader();

        const select = document.getElementById('zoneSelect');
        const count = parseInt(document.getElementById('zoneCount').value);
        const area = parseInt(select.options[select.selectedIndex].getAttribute('data-area'));
        const zoneId = select.value;

        try {
            const res = await window.API.request('/events/evt-live/zones', {
                method: 'POST',
                body: JSON.stringify({
                    zoneId: zoneId,
                    headcount: count,
                    areaSqM: area
                })
            });

            window.Router.hideLoader();

            // Status UI block
            const statusBox = document.getElementById('zoneDensityStatus');
            statusBox.classList.remove('hidden', 'bg-green-100', 'text-green-800', 'bg-yellow-100', 'text-yellow-800', 'bg-red-100', 'text-red-800');

            let colorCls = ['bg-green-100', 'text-green-800'];
            let msg = `Density: ${res.density.toFixed(2)} p/m² (Safe)`;

            if (res.alertFired) {
                colorCls = ['bg-red-100', 'text-red-800'];
                msg = `CRITICAL ALERT: Density ${res.density.toFixed(2)} p/m² (>2.0)! SNS Fired.`;
                window.Router.showToast('WARNING: Overcrowding!', 'error');
            } else if (res.density > 1.0) {
                colorCls = ['bg-yellow-100', 'text-yellow-800'];
                msg = `Caution: Density ${res.density.toFixed(2)} p/m²`;
            } else {
                window.Router.showToast('Zone updated');
            }

            statusBox.classList.add(...colorCls);
            statusBox.innerHTML = `<strong>${zoneId} Update:</strong> ${msg}`;

            // --- Update Visual Heatmap ---
            if (window.activeHeatmap) {
                const mapRect = document.getElementById('heatmapContainer').getBoundingClientRect();

                // Map zone IDs to coordinates on our SVG grid (rough approximation based on SVG viewBox 100x100)
                const zoneCoords = {
                    'Z1': { x: 25, y: 20 },
                    'Z2': { x: 72.5, y: 25 },
                    'Z3': { x: 25, y: 65 },
                    'Z4': { x: 72.5, y: 70 },
                };

                const coords = zoneCoords[zoneId];
                if (coords) {
                    // Translate SVG % to actual px dimensions of the container
                    const px_X = (coords.x / 100) * mapRect.width;
                    const px_Y = (coords.y / 100) * mapRect.height;

                    // Heatmap requires a continuous total dataset for relative shading,
                    // For simplicity in this UI, we just append data points relative to density scale
                    // e.g., max density is 2.5

                    // Let's just track a local state for the map points
                    if (!window.heatmapDataPts) window.heatmapDataPts = [];

                    // Remove old point for this zone if exists
                    window.heatmapDataPts = window.heatmapDataPts.filter(p => p.zone !== zoneId);

                    // Map density 0-2.5 to a 'value' 0-100 for the heatmap scale
                    let hValue = (res.density / 2.5) * 100;
                    if (hValue > 100) hValue = 100;

                    window.heatmapDataPts.push({ x: px_X, y: px_Y, value: hValue, zone: zoneId });

                    window.activeHeatmap.setData({
                        max: 100, // global max for relative shading
                        data: window.heatmapDataPts
                    });
                }
            }

        } catch (err) {
            window.Router.hideLoader();
            window.Router.showToast(err.message || 'Error updating zone', 'error');
        }
    });
}

// Global CSS trick to handle fade animations locally
if (!document.getElementById('eventFadeStyle')) {
    const style = document.createElement('style');
    style.id = 'eventFadeStyle';
    style.innerHTML = `
        .fade-in {
            animation: fadeIn 0.3s ease-in;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `;
    document.head.appendChild(style);
}

window.renderEventsModule = renderEventsModule;
