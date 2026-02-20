function renderWasteModule() {
    document.getElementById('moduleContent').innerHTML = `
        <div class="space-y-6">
            <header class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Waste Logging</h2>
                    <p class="text-sm text-gray-500 mt-1">Track daily school waste across categories.</p>
                </div>
            </header>

            <div id="wasteEventNotice" class="hidden p-4 bg-warning/10 border-l-4 border-warning rounded text-gray-800 font-medium flex items-center gap-3">
                <svg class="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <span>Spike detected, but an Event "Sports Day" was logged today. Spike contextually explained.</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Data Entry Form -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-t-4 border-t-emerald-600">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Daily Waste Entry (kg)</h3>
                    <form id="wasteForm" class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Food Waste</label>
                                <input type="number" step="0.1" id="wasteFood" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Plastic Waste</label>
                                <input type="number" step="0.1" id="wastePlastic" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Paper Waste</label>
                                <input type="number" step="0.1" id="wastePaper" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">E-Waste</label>
                                <input type="number" step="0.1" id="wasteE" required class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-accent outline-none" value="0">
                            </div>
                        </div>
                        <button type="submit" class="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-md mt-4">
                            Log Daily Waste
                        </button>
                    </form>
                </div>

                <!-- Category Breakdown -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                    <h3 class="text-lg font-bold text-gray-800 mb-4 w-full text-left">Weekly Breakdown</h3>
                    <div class="relative h-48 w-full max-w-xs">
                        <canvas id="wasteChart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    const ctx = document.getElementById('wasteChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Food', 'Plastic', 'Paper', 'E-Waste'],
            datasets: [{
                data: [45, 20, 30, 5],
                backgroundColor: ['#10B981', '#F59E0B', '#3B82F6', '#6B7280'],
                borderWidth: 0
            }]
        },
        options: {
            plugins: {
                legend: { position: 'right' }
            },
            cutout: '70%'
        }
    });

    document.getElementById('wasteForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        window.Router.showLoader();

        try {
            const payload = {
                schoolId: 'school-1',
                foodWaste: parseFloat(document.getElementById('wasteFood').value),
                plasticWaste: parseFloat(document.getElementById('wastePlastic').value),
                paperWaste: parseFloat(document.getElementById('wastePaper').value),
                eWaste: parseFloat(document.getElementById('wasteE').value)
            };

            const res = await window.API.request('/waste', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            window.Router.hideLoader();

            if (res.isSpike) {
                if (res.isEventDay) {
                    document.getElementById('wasteEventNotice').classList.remove('hidden');
                } else {
                    window.Router.showToast('Unexplained Spike in Waste detected! Flagged.', 'warning');
                }
            } else {
                window.Router.showToast('Waste record saved', 'success');
            }

            // update chart live
            chart.data.datasets[0].data = [payload.foodWaste, payload.plasticWaste, payload.paperWaste, payload.eWaste];
            chart.update();

        } catch (err) {
            window.Router.hideLoader();
            window.Router.showToast(err.message || 'Error logging waste', 'error');
        }
    });
}

window.renderWasteModule = renderWasteModule;
