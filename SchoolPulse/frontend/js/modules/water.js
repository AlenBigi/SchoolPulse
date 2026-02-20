function renderWaterModule() {
    document.getElementById('moduleContent').innerHTML = `
        <div class="space-y-6">
            <header class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Water Tracker</h2>
                    <p class="text-sm text-gray-500 mt-1">Monitor water consumption and detect potential pipe bursts.</p>
                </div>
            </header>

            <div id="waterAlertBanner" class="hidden p-4 bg-danger/10 border-l-4 border-danger rounded text-danger font-medium flex items-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span>Anomaly Detected in <span id="waterAnomalyBlock">Labs</span>. Possible burst pipe or tap left running!</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Data Entry Form -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 border-t-4 border-t-blue-500">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Log Reading</h3>
                    <form id="waterForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Block</label>
                            <select id="waterBlock" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                                <option value="Classrooms">Classrooms</option>
                                <option value="Labs">Science Labs</option>
                                <option value="Canteen">Canteen</option>
                                <option value="Hostel">Hostel</option>
                                <option value="SportsHall">Sports Hall</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" id="waterDate" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Meter Reading (Litres)</label>
                            <input type="number" step="1" id="waterLitres" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="e.g. 1500">
                        </div>
                        <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-md">
                            Submit Reading
                        </button>
                    </form>
                </div>

                <!-- Chart Area -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-800">Weekly Trend</h3>
                    </div>
                    <div class="relative h-64 w-full">
                        <canvas id="waterChart"></canvas>
                    </div>
                </div>
            </div>
            
        </div>
    `;

    // Initialize Logic
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('waterDate').value = today;

    const ctx = document.getElementById('waterChart').getContext('2d');

    // Mock Data init
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Water Usage (Litres)',
                data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 500) + 1000),
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { borderDash: [2, 4], color: '#f3f4f6' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Form submission
    document.getElementById('waterForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        window.Router.showLoader();

        try {
            const payload = {
                schoolId: 'school-1',
                blockId: document.getElementById('waterBlock').value,
                date: document.getElementById('waterDate').value,
                litres: parseInt(document.getElementById('waterLitres').value, 10)
            };

            const res = await window.API.request('/water', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            window.Router.hideLoader();

            if (res.isAnomaly && !res.eventDay) {
                document.getElementById('waterAlertBanner').classList.remove('hidden');
                document.getElementById('waterAnomalyBlock').innerText = payload.blockId;
                window.Router.showToast('Water Anomaly detected! Check for bursts.', 'error');
            } else {
                document.getElementById('waterAlertBanner').classList.add('hidden');
                window.Router.showToast('Reading saved successfully', 'success');
            }

        } catch (err) {
            window.Router.hideLoader();
            window.Router.showToast(err.message || 'Error saving reading', 'error');
        }
    });
}

window.renderWaterModule = renderWaterModule;
