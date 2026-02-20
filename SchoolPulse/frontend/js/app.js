const CONSTANTS = {
    // These will be populated by AWS Amplify or manual configuration
    USER_POOL_ID: 'ap-south-1_nf7JczLOT',
    CLIENT_ID: '44anhq1or0ak5o2pcjtik6jv0i',
    API_URL: 'https://f0sq3fu4gg.execute-api.ap-south-1.amazonaws.com',
    COGNITO_DOMAIN: 'https://ap-south-1nf7jczlot.auth.ap-south-1.amazoncognito.com/' // Update this if incorrect
};

const Auth = {
    async login(email, password) {
        // Hardcoded Demo Bypass
        if (email === 'admin@school.edu' && password === 'password123') {
            localStorage.setItem('sp_token', 'demo-token-12345');
            localStorage.setItem('sp_role', 'Admin');
            localStorage.setItem('sp_email', email);
            return Promise.resolve({ role: 'Admin', email });
        }

        return new Promise((resolve, reject) => {
            const poolData = {
                UserPoolId: CONSTANTS.USER_POOL_ID,
                ClientId: CONSTANTS.CLIENT_ID
            };
            const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
            const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
                Username: email,
                Password: password,
            });

            const cognitoUser = new AmazonCognitoIdentity.CognitoUser({
                Username: email,
                Pool: userPool
            });

            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: function (result) {
                    const accessToken = result.getAccessToken().getJwtToken();
                    const payload = result.getIdToken().decodePayload();
                    const groups = payload['cognito:groups'] || ['Student'];
                    const role = groups[0];

                    localStorage.setItem('sp_token', accessToken);
                    localStorage.setItem('sp_role', role);

                    resolve({ role, email });
                },
                onFailure: function (err) {
                    console.error(err);
                    reject(err);
                },
            });
        });
    },

    logout() {
        localStorage.removeItem('sp_token');
        localStorage.removeItem('sp_role');
        localStorage.removeItem('sp_email');
        window.location.href = 'login.html';
    },

    isAuthenticated() {
        return !!localStorage.getItem('sp_token');
    },

    getRole() {
        return localStorage.getItem('sp_role');
    },

    getEmail() {
        return localStorage.getItem('sp_email');
    },

    getToken() {
        return localStorage.getItem('sp_token');
    }
};

const API = {
    async request(endpoint, options = {}) {
        // Intercept for Demo User
        if (Auth.getEmail() === 'admin@school.edu') {
            return this.simulate(endpoint, options);
        }

        const token = Auth.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        try {
            const url = endpoint.startsWith('http') ? endpoint : `${CONSTANTS.API_URL}${endpoint}`;
            const response = await fetch(url, { ...options, headers });

            if (!response.ok) {
                if (response.status === 401) {
                    Auth.logout();
                }
                throw new Error(`API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },

    async simulate(endpoint, options) {
        console.log(`[DEMO] Simulating ${options.method || 'GET'} request to ${endpoint}`);

        // Artificial delay for realism
        await new Promise(r => setTimeout(r, 600));

        // Logic for different endpoints
        if (endpoint.includes('/dashboard')) {
            return {
                ecoScore: 85,
                grade: 'A',
                breakdown: { energyScore: 82, waterScore: 90, wasteScore: 78, eventScore: 95, pledgeScore: 88 },
                insights: [
                    { type: 'success', title: 'Great Progress', message: 'EcoScore increased by 3% this week.' },
                    { type: 'info', title: 'Demo Active', message: 'You are viewing simulated data for the demonstration.' }
                ]
            };
        }

        if (endpoint.includes('/readings') || endpoint.includes('/waste') || endpoint.includes('/water') || endpoint.includes('/events') || endpoint.includes('/pledges')) {
            return { success: true, message: 'Data saved successfully (Simulated)', isSpike: false, isAnomaly: false };
        }

        return { success: true, message: 'Simulated response' };
    }
};

// Expose globally
window.Auth = Auth;
window.API = API;
