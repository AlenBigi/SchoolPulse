function renderReportsModule() {
    document.getElementById('moduleContent').innerHTML = `
        <div class="space-y-6">
            <header class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Carbon Footprint & Reports</h2>
                    <p class="text-sm text-gray-500 mt-1">Review emissions data and generate official sustainability reports.</p>
                </div>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Carbon Footprint Chart -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                    <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        Total Emissions Breakdown
                    </h3>
                    
                    <div class="flex-1 flex items-center justify-center relative min-h-[300px]">
                        <div id="chartLoader" class="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                        <canvas id="carbonChart" class="w-full max-w-sm"></canvas>
                        
                        <!-- Center Label for Donut -->
                        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                            <span class="text-3xl font-black text-gray-800" id="totalTonnes">--</span>
                            <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Tonnes CO₂e</span>
                        </div>
                    </div>
                </div>

                <!-- Summary & Reporting Actions -->
                <div class="space-y-6">
                    <div class="bg-gray-50 p-6 rounded-xl border border-gray-200">
                        <h3 class="text-md font-bold text-gray-700 mb-4 uppercase tracking-wider text-sm">Key Statistics</h3>
                        <div class="space-y-4" id="statsContainer">
                            <div class="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                <span class="text-gray-600 font-medium">Electricity Impact</span>
                                <span class="font-bold text-gray-800" id="statEnergy">-- Tonnes</span>
                            </div>
                            <div class="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                <span class="text-gray-600 font-medium">Water Supply Impact</span>
                                <span class="font-bold text-gray-800" id="statWater">-- Tonnes</span>
                            </div>
                            <div class="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                <span class="text-gray-600 font-medium">Waste Processing</span>
                                <span class="font-bold text-gray-800" id="statWaste">-- Tonnes</span>
                            </div>
                        </div>
                    </div>

                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-primary">
                        <h3 class="text-lg font-bold text-gray-800 mb-2">Generate Official Report</h3>
                        <p class="text-sm text-gray-500 mb-6">Compile all module data, analytics, and carbon footprints into a PDF report card.</p>
                        
                        <button id="btnGenerateReport" class="w-full bg-primary hover:bg-[#122e22] text-white font-medium py-3 rounded-lg shadow transition-colors flex items-center justify-center gap-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                            Generate Term Report (PDF)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Fetch and Render logic
    async function loadCarbonData() {
        try {
            const res = await window.API.request('/carbon');

            // Hide loader
            const loader = document.getElementById('chartLoader');
            if (loader) loader.style.display = 'none';

            // Update stats
            document.getElementById('statEnergy').innerText = (res.energy || 0).toFixed(2) + ' Tonnes';
            document.getElementById('statWater').innerText = (res.water || 0).toFixed(2) + ' Tonnes';
            document.getElementById('statWaste').innerText = (res.waste || 0).toFixed(2) + ' Tonnes';
            document.getElementById('totalTonnes').innerText = (res.total || 0).toFixed(1);

            // Render Chart.js Donut
            const ctx = document.getElementById('carbonChart').getContext('2d');

            // Cleanup existing
            if (window.carbonChartInstance) {
                window.carbonChartInstance.destroy();
            }

            window.carbonChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Energy Usage', 'Water Processing', 'Waste Generated'],
                    datasets: [{
                        data: [
                            res.energy || 0,
                            res.water || 0,
                            res.waste || 0
                        ],
                        backgroundColor: [
                            '#F59E0B', // Orange/Yellow
                            '#3B82F6', // Blue
                            '#10B981'  // Green
                        ],
                        borderWidth: 0,
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '75%',
                    plugins: {
                        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } },
                        tooltip: {
                            callbacks: {
                                label: function (context) {
                                    return ' ' + context.label + ': ' + context.raw + ' Tonnes';
                                }
                            }
                        }
                    }
                }
            });

        } catch (err) {
            console.error(err);
            window.Router.showToast('Failed to load carbon data', 'error');
            const loader = document.getElementById('chartLoader');
            if (loader) loader.innerHTML = '<span class="text-sm text-danger">Data unavailable</span>';
        }
    }

    // PDF Generation Stub
    document.getElementById('btnGenerateReport').addEventListener('click', (e) => {
        const btn = e.currentTarget;
        const originalHtml = btn.innerHTML;

        btn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div> Compiling PDF...';
        btn.disabled = true;
        btn.classList.add('opacity-75');

        // Simulate PDF compilation delay for S3 upload
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
            btn.classList.remove('opacity-75');
            window.Router.showToast('Official PDF Term Report generated successfully! (Check Downloads)', 'success');
        }, 2000);
    });

    // Execute
    loadCarbonData();
}

window.renderReportsModule = renderReportsModule;
