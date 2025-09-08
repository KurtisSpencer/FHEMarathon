// Anonymous Marathon System - Frontend JavaScript

// Contract configuration - Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xB1839A160F922CD7EdB591458fF2089A8EDF6dF1"; // Replace after deployment
const CONTRACT_ABI = [
    "function createMarathon(string calldata _name, uint256 _eventDate, uint256 _registrationDeadline, uint32 _maxParticipants) external",
    "function registerForMarathon(uint256 marathonId, uint32 _age, uint8 _experienceLevel, uint16 _previousBestTime, bytes32 _anonymousId) external payable",
    "function recordFinishTime(uint256 marathonId, address runner, uint32 finishTimeMinutes) external",
    "function completeMarathon(uint256 marathonId) external",
    "function getMarathonInfo(uint256 marathonId) external view returns (string memory name, uint256 eventDate, uint256 registrationDeadline, uint32 maxParticipants, uint32 currentRegistrations, bool isActive, bool isCompleted, uint256 prizePool)",
    "function getRunnerStatus(uint256 marathonId, address runner) external view returns (bool hasRegistered, bool hasFinished, bytes32 anonymousId, uint256 registrationTime)",
    "function getLeaderboard(uint256 marathonId) external view returns (bytes32[] memory anonymousIds, uint32[] memory finishTimes, bool[] memory isRevealed)",
    "function currentMarathonId() external view returns (uint256)",
    "function registrationFee() external view returns (uint256)",
    "function organizer() external view returns (address)",
    "function updateRegistrationFee(uint256 newFee) external",
    "function cancelMarathon(uint256 marathonId) external"
];

class AnonymousMarathonApp {
    constructor() {
        this.web3Provider = null;
        this.contract = null;
        this.userAccount = null;
        this.marathons = new Map();
        this.isOrganizer = false;

        this.init();
    }

    async init() {
        // Don't auto-connect, wait for user action
        this.initEventListeners();
        this.updateUI();
        this.checkWeb3Available();
    }

    checkWeb3Available() {
        // Wait for ethers to be loaded
        if (typeof ethers === 'undefined') {
            console.log('Waiting for ethers.js to load...');
            setTimeout(() => this.checkWeb3Available(), 500);
            return;
        }

        if (typeof window.ethereum === 'undefined') {
            this.updateConnectionStatus(false);
            console.warn('MetaMask not detected');
        } else {
            console.log('MetaMask detected, ready to connect');
            this.updateConnectionStatus(false);
        }
    }

    async connectWallet() {
        console.log('Connect Wallet button clicked');

        if (typeof ethers === 'undefined') {
            console.error('Ethers library not loaded');
            alert('Please wait, loading libraries...');
            return;
        }

        if (typeof window.ethereum === 'undefined') {
            console.error('MetaMask not found');
            alert('Please install MetaMask or another Web3 wallet to use this application.');
            return;
        }

        console.log('Starting wallet connection...');

        try {
            console.log('Creating Web3Provider...');
            this.web3Provider = new ethers.providers.Web3Provider(window.ethereum);

            console.log('Requesting accounts...');
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Accounts received:', accounts);

            const signer = this.web3Provider.getSigner();
            this.userAccount = await signer.getAddress();
            console.log('User account:', this.userAccount);

            console.log('Creating contract instance with address:', CONTRACT_ADDRESS);
            this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

            // Check if user is the organizer
            try {
                console.log('Checking organizer status...');
                const organizer = await this.contract.organizer();
                this.isOrganizer = this.userAccount.toLowerCase() === organizer.toLowerCase();
                console.log('Organizer:', organizer, 'Is user organizer:', this.isOrganizer);
            } catch (error) {
                console.warn("Could not check organizer status:", error);
                // Contract might not be deployed, that's ok
                this.isOrganizer = false;
            }

            this.updateConnectionStatus(true);
            console.log("Successfully connected to wallet:", this.userAccount);

            // Load marathons after connecting
            try {
                await this.loadMarathons();
            } catch (error) {
                console.warn('Error loading marathons:', error);
            }

            // Hide connect button, show wallet info
            document.getElementById('connectWalletBtn').style.display = 'none';
            document.getElementById('walletInfo').style.display = 'block';
            document.getElementById('walletAddress').textContent = this.userAccount;

            // Get network info
            try {
                const network = await this.web3Provider.getNetwork();
                const networkName = network.name === 'unknown' ? `Chain ID: ${network.chainId}` : network.name;
                document.getElementById('networkName').textContent = networkName;
                console.log('Connected to network:', networkName, 'Chain ID:', network.chainId);
            } catch (error) {
                console.warn('Error getting network info:', error);
                document.getElementById('networkName').textContent = 'Unknown Network';
            }

        } catch (error) {
            console.error("Failed to connect to wallet:", error);
            console.error("Error details:", error.code, error.message);
            this.updateConnectionStatus(false);

            if (error.code === 4001 || error.code === 'ACTION_REJECTED') {
                alert('Connection request rejected. Please approve the connection request in MetaMask.');
            } else if (error.code === -32002) {
                alert('Connection request already pending. Please check MetaMask.');
            } else {
                alert('Failed to connect to wallet: ' + (error.message || 'Unknown error'));
            }
        }
    }

