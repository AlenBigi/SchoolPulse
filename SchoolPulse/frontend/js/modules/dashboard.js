function renderDashboard() {
    document.getElementById('moduleContent').innerHTML = `
        <div class="space-y-6">
            <header class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Unified Dashboard</h2>
                    <p class="text-sm text-gray-500 mt-1">Your school's real-time sustainability performance and insights.</p>
                </div>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- EcoScore Gauge -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 text-center flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                    <div class="absolute top-0 w-full h-1 bg-gradient-to-r from-accent to-primary"></div>
                    <h3 class="text-lg font-bold text-gray-800 mb-8">School EcoScore</h3>
                    
                    <div class="gauge-container mb-4 scale-110">
                        <div class="gauge-background"></div>
                        <div class="gauge-fill" id="ecoGaugeFill" style="transform: rotate(180deg);"></div>
                        <div class="gauge-center">
                            <div class="gauge-score" id="ecoScoreValue">--</div>
                            <div class="text-sm text-gray-500 font-bold mt-1" id="ecoGradeValue">Grade -</div>
                        </div>
                    </div>
                </div>

                <!-- Insights Feed -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 class="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <svg class="w-5 h-5 text-accent opacity-80" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"/></svg>
                        Smart Insights
                    </h3>
                    <div class="space-y-4" id="insightsFeed">
                        <!-- Skeletons -->
                        <div class="animate-pulse flex space-x-4">
                            <div class="flex-1 space-y-4 py-1">
                                <div class="h-16 bg-gray-100 rounded w-full"></div>
                                <div class="h-16 bg-gray-100 rounded w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Module Breakdown -->
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 class="text-lg font-bold text-gray-800 mb-6">Component Breakdown</h3>
                <div class="grid grid-cols-2 md:grid-cols-5 gap-4" id="breakdownGrid">
                    <!-- Skeletons -->
                    <div class="h-24 bg-gray-100 rounded"></div>
                    <div class="h-24 bg-gray-100 rounded"></div>
                    <div class="h-24 bg-gray-100 rounded"></div>
                    <div class="h-24 bg-gray-100 rounded"></div>
                    <div class="h-24 bg-gray-100 rounded"></div>
                </div>
            </div>
            
        </div>
    `;

    function updateDashboardUI(res) {
        // --- Update Gauge ---
        const score = res.ecoScore || 0;
        const rotation = 180 + (score / 100) * 180;

        setTimeout(() => {
            const gaugeFill = document.getElementById('ecoGaugeFill');
            if (gaugeFill) gaugeFill.style.transform = `rotate(${rotation}deg)`;

            let current = 0;
            const target = score;
            const scoreVal = document.getElementById('ecoScoreValue');
            const counter = setInterval(() => {
                if (!scoreVal) { clearInterval(counter); return; }
                if (current >= target) {
                    clearInterval(counter);
                    scoreVal.innerText = target;
                } else {
                    current += Math.ceil((target - current) / 4) || 1;
                    scoreVal.innerText = current;
                }
            }, 40);
        }, 100);

        const gradeEl = document.getElementById('ecoGradeValue');
        if (gradeEl) {
            gradeEl.innerText = `Grade ${res.grade || '-'}`;
            if (res.grade === 'A') gradeEl.className = "text-sm text-accent font-bold mt-1";
            else if (res.grade === 'B' || res.grade === 'C') gradeEl.className = "text-sm text-yellow-500 font-bold mt-1";
            else gradeEl.className = "text-sm text-danger font-bold mt-1";
        }

        // --- Update Insights ---
        const feed = document.getElementById('insightsFeed');
        if (feed) {
            feed.innerHTML = '';
            if (res.insights && res.insights.length > 0) {
                res.insights.forEach(insight => {
                    let borderCol = 'border-l-blue-500', bgCol = 'bg-blue-50', textCol = 'text-blue-800';
                    if (insight.type === 'warning') { borderCol = 'border-l-warning'; bgCol = 'bg-orange-50'; textCol = 'text-orange-800'; }
                    if (insight.type === 'success') { borderCol = 'border-l-accent'; bgCol = 'bg-green-50'; textCol = 'text-green-800'; }
                    if (insight.type === 'error') { borderCol = 'border-l-danger'; bgCol = 'bg-red-50'; textCol = 'text-red-800'; }

                    feed.innerHTML += `
                        <div class="p-4 border-l-4 ${borderCol} ${bgCol} rounded-r flex gap-3 text-sm">
                            <div class="flex-1">
                                <strong class="block mb-1 ${textCol}">${insight.title}</strong>
                                <span class="text-gray-700">${insight.message}</span>
                            </div>
                        </div>
                    `;
                });
            } else {
                feed.innerHTML = '<p class="text-sm text-gray-500 italic">No new insights right now.</p>';
            }
        }

        // --- Update Breakdown ---
        const grid = document.getElementById('breakdownGrid');
        if (grid) {
            const bk = res.breakdown || {};
            grid.innerHTML = `
                <div class="p-4 bg-gray-50 rounded text-center border border-gray-100">
                    <span class="block text-2xl font-bold text-gray-700 mb-1">${Math.round(bk.energyScore || 0)}</span>
                    <span class="text-xs uppercase tracking-wider text-gray-500 font-medium">Energy (30%)</span>
                </div>
                <div class="p-4 bg-gray-50 rounded text-center border border-gray-100">
                    <span class="block text-2xl font-bold text-gray-700 mb-1">${Math.round(bk.waterScore || 0)}</span>
                    <span class="text-xs uppercase tracking-wider text-gray-500 font-medium">Water (20%)</span>
                </div>
                <div class="p-4 bg-gray-50 rounded text-center border border-gray-100">
                    <span class="block text-2xl font-bold text-gray-700 mb-1">${Math.round(bk.wasteScore || 0)}</span>
                    <span class="text-xs uppercase tracking-wider text-gray-500 font-medium">Waste (20%)</span>
                </div>
                <div class="p-4 bg-gray-50 rounded text-center border border-gray-100">
                    <span class="block text-2xl font-bold text-gray-700 mb-1">${Math.round(bk.eventScore || 0)}</span>
                    <span class="text-xs uppercase tracking-wider text-gray-500 font-medium">Events (15%)</span>
                </div>
                <div class="p-4 bg-gray-50 rounded text-center border border-gray-100 ring-2 ring-accent ring-inset">
                    <span class="block text-2xl font-bold text-accent mb-1">${Math.round(bk.pledgeScore || 0)}</span>
                    <span class="text-xs uppercase tracking-wider text-gray-500 font-medium">Pledges (15%)</span>
                </div>
            `;
        }
    }

    async function loadDashboardData() {
        try {
            const res = await window.API.request('/dashboard');
            updateDashboardUI(res);
        } catch (err) {
            console.warn('API connection failed, rendering demo data.', err);

            // DEMO DATA FALLBACK
            const demoRes = {
                ecoScore: 82,
                grade: 'A',
                breakdown: { energyScore: 78, waterScore: 92, wasteScore: 85, eventScore: 100, pledgeScore: 85 },
                insights: [
                    { type: 'success', title: 'Start Logging', message: 'EcoScore is active. Log daily data to see real-time insights here.' },
                    { type: 'info', title: 'Demo Mode', message: 'Currently showing simulated data because the AWS backend is not reachable.' }
                ]
            };

            updateDashboardUI(demoRes);
            window.Router.showToast('Using Demo Mode (API Unreachable)', 'info');
        }
    }

    loadDashboardData();
}

window.renderDashboard = renderDashboard;
