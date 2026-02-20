function renderEnergyModule() {
    document.getElementById('moduleContent').innerHTML = `
        <div class="space-y-6">
            <header class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Energy Monitor</h2>
                    <p class="text-sm text-gray-500 mt-1">Track electricity consumption across school blocks.</p>
                </div>
            </header>

            <div id="energyAlertBanner" class="hidden p-4 bg-danger/10 border-l-4 border-danger rounded text-danger font-medium flex items-center gap-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                <span>Anomaly Detected: Usage spike in <span id="anomalyBlockName">the block</span>. Investigating potential energy leak.</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Data Entry Form -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 border-t-4 border-t-accent">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Log Reading</h3>
                    <form id="energyForm" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Block</label>
                            <select id="energyBlock" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none">
                                <option value="Classrooms">Classrooms</option>
                                <option value="Labs">Science Labs</option>
                                <option value="Canteen">Canteen</option>
                                <option value="Hostel">Hostel</option>
                                <option value="SportsHall">Sports Hall</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input type="date" id="energyDate" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Meter Reading (kWh)</label>
                            <input type="number" step="0.1" id="energyKwh" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none" placeholder="e.g. 150.5">
                            <p class="text-xs text-gray-500 mt-1" id="prevReadingInfo">Yesterday: 142.0 kWh</p>
                        </div>
                        <button type="submit" class="w-full bg-primary hover:bg-[#122e22] text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-md">
                            Submit Reading
                        </button>
                    </form>
                </div>

                <!-- Chart Area -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-800">30-Day Trend</h3>
                        <select id="chartBlockFilter" class="text-sm bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none">
                            <option value="Classrooms">Classrooms</option>
                            <option value="Labs">Science Labs</option>
                            <option value="Canteen">Canteen</option>
                        </select>
                    </div>
                    <div class="relative h-64 w-full">
                        <canvas id="energyChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Insight / Gamification Card -->
            <div class="bg-gradient-to-r from-primary to-[#122e22] rounded-xl p-6 text-white shadow-lg flex items-center gap-6">
                <div class="p-4 bg-white/10 rounded-full">
                    <svg class="w-10 h-10 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                </div>
                <div>
                    <h4 class="text-xl font-bold mb-1">Energy Saving Potential</h4>
                    <p class="opacity-90">If the recent leak in the Labs is fixed, you'd save approximately <span class="font-bold text-accent">₹4,500</span> this semester.</p>
                </div>
            </div>
        </div>
    `;

    // Initialize Logic
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('energyDate').value = today;

    const ctx = document.getElementById('energyChart').getContext('2d');

    // Mock Data init
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
            datasets: [{
                label: 'Energy Usage (kWh)',
                data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 100),
                borderColor: '#52B788',
                backgroundColor: 'rgba(82, 183, 136, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: false, grid: { borderDash: [2, 4], color: '#f3f4f6' } },
                x: { grid: { display: false } }
            }
        }
    });

    // Form submission
    document.getElementById('energyForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        window.Router.showLoader();

        try {
            const payload = {
                schoolId: 'school-1',
                blockId: document.getElementById('energyBlock').value,
                date: document.getElementById('energyDate').value,
                kWh: parseFloat(document.getElementById('energyKwh').value)
            };

            const res = await window.API.request('/readings', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            window.Router.hideLoader();

            if (res.isAnomaly && !res.eventDay) {
                document.getElementById('energyAlertBanner').classList.remove('hidden');
                document.getElementById('anomalyBlockName').innerText = payload.blockId;
                window.Router.showToast('Anomaly detected! SNS Alert dispatched.', 'error');
            } else {
                document.getElementById('energyAlertBanner').classList.add('hidden');
                window.Router.showToast('Reading saved successfully', 'success');
            }

            // Update chart dynamically (mock logic for UX)
            chart.data.datasets[0].data.push(payload.kWh);
            chart.data.datasets[0].data.shift();
            chart.update();

        } catch (err) {
            window.Router.hideLoader();
            window.Router.showToast(err.message || 'Error saving reading', 'error');
        }
    });
}

window.renderEnergyModule = renderEnergyModule;