    updateConnectionStatus(connected) {
        const statusElement = document.getElementById('connectionStatus');
        if (connected && this.userAccount) {
            statusElement.textContent = `Wallet: ${this.userAccount.substring(0, 6)}...${this.userAccount.substring(38)}`;
            statusElement.className = 'connection-status connected';
        } else {
            statusElement.textContent = 'Wallet: Disconnected';
            statusElement.className = 'connection-status disconnected';
        }
    }

    initEventListeners() {
        // Connect Wallet Button
        document.getElementById('connectWalletBtn').addEventListener('click', () => {
            this.connectWallet();
        });

        // Create Marathon Form
        document.getElementById('createMarathonForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createMarathon();
        });

        // Registration Form
        document.getElementById('registrationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.registerForMarathon();
        });

        // Leaderboard Selection
        document.getElementById('leaderboardSelect').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadLeaderboard(parseInt(e.target.value));
            }
        });

        // Auto-generate anonymous ID
        document.getElementById('anonymousId').addEventListener('focus', (e) => {
            if (!e.target.value) {
                e.target.value = this.generateAnonymousId();
            }
        });
    }

    generateAnonymousId() {
        const adjectives = ['Swift', 'Lightning', 'Thunder', 'Wind', 'Storm', 'Blaze', 'Steel', 'Shadow', 'Phoenix', 'Titan'];
        const nouns = ['Runner', 'Racer', 'Sprinter', 'Dash', 'Flash', 'Bolt', 'Arrow', 'Comet', 'Meteor', 'Streak'];
        const numbers = Math.floor(Math.random() * 10000);

        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const noun = nouns[Math.floor(Math.random() * nouns.length)];

        return `${adjective}_${noun}_${numbers}`;
    }

    async createMarathon() {
        if (!this.contract || !this.userAccount) {
            this.showStatus('createMarathonStatus', 'error', 'Please connect your wallet first.');
            return;
        }

        // Allow any connected user to create marathons
        console.log('Creating marathon as:', this.userAccount);

        const name = document.getElementById('marathonName').value;
        const eventDate = new Date(document.getElementById('eventDate').value).getTime() / 1000;
        const registrationDeadline = new Date(document.getElementById('registrationDeadline').value).getTime() / 1000;
        const maxParticipants = parseInt(document.getElementById('maxParticipants').value);

        // Validation
        if (eventDate <= Date.now() / 1000) {
            this.showStatus('createMarathonStatus', 'error', 'Event date must be in the future.');
            return;
        }

        if (registrationDeadline >= eventDate) {
            this.showStatus('createMarathonStatus', 'error', 'Registration deadline must be before event date.');
            return;
        }

        try {
            this.showStatus('createMarathonStatus', 'info', 'Creating marathon...');
            document.getElementById('createMarathonBtn').disabled = true;

            const tx = await this.contract.createMarathon(
                name,
                Math.floor(eventDate),
                Math.floor(registrationDeadline),
                maxParticipants
            );

            this.showStatus('createMarathonStatus', 'info', 'Transaction submitted. Waiting for confirmation...');
            await tx.wait();

            this.showStatus('createMarathonStatus', 'success', 'Marathon created successfully!');
            document.getElementById('createMarathonForm').reset();
            await this.loadMarathons();

        } catch (error) {
            console.error('Error creating marathon:', error);
            let errorMessage = 'Failed to create marathon';
            if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction was rejected by user';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for transaction';
            } else if (error.reason) {
                errorMessage = error.reason;
            }
            this.showStatus('createMarathonStatus', 'error', errorMessage);
        } finally {
            document.getElementById('createMarathonBtn').disabled = false;
        }
    }

    async registerForMarathon() {
        if (!this.contract || !this.userAccount) {
            this.showStatus('registrationStatus', 'error', 'Please connect your wallet first.');
            return;
        }

        const marathonId = parseInt(document.getElementById('marathonSelect').value);
        const age = parseInt(document.getElementById('runnerAge').value);
        const experienceLevel = parseInt(document.getElementById('experienceLevel').value);
        const previousTime = parseInt(document.getElementById('previousTime').value);
        const anonymousId = document.getElementById('anonymousId').value;

        // Validation
        if (!marathonId || !age || !experienceLevel || !anonymousId) {
            this.showStatus('registrationStatus', 'error', 'Please fill in all required fields.');
            return;
        }

        // Convert anonymous ID to bytes32
        const anonymousIdBytes32 = ethers.utils.formatBytes32String(anonymousId.substring(0, 31));

        try {
            this.showStatus('registrationStatus', 'info', 'Getting registration fee...');

            // Get registration fee
            const registrationFee = await this.contract.registrationFee();

            this.showStatus('registrationStatus', 'info', 'Registering for marathon...');
            document.getElementById('registerBtn').disabled = true;

            const tx = await this.contract.registerForMarathon(
                marathonId,
                age,
                experienceLevel,
                previousTime,
                anonymousIdBytes32,
                { value: registrationFee }
            );

            this.showStatus('registrationStatus', 'info', 'Transaction submitted. Waiting for confirmation...');
            await tx.wait();

            this.showStatus('registrationStatus', 'success', 'Successfully registered for marathon! Your data is encrypted and secure.');
            document.getElementById('registrationForm').reset();
            await this.loadMarathons();

        } catch (error) {
            console.error('Error registering for marathon:', error);
            let errorMessage = 'Registration failed';
            if (error.message.includes('user rejected')) {
                errorMessage = 'Transaction was rejected by user';
            } else if (error.message.includes('insufficient funds')) {
                errorMessage = 'Insufficient funds for registration fee';
            } else if (error.reason) {
                errorMessage = error.reason;
            }
            this.showStatus('registrationStatus', 'error', errorMessage);
        } finally {
            document.getElementById('registerBtn').disabled = false;
        }
    }

    async loadMarathons() {
        const marathonList = document.getElementById('marathonList');
        const marathonSelect = document.getElementById('marathonSelect');
        const leaderboardSelect = document.getElementById('leaderboardSelect');

        if (!this.contract || !this.userAccount) {
            marathonList.innerHTML = '<div class="status info">Please connect your wallet to view marathons.</div>';
            marathonSelect.innerHTML = '<option value="">Connect wallet first...</option>';
            leaderboardSelect.innerHTML = '<option value="">Connect wallet first...</option>';
            return;
        }

        try {
            console.log('Loading marathons from contract...');
            const currentMarathonId = await this.contract.currentMarathonId();
            console.log('Current marathon ID:', currentMarathonId.toString());

            // Clear existing options
            marathonSelect.innerHTML = '<option value="">Choose a marathon...</option>';
            leaderboardSelect.innerHTML = '<option value="">Choose a marathon...</option>';
            marathonList.innerHTML = '';

            if (currentMarathonId.eq(0)) {
                marathonList.innerHTML = '<div class="status info">No marathons created yet. Create one above!</div>';
                console.log('No marathons found');
                return;
            }

            console.log('Found', currentMarathonId.toString(), 'marathon(s)');

            // Load each marathon
            for (let i = 1; i <= currentMarathonId.toNumber(); i++) {
                try {
                    const marathonInfo = await this.contract.getMarathonInfo(i);
                    const marathon = {
                        id: i,
                        name: marathonInfo.name,
                        eventDate: new Date(marathonInfo.eventDate.toNumber() * 1000),
                        registrationDeadline: new Date(marathonInfo.registrationDeadline.toNumber() * 1000),
                        maxParticipants: marathonInfo.maxParticipants.toNumber(),
                        currentRegistrations: marathonInfo.currentRegistrations.toNumber(),
                        isActive: marathonInfo.isActive,
                        isCompleted: marathonInfo.isCompleted,
                        prizePool: ethers.utils.formatEther(marathonInfo.prizePool)
                    };

                    this.marathons.set(i, marathon);

                    // Add to selects
                    if (marathon.isActive && new Date() < marathon.registrationDeadline) {
                        marathonSelect.innerHTML += `<option value="${i}">${marathon.name} (${marathon.currentRegistrations}/${marathon.maxParticipants} registered)</option>`;
                    }

                    leaderboardSelect.innerHTML += `<option value="${i}">${marathon.name}</option>`;

                    // Add to marathon list
                    marathonList.innerHTML += this.createMarathonCard(marathon);

                } catch (error) {
                    console.error(`Error loading marathon ${i}:`, error);
                }
            }

        } catch (error) {
            console.error('Error loading marathons:', error);
            document.getElementById('marathonList').innerHTML = '<div class="status error">Failed to load marathons.</div>';
        }
    }

    createMarathonCard(marathon) {
        const now = new Date();
        let status = '';
        let statusClass = '';

        if (marathon.isCompleted) {
            status = 'Completed';
            statusClass = 'success';
        } else if (now > marathon.registrationDeadline) {
            status = 'Registration Closed';
            statusClass = 'error';
        } else if (marathon.currentRegistrations >= marathon.maxParticipants) {
            status = 'Full';
            statusClass = 'error';
        } else {
            status = 'Open for Registration';
            statusClass = 'info';
        }

        return `
            <div class="marathon-item">
                <div class="marathon-title">${marathon.name}</div>
                <div class="marathon-details">
                    <div><strong>Event Date:</strong> ${marathon.eventDate.toLocaleDateString()}</div>
                    <div><strong>Registration Until:</strong> ${marathon.registrationDeadline.toLocaleDateString()}</div>
                    <div><strong>Participants:</strong> ${marathon.currentRegistrations}/${marathon.maxParticipants}</div>
                    <div><strong>Prize Pool:</strong> ${marathon.prizePool} ETH</div>
                </div>
                <div class="status ${statusClass}" style="margin-top: 10px;">${status}</div>
            </div>
        `;
    }

    async loadLeaderboard(marathonId) {
        if (!this.contract || !marathonId) return;

        try {
            const marathon = this.marathons.get(marathonId);
            const leaderboardData = await this.contract.getLeaderboard(marathonId);
            const container = document.getElementById('leaderboardContainer');

            if (leaderboardData.anonymousIds.length === 0) {
                container.innerHTML = '<div class="status info">No participants yet.</div>';
                return;
            }

            let tableHTML = `
                <h3>${marathon.name} - Leaderboard</h3>
                <table class="leaderboard-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>Anonymous ID</th>
                            <th>Finish Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            for (let i = 0; i < leaderboardData.anonymousIds.length; i++) {
                const anonymousId = ethers.utils.parseBytes32String(leaderboardData.anonymousIds[i]);
                const finishTime = leaderboardData.finishTimes[i].toNumber();
                const isRevealed = leaderboardData.isRevealed[i];

                const timeDisplay = isRevealed && finishTime > 0
                    ? `${Math.floor(finishTime / 60)}h ${finishTime % 60}m`
                    : 'Encrypted';

                const statusDisplay = isRevealed ? 'Finished' : 'In Progress';

                tableHTML += `
                    <tr>
                        <td>${i + 1}</td>
                        <td><span class="anonymous-id">${anonymousId || 'Unknown'}</span></td>
                        <td>${timeDisplay}</td>
                        <td>${statusDisplay}</td>
                    </tr>
                `;
            }

            tableHTML += `
                    </tbody>
                </table>
            `;

            container.innerHTML = tableHTML;

        } catch (error) {
            console.error('Error loading leaderboard:', error);
            document.getElementById('leaderboardContainer').innerHTML = '<div class="status error">Failed to load leaderboard.</div>';
        }
    }

    showStatus(elementId, type, message) {
        const element = document.getElementById(elementId);
        element.className = `status ${type}`;
        element.textContent = message;
        element.style.display = 'block';

        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 5000);
        }
    }

    updateUI() {
        if (this.userAccount) {
            console.log(`Connected as: ${this.userAccount}`);
        }

        // Set minimum dates for form inputs
        const now = new Date();
        const minDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

        document.getElementById('eventDate').min = minDateTime.toISOString().slice(0, 16);
        document.getElementById('registrationDeadline').min = now.toISOString().slice(0, 16);

        // Show Create Marathon form for all users
        const createCards = document.querySelectorAll('.card');
        createCards.forEach(card => {
            card.style.display = 'block';
        });
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AnonymousMarathonApp();
});

// Handle account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            console.log('Wallet disconnected');
        } else {
            console.log('Account changed:', accounts[0]);
            location.reload(); // Reload to update the connection
        }
    });

    window.ethereum.on('chainChanged', (chainId) => {
        console.log('Chain changed:', chainId);
        location.reload(); // Reload to update the connection
    });
}