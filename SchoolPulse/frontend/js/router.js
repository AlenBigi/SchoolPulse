const Router = {
    routes: {
        'dashboard': { title: 'Unified Dashboard', render: () => renderDashboard() },
        'energy': { title: 'Energy Monitor', render: () => renderEnergyModule() },
        'water': { title: 'Water Tracker', render: () => renderWaterModule() },
        'events': { title: 'Event Sustainability', render: () => renderEventsModule() },
        'waste': { title: 'Waste Logging', render: () => renderWasteModule() },
        'pledges': { title: 'Student Pledges', render: () => renderPledgesModule() },
        'reports': { title: 'Report Card', render: () => renderReportsModule() },
    },

    navConfig: [
        { id: 'dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', roles: ['Admin', 'FacilityManager', 'EventOrganizer', 'WasteStaff', 'Student'] },
        { id: 'energy', label: 'Energy Monitor', icon: 'M13 10V3L4 14h7v7l9-11h-7z', roles: ['Admin', 'FacilityManager'] },
        { id: 'water', label: 'Water Tracker', icon: 'M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z', roles: ['Admin', 'FacilityManager'] },
        { id: 'events', label: 'Event Manager', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', roles: ['Admin', 'EventOrganizer'] },
        { id: 'waste', label: 'Waste Logs', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', roles: ['Admin', 'WasteStaff'] },
        { id: 'pledges', label: 'Student Pledges', icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7', roles: ['Admin', 'Student'] },
        { id: 'reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', roles: ['Admin'] }
    ],

    initNav(userRole) {
        const navContainer = document.getElementById('navLinks');
        navContainer.innerHTML = '';

        this.navConfig.forEach(item => {
            if (item.roles.includes(userRole)) {
                const a = document.createElement('a');
                a.href = `#${item.id}`;
                a.dataset.route = item.id;
                a.className = 'nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-[#122e22] hover:text-white transition-colors cursor-pointer';
                a.innerHTML = `
                    <svg class="w-5 h-5 text-accent opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"/>
                    </svg>
                    ${item.label}
                `;
                a.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.navigate(item.id);
                });
                navContainer.appendChild(a);
            }
        });
    },

    navigate(routeId) {
        if (!this.routes[routeId]) routeId = 'dashboard';

        // Update URL hash
        window.history.pushState({}, '', `#${routeId}`);

        // Update Title
        document.getElementById('pageTitle').innerText = this.routes[routeId].title;

        // Update Active Nav State
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('bg-[#122e22]', 'text-white'));
        const activeNav = document.querySelector(`.nav-item[data-route="${routeId}"]`);
        if (activeNav) activeNav.classList.add('bg-[#122e22]', 'text-white');

        // Close mobile menu if open
        document.getElementById('sidebar').classList.add('-translate-x-full');

        // Clear content and add entrance animation
        const contentArea = document.getElementById('moduleContent');
        contentArea.style.opacity = '0';

        setTimeout(() => {
            contentArea.innerHTML = '';
            this.routes[routeId].render();
            contentArea.style.opacity = '1';
        }, 150);
    },

    showLoader() { document.getElementById('loader').classList.remove('hidden'); },
    hideLoader() { document.getElementById('loader').classList.add('hidden'); },

    showToast(message, type = 'success') {
        const tCont = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        const colorClass = type === 'error' ? 'bg-danger' : (type === 'warning' ? 'bg-warning' : 'bg-accent');

        toast.className = `${colorClass} text-white px-4 py-3 rounded shadow-lg transform translate-x-full transition-transform duration-300 flex items-center gap-2`;
        toast.innerHTML = `<span class="text-sm font-medium">${message}</span>`;
        tCont.appendChild(toast);

        // Entrance
        setTimeout(() => toast.classList.remove('translate-x-full'), 10);

        // Exit
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

window.Router = Router;

// Handle manual URL hash changes
window.addEventListener('hashchange', () => {
    const route = window.location.hash.replace('#', '') || 'dashboard';
    Router.navigate(route);
});

// Mock render functions for now
function renderDashboard() {
    document.getElementById('moduleContent').innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 text-center items-center justify-center flex flex-col">
                <h3 class="text-lg font-bold text-gray-800 mb-6">School EcoScore</h3>
                <div class="gauge-container mb-4">
                    <div class="gauge-background"></div>
                    <div class="gauge-fill" style="transform: rotate(${180 + (85 / 100) * 180}deg);"></div>
                    <div class="gauge-center">
                        <div class="gauge-score">85</div>
                        <div class="text-xs text-accent font-bold mt-1">Grade A</div>
                    </div>
                </div>
                <p class="text-sm text-gray-500">Top 15% nationally</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                <h2>Dashboard</h2>
                <p class="text-gray-500 mt-2">Welcome to your unified dashboard!</p>
            </div>
        </div>
    `;
}
function renderEnergyModule() { document.getElementById('moduleContent').innerHTML = '<div class="bg-white p-6 rounded-xl shadow-sm"><h2>Energy Monitor</h2><p class="text-gray-500 mt-2">Loading module...</p></div>'; }
function renderWaterModule() { document.getElementById('moduleContent').innerHTML = '<div class="bg-white p-6 rounded-xl shadow-sm"><h2>Water Tracker</h2><p class="text-gray-500 mt-2">Loading module...</p></div>'; }
function renderEventsModule() { document.getElementById('moduleContent').innerHTML = '<div class="bg-white p-6 rounded-xl shadow-sm"><h2>Event Manager</h2><p class="text-gray-500 mt-2">Loading module...</p></div>'; }
function renderWasteModule() { document.getElementById('moduleContent').innerHTML = '<div class="bg-white p-6 rounded-xl shadow-sm"><h2>Waste Logs</h2><p class="text-gray-500 mt-2">Loading module...</p></div>'; }
function renderPledgesModule() { document.getElementById('moduleContent').innerHTML = '<div class="bg-white p-6 rounded-xl shadow-sm"><h2>Student Pledges</h2><p class="text-gray-500 mt-2">Loading module...</p></div>'; }
