function renderPledgesModule() {
    document.getElementById('moduleContent').innerHTML = `
        <div class="space-y-6">
            <header class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 class="text-2xl font-bold text-gray-800">Student Pledges</h2>
                    <p class="text-sm text-gray-500 mt-1">Make a daily sustainability pledge and track your impact streak.</p>
                </div>
            </header>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Data Entry Form -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 border-t-4 border-t-[#F59E0B]">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-bold text-gray-800">Today's Action</h3>
                        <div class="flex items-center gap-1 text-[#F59E0B] font-bold bg-orange-50 px-2 py-1 rounded-full text-sm">
                            <span id="streakCount">0</span> 
                            <svg class="w-4 h-4 animate-pulse relative -top-[1px]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/></svg>
                        </div>
                    </div>
                    <form id="pledgeForm" class="space-y-4">
                        <div>
                            <p class="block text-sm font-medium text-gray-700 mb-2">I pledge that today I have...</p>
                            <div class="space-y-2">
                                <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="radio" name="pledgeOption" value="cycle" required class="text-accent focus:ring-accent w-4 h-4">
                                    <span class="ml-3 text-sm font-medium text-gray-700">Cycled or walked to school</span>
                                </label>
                                <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="radio" name="pledgeOption" value="bottle" required class="text-accent focus:ring-accent w-4 h-4">
                                    <span class="ml-3 text-sm font-medium text-gray-700">Brought a reusable water bottle</span>
                                </label>
                                <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="radio" name="pledgeOption" value="meat" required class="text-accent focus:ring-accent w-4 h-4">
                                    <span class="ml-3 text-sm font-medium text-gray-700">Skipped meat for lunch</span>
                                </label>
                                <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="radio" name="pledgeOption" value="lights" required class="text-accent focus:ring-accent w-4 h-4">
                                    <span class="ml-3 text-sm font-medium text-gray-700">Switched off lights when leaving room</span>
                                </label>
                                <label class="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input type="radio" name="pledgeOption" value="plastic" required class="text-accent focus:ring-accent w-4 h-4">
                                    <span class="ml-3 text-sm font-medium text-gray-700">Refused single-use plastic</span>
                                </label>
                            </div>
                        </div>

                        <button type="submit" class="w-full bg-[#F59E0B] hover:bg-orange-600 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-md mt-4">
                            Log Pledge
                        </button>
                    </form>
                </div>

                <!-- Leaderboard & Impact -->
                <div class="lg:col-span-2 space-y-6">
                    <div class="bg-gradient-to-r from-accent to-[#1B4332] p-6 rounded-xl shadow-sm text-white flex justify-between items-center relative overflow-hidden">
                        <div class="relative z-10 w-full pl-2">
                            <h3 class="text-lg font-bold mb-1 opacity-90">School Collective Impact</h3>
                            <p class="text-3xl font-black mb-2 tracking-tight">3,450 <span class="text-lg font-medium opacity-80">kg CO₂e Avoided</span></p>
                            <p class="text-sm opacity-80">Together, we've saved the equivalent of planting 150 trees this term!</p>
                        </div>
                        <svg class="absolute right-0 top-0 h-full w-48 text-white opacity-10 transform translate-x-10 scale-150" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
                    </div>

                    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 class="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            Class Leaderboard
                        </h3>
                        <div class="space-y-3" id="leaderboardList">
                            <!-- Loader -->
                            <div class="animate-pulse flex space-x-4">
                                <div class="flex-1 space-y-4 py-1">
                                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Fetch Leaderboard logic
    async function loadLeaderboard() {
        const list = document.getElementById('leaderboardList');
        try {
            const res = await window.API.request('/pledges/leaderboard', { method: 'GET' });

            list.innerHTML = '';

            if (!res.leaderboard || res.leaderboard.length === 0) {
                list.innerHTML = '<p class="text-sm text-gray-500 text-center py-4">No pledges logged yet. Be the first!</p>';
                return;
            }

            res.leaderboard.forEach((entry, idx) => {
                const rankColors = ['bg-yellow-100 text-yellow-700 font-bold', 'bg-gray-100 text-gray-700 font-semibold', 'bg-orange-100 text-orange-700 font-semibold'];
                const rankClass = idx < 3 ? rankColors[idx] : 'bg-gray-50 text-gray-600';

                list.innerHTML += `
                    <div class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                        <div class="flex items-center gap-4">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm ${rankClass}">
                                #${idx + 1}
                            </div>
                            <span class="font-medium text-gray-800">Class ${entry.class}</span>
                        </div>
                        <span class="font-bold text-accent">${entry.score} pts</span>
                    </div>
                `;
            });
        } catch (err) {
            list.innerHTML = `<p class="text-sm text-danger">Failed to load leaderboard: ${err.message}</p>`;
        }
    }

    // Load immediately
    loadLeaderboard();

    // Form logic
    document.getElementById('pledgeForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        window.Router.showLoader();

        const selected = document.querySelector('input[name="pledgeOption"]:checked').value;
        const studentInfo = {
            id: window.Auth.getEmail() || 'unknown-student',
            class: '10-A'
        };

        try {
            const payload = {
                studentId: studentInfo.id,
                studentClass: studentInfo.class,
                pledgeType: selected,
                date: new Date().toISOString()
            };

            const res = await window.API.request('/pledges', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            window.Router.hideLoader();
            window.Router.showToast(`Pledge saved! Streak: ${res.streak} days 🔥`, 'success');

            // Update UI streak
            document.getElementById('streakCount').innerText = res.streak;

            // Reload leaderboard
            loadLeaderboard();

            // Reset form
            document.getElementById('pledgeForm').reset();

        } catch (err) {
            window.Router.hideLoader();
            window.Router.showToast(err.message || 'Error logging pledge', 'error');
        }
    });

}

window.renderPledgesModule = renderPledgesModule;
