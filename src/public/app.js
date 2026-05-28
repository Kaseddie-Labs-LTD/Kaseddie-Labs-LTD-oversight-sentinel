// ═══════════════════════════════════════════════════════════════════════════════
// OVERSIGHT SENTINEL v2.0.0 | KASEDDIE LABS LTD
// Frontend Application Controller
// ═══════════════════════════════════════════════════════════════════════════════

class OversightSentinelApp {
    constructor() {
        this.ledgerContainer = document.getElementById('ledgerStream');
        this.auditInput = document.getElementById('auditInput');
        this.runAuditBtn = document.getElementById('runAuditBtn');
        this.handshakeMatrix = document.getElementById('handshakeMatrix');
        this.drawer = document.getElementById('drawer');
        this.drawerContent = document.getElementById('drawerContent');
        this.drawerClose = document.getElementById('drawerClose');
        this.currentView = 'compliance';
        
        // Add new class state properties to track dashboard data
        this.adminJobs = [];
        this.adminLogs = [
            { id: 'INIT', timestamp: new Date(), message: "OVERSIGHT: ASR Telemetry console ready.", type: 'success' }
        ];
        this.feesBlocked = 500380;
        this.verifiedCount = 127;
        
        this.init();
    }

    async init() {
        await this.loadTelemetry();
        this.setupEventListeners();
        this.setupHandshakeInteractivity();
        this.setupViewSwitching();
        this.setupChatbot();
        this.startLiveUpdates();
    }

    // Load telemetry metrics from backend
    async loadTelemetry() {
        try {
            const response = await fetch('/api/dashboard-stats');
            const data = await response.json();
            this.updateTelemetryDisplay(data);
        } catch (error) {
            console.error('Failed to load telemetry:', error);
            this.useSimulationData();
        }
    }

    // Update dashboard with fetched data
    updateTelemetryDisplay(data) {
        // Update telemetry banner cards
        const impact = data.ethicalImpact !== undefined ? data.ethicalImpact : 500380;
        const nodes = data.verifiedActiveNodes !== undefined ? data.verifiedActiveNodes : 127;
        const sync = data.globalSyncRate !== undefined ? `${data.globalSyncRate}%` : '99.9%';

        this.updateCardValue('Ethical Impact', `$${impact.toLocaleString()}`);
        this.updateCardValue('Verified Active Nodes', nodes);
        this.updateCardValue('Global Sync', sync);

        // Extract stats for Admin Dashboard
        this.feesBlocked = impact;
        this.verifiedCount = nodes;

        // Update sector distribution if available
        if (data.riskDistribution) {
            this.updateSectorDistribution(data.riskDistribution);
        }

        // Update ledger stream with recent activity
        if (data.recentActivity && data.recentActivity.length > 0) {
            const ledger = document.getElementById('ledgerStream');
            if (ledger) ledger.innerHTML = ''; // Clear initial simulation list when real data loads
            this.updateLedgerWithRecentActivity(data.recentActivity);
        }
    }

    updateCardValue(label, value) {
        const cards = document.querySelectorAll('.telemetry-card');
        cards.forEach(card => {
            const cardLabel = card.querySelector('.card-label');
            if (cardLabel && cardLabel.textContent === label) {
                const cardValue = card.querySelector('.card-value');
                if (cardValue) {
                    cardValue.textContent = value;
                }
            }
        });
    }

    updateSectorDistribution(distribution) {
        // Update sector bars based on risk distribution
        const globalBar = document.querySelector('.global-bar');
        const westernBar = document.querySelector('.western-bar');
        const premiumBar = document.querySelector('.premium-bar');

        if (globalBar) globalBar.style.width = `${distribution.LOW || 75}%`;
        if (westernBar) westernBar.style.width = `${distribution.MEDIUM || 45}%`;
        if (premiumBar) premiumBar.style.width = `${distribution.CRITICAL || 30}%`;
    }

    updateLedgerWithRecentActivity(activities) {
        activities.forEach((activity, index) => {
            setTimeout(() => {
                this.addLedgerEntry(activity, false);
            }, index * 500);
        });
    }

    // Fallback to simulation data if API fails
    useSimulationData() {
        const simulationData = {
            totalAudits: 127,
            flaggedViolations: 43,
            complianceRate: 66.1,
            activeWorkers: 89,
            criticalAlerts: 7,
            recentActivity: [
                {
                    id: 'SIM-001',
                    companyName: 'Vanguard Global Horizon Group',
                    riskLevel: 'CRITICAL',
                    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    status: 'FLAGGED_VIOLATION'
                }
            ],
            riskDistribution: {
                LOW: 84,
                MEDIUM: 31,
                CRITICAL: 12
            }
        };
        this.updateTelemetryDisplay(simulationData);
    }

    // Setup event listeners
    setupEventListeners() {
        if (this.runAuditBtn) {
            this.runAuditBtn.addEventListener('click', (e) => this.handleAuditSubmission(e));
        }
        
        // Drawer close button
        if (this.drawerClose) {
            this.drawerClose.addEventListener('click', () => this.closeDrawer());
        }
        
        // Close drawer on outside click
        if (this.drawer) {
            this.drawer.addEventListener('click', (e) => {
                if (e.target === this.drawer) {
                    this.closeDrawer();
                }
            });
        }
    }

    // Setup handshake node interactivity
    setupHandshakeInteractivity() {
        if (!this.handshakeMatrix) return;
        
        const nodes = this.handshakeMatrix.querySelectorAll('.handshake-node');
        nodes.forEach(node => {
            node.style.cursor = 'pointer';
            node.addEventListener('click', () => {
                const nodeType = node.dataset.node;
                const workerName = this.handshakeMatrix.querySelector('.worker-name')?.textContent || 'Unknown Worker';
                const workerId = this.handshakeMatrix.querySelector('.worker-id')?.textContent || 'Unknown ID';
                const destination = this.handshakeMatrix.querySelector('.worker-destination')?.textContent || 'Unknown';
                const status = node.querySelector('.node-status')?.textContent || 'Unknown';
                
                this.openDrawer({
                    type: 'handshake-node',
                    nodeType,
                    workerName,
                    workerId,
                    destination,
                    nodeStatus: status,
                    metadata: this.getNodeMetadata(nodeType, status)
                });
            });
        });
    }

    // Get node metadata based on type and status
    getNodeMetadata(nodeType, status) {
        const metadata = {
            'source': {
                label: 'Source Node',
                location: 'Kampala, Uganda',
                lastVerified: new Date().toISOString(),
                salary: '$0 (No fees charged)',
                expectedSalary: '$0',
                compliance: status === '✅ Verified' ? 'COMPLIANT' : 'FLAGGED'
            },
            'bridge': {
                label: 'Sovereign Bridge',
                location: 'Transit Corridor',
                lastVerified: new Date(Date.now() - 3600000).toISOString(),
                salary: '$0 (Zero-fee transit)',
                expectedSalary: '$0',
                compliance: status === '✅ Verified' ? 'COMPLIANT' : 'FLAGGED'
            },
            'destination': {
                label: 'Destination Node',
                location: 'Dubai, UAE',
                lastVerified: new Date(Date.now() - 7200000).toISOString(),
                salary: '$1,200/month',
                expectedSalary: '$1,200/month',
                compliance: status === '✅ Verified' ? 'COMPLIANT' : 'FLAGGED'
            },
            'hub': {
                label: 'Sentinel Hub',
                location: 'Digital Custody System',
                lastVerified: new Date(Date.now() - 1800000).toISOString(),
                salary: 'N/A (Monitoring)',
                expectedSalary: 'N/A',
                compliance: status === '✅ Verified' ? 'COMPLIANT' : 'PENDING'
            }
        };
        
        return metadata[nodeType] || {};
    }

    // Open drawer with content
    openDrawer(data) {
        if (!this.drawer || !this.drawerContent) return;
        
        let contentHTML = '';
        
        if (data.type === 'handshake-node') {
            contentHTML = `
                <div class="drawer-header">
                    <h2>${this.sanitizeText(data.metadata.label)} - ${this.sanitizeText(data.workerName)}</h2>
                    <button class="drawer-close-btn" id="drawerClose">✕</button>
                </div>
                <div class="drawer-body">
                    <div class="drawer-section">
                        <div class="section-title">WORKER METADATA</div>
                        <div class="detail-row">
                            <span class="detail-label">Worker Name:</span>
                            <span class="detail-value">${this.sanitizeText(data.workerName)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Worker ID:</span>
                            <span class="detail-value">${this.sanitizeText(data.workerId)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Destination:</span>
                            <span class="detail-value">${this.sanitizeText(data.destination)}</span>
                        </div>
                    </div>
                    <div class="drawer-section">
                        <div class="section-title">NODE METADATA</div>
                        <div class="detail-row">
                            <span class="detail-label">Location:</span>
                            <span class="detail-value">${this.sanitizeText(data.metadata.location)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Last Verified:</span>
                            <span class="detail-value">${this.formatTimeAgo(data.metadata.lastVerified)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Expected Salary:</span>
                            <span class="detail-value">${this.sanitizeText(data.metadata.expectedSalary)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Actual Salary:</span>
                            <span class="detail-value ${data.metadata.salary === data.metadata.expectedSalary ? 'compliant' : 'critical'}">${this.sanitizeText(data.metadata.salary)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Compliance Status:</span>
                            <span class="detail-value ${data.metadata.compliance === 'COMPLIANT' ? 'compliant' : 'critical'}">${data.metadata.compliance}</span>
                        </div>
                    </div>
                    <div class="drawer-section">
                        <div class="section-title">PULSE-CHECK STATUS</div>
                        <div class="detail-row">
                            <span class="detail-label">Node Status:</span>
                            <span class="detail-value">${this.sanitizeText(data.nodeStatus)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Last Contact:</span>
                            <span class="detail-value">${this.formatTimeAgo(new Date())}</span>
                        </div>
                    </div>
                </div>
            `;
        }
        
        this.drawerContent.innerHTML = contentHTML;
        this.drawer.classList.add('open');
        
        // Re-attach close button event
        const newCloseBtn = this.drawerContent.querySelector('#drawerClose');
        if (newCloseBtn) {
            newCloseBtn.addEventListener('click', () => this.closeDrawer());
        }
    }

    // Close drawer
    closeDrawer() {
        if (this.drawer) {
            this.drawer.classList.remove('open');
        }
    }

    // Setup view switching
    setupViewSwitching() {
        const navToggles = document.querySelectorAll('.nav-toggle');
        navToggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const view = toggle.dataset.view;
                this.switchView(view);
                
                // Update active state
                navToggles.forEach(t => t.classList.remove('active'));
                toggle.classList.add('active');
            });
        });
    }

    // Switch between views
    switchView(view) {
        this.currentView = view;
        const mainViewport = document.querySelector('.main-viewport');
        if (!mainViewport) return;
        
        // Fade out current content
        mainViewport.style.opacity = '0';
        mainViewport.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            // Update content based on view
            this.updateViewContent(view);
            
            // Fade in new content
            mainViewport.style.opacity = '1';
        }, 300);
    }

    // Update view content
    updateViewContent(view) {
        const mainViewport = document.querySelector('.main-viewport');
        
        if (view === 'compliance') {
            // Show compliance dashboard (current layout)
            mainViewport.innerHTML = `
                <section class="glass-card handshake-panel">
                    <h2 class="panel-title">4-POINT DIGITAL CUSTODY HANDSHAKE</h2>
                    <div id="handshakeMatrix" class="handshake-matrix">
                        <div class="handshake-worker">
                            <div class="worker-info">
                                <div class="worker-name">Nakimuli Sarah</div>
                                <div class="worker-id">UG-2024-7842</div>
                                <div class="worker-destination">Dubai, UAE</div>
                            </div>
                            <div class="handshake-nodes">
                                <div class="handshake-node verified" data-node="source">
                                    <div class="node-icon">🏠</div>
                                    <div class="node-label">Source Node</div>
                                    <div class="node-status">✅ Verified</div>
                                </div>
                                <div class="handshake-node verified" data-node="bridge">
                                    <div class="node-icon">🌉</div>
                                    <div class="node-label">Sovereign Bridge</div>
                                    <div class="node-status">✅ Verified</div>
                                </div>
                                <div class="handshake-node flagged" data-node="destination">
                                    <div class="node-icon">🏢</div>
                                    <div class="node-label">Destination Node</div>
                                    <div class="node-status">⚠️ Flagged</div>
                                </div>
                                <div class="handshake-node pending" data-node="hub">
                                    <div class="node-icon">📡</div>
                                    <div class="node-label">Sentinel Hub</div>
                                    <div class="node-status">⏳ Pending</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="glass-card ingestion-panel">
                    <h2 class="panel-title">INGESTION BAY</h2>
                    <div class="form-container">
                        <textarea 
                            id="auditInput" 
                            class="audit-input" 
                            placeholder="Paste raw recruitment description here for autonomous compliance analysis..."
                            rows="6"
                        ></textarea>
                        <button id="runAuditBtn" class="glow-button">
                            RUN AUTONOMOUS COMPLIANCE AUDIT
                        </button>
                    </div>
                </section>

                <section class="glass-card ledger-panel">
                    <h2 class="panel-title">LIVE AUDIT LEDGER STREAM</h2>
                    <div id="ledgerStream" class="ledger-stream">
                        <!-- Entries will be dynamically populated -->
                    </div>
                </section>
            `;
            
            // Re-attach event listeners
            this.auditInput = document.getElementById('auditInput');
            this.runAuditBtn = document.getElementById('runAuditBtn');
            this.handshakeMatrix = document.getElementById('handshakeMatrix');
            this.ledgerContainer = document.getElementById('ledgerStream');
            
            if (this.runAuditBtn) {
                this.runAuditBtn.addEventListener('click', (e) => this.handleAuditSubmission(e));
            }
            
            this.setupHandshakeInteractivity();
            this.updateLedgerWithRecentActivity(this.recentActivity || []);
            
        } else if (view === 'b2b') {
            // Show B2B Partner Hub
            mainViewport.innerHTML = `
                <section class="glass-card b2b-panel" style="grid-column: 1 / -1;">
                    <h2 class="panel-title">B2B PARTNER HUB</h2>
                    <div class="b2b-content">
                        <div class="b2b-section">
                            <h3>Partner Directory</h3>
                            <div class="partner-list">
                                <div class="partner-card">
                                    <div class="partner-name">Vanguard Global Horizon</div>
                                    <div class="partner-status critical">FLAGGED</div>
                                    <div class="partner-details">Dubai Marina, UAE</div>
                                </div>
                                <div class="partner-card">
                                    <div class="partner-name">Dubai Security Services</div>
                                    <div class="partner-status compliant">VERIFIED</div>
                                    <div class="partner-details">Dubai, UAE</div>
                                </div>
                                <div class="partner-card">
                                    <div class="partner-name">Kampala Labor Solutions</div>
                                    <div class="partner-status compliant">VERIFIED</div>
                                    <div class="partner-details">Kampala, Uganda</div>
                                </div>
                            </div>
                        </div>
                        <div class="b2b-section">
                            <h3>Partnership Proposals</h3>
                            <div class="proposal-list">
                                <div class="proposal-card">
                                    <div class="proposal-title">Zero-Fee Recruitment Alliance</div>
                                    <div class="proposal-status">PENDING REVIEW</div>
                                    <button class="action-btn">Review</button>
                                </div>
                                <div class="proposal-card">
                                    <div class="proposal-title">GCC Corridor Expansion</div>
                                    <div class="proposal-status">APPROVED</div>
                                    <button class="action-btn">View Details</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            
        } else if (view === 'artisan') {
            // Show Artisan Media Suite
            mainViewport.innerHTML = `
                <section class="glass-card artisan-panel" style="grid-column: 1 / -1;">
                    <h2 class="panel-title">ARTISAN MEDIA SUITE</h2>
                    <div class="artisan-content">
                        <div class="artisan-section">
                            <h3>Marketing Copy Generator</h3>
                            <textarea 
                                id="marketingInput" 
                                class="marketing-input" 
                                placeholder="Enter product/service details for AI-generated marketing copy..."
                                rows="4"
                            ></textarea>
                            <button id="generateCopyBtn" class="glow-button">
                                GENERATE MARKETING COPY
                            </button>
                            <div id="generatedCopy" class="generated-copy">
                                <!-- Generated copy will appear here -->
                            </div>
                        </div>
                        <div class="artisan-section">
                            <h3>Recent Campaigns</h3>
                            <div class="campaign-list">
                                <div class="campaign-card">
                                    <div class="campaign-name">Zero-Fee Recruitment Campaign</div>
                                    <div class="campaign-metrics">12.5K Reach, 847 Clicks</div>
                                    <div class="campaign-status">ACTIVE</div>
                                </div>
                                <div class="campaign-card">
                                    <div class="campaign-name">GCC Corridor Launch</div>
                                    <div class="campaign-metrics">8.2K Reach, 523 Clicks</div>
                                    <div class="campaign-status">COMPLETED</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            `;
            
            // Re-attach event listeners for artisan view
            const generateCopyBtn = document.getElementById('generateCopyBtn');
            if (generateCopyBtn) {
                generateCopyBtn.addEventListener('click', () => this.generateMarketingCopy());
            }
        } else if (view === 'admin-dashboard') {
            // Show Admin Dashboard view
            mainViewport.innerHTML = `
                <section class="glass-card admin-dashboard-panel" style="grid-column: 1 / -1;">
                    <h2 class="panel-title">ADMINISTRATIVE COMPLIANCE OVERWATCH (REALTIME MONITORS)</h2>
                    <div class="data-vitals" id="dataVitals">
                        <div class="vital-card">
                            <span class="vital-label">ETHICAL IMPACT (FEES BLOCKED)</span>
                            <span class="vital-value" id="vitalEthicalImpact">$500,380</span>
                        </div>
                        <div class="vital-card">
                            <span class="vital-label">VERIFIED ACTIVE NODES</span>
                            <span class="vital-value" id="vitalActiveNodes">127</span>
                        </div>
                        <div class="vital-card">
                            <span class="vital-label">GLOBAL SYNC RATE</span>
                            <span class="vital-value" id="vitalSyncRate">99.9%</span>
                        </div>
                    </div>
                </section>
                
                <section class="glass-card ledger-panel" style="grid-column: 1 / -1;">
                    <h2 class="panel-title">LIVE MONGODB ATLAS AUDIT LEDGER</h2>
                    <div id="adminLedgerStream" class="ledger-stream">
                        <div class="loading-placeholder">Ingesting and syncing active ledger streams...</div>
                    </div>
                </section>
            `;
            
            // Instantly load data from server GET /api/dashboard-stats
            this.loadAdminDashboardData();
        } else if (view === 'hr-portal') {
            // Show HR Portal view
            mainViewport.innerHTML = `
                <section class="glass-card hr-panel" style="grid-column: 1 / -1;">
                    <h2 class="panel-title">HR PERSONNEL SEMANTIC SEARCH ENGINE (VECTOR QDRANT VAULT)</h2>
                    <div class="hr-portal-search">
                        <div class="search-box-container">
                            <input 
                                id="hrSearchInput" 
                                class="hr-search-input" 
                                placeholder="Query personnel semantic database (e.g., 'vetted logistics driver zero fees')..." 
                            />
                            <button id="hrSearchBtn" class="glow-button">SEARCH NODE</button>
                        </div>
                        <div id="hrSearchResults" class="hr-search-results">
                            <p class="placeholder-text">Enter query above to execute semantic Qdrant search via reverse proxy gateway.</p>
                        </div>
                    </div>
                </section>
            `;
            
            // Add event listeners for HR search
            const hrSearchBtn = document.getElementById('hrSearchBtn');
            const hrSearchInput = document.getElementById('hrSearchInput');
            if (hrSearchBtn) {
                hrSearchBtn.addEventListener('click', () => this.handleHRSearch());
            }
            if (hrSearchInput) {
                hrSearchInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.handleHRSearch();
                    }
                });
            }
        }
    }

    // Setup chatbot functionality
    setupChatbot() {
        this.chatbotPanel = document.getElementById('chatbotPanel');
        this.chatbotBody = document.getElementById('chatbotBody');
        this.chatbotToggle = document.getElementById('chatbotToggle');
        this.chatInput = document.getElementById('chatInput');
        this.chatSendBtn = document.getElementById('chatSendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        
        // Toggle chatbot panel
        if (this.chatbotToggle) {
            this.chatbotToggle.addEventListener('click', () => {
                this.chatbotBody.classList.toggle('collapsed');
                this.chatbotToggle.textContent = this.chatbotBody.classList.contains('collapsed') ? '+' : '−';
            });
        }
        
        // Send message on button click
        if (this.chatSendBtn) {
            this.chatSendBtn.addEventListener('click', () => this.sendChatMessage());
        }
        
        // Send message on Enter key
        if (this.chatInput) {
            this.chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendChatMessage();
                }
            });
        }
    }

    // Send chat message
    async sendChatMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;
        
        // Add user message to chat
        this.addChatMessage(message, 'user');
        this.chatInput.value = '';
        
        // Show typing indicator
        this.addTypingIndicator();
        
        try {
            const response = await fetch('/api/market-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });
            
            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator();
            
            // Add bot response
            this.addChatMessage(data.response, 'bot');
            
        } catch (error) {
            this.removeTypingIndicator();
            this.addChatMessage('Sorry, I encountered an error processing your request. Please try again.', 'bot');
        }
    }

    // Add message to chat
    addChatMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.innerHTML = `<div class="message-content">${this.sanitizeText(message)}</div>`;
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // Add typing indicator
    addTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-message bot typing';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `<div class="message-content">🤖 Thinking...</div>`;
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    // Remove typing indicator
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    // Generate marketing copy (placeholder)
    generateMarketingCopy() {
        const input = document.getElementById('marketingInput').value;
        const output = document.getElementById('generatedCopy');
        
        if (!input.trim()) {
            output.innerHTML = '<div class="error">Please enter product/service details</div>';
            return;
        }
        
        output.innerHTML = '<div class="loading">Generating marketing copy...</div>';
        
        // Placeholder for AI-generated copy
        setTimeout(() => {
            output.innerHTML = `
                <div class="copy-result">
                    <h4>Generated Marketing Copy:</h4>
                    <p>Transform your recruitment strategy with Kaseddie Labs' zero-fee compliance platform. Join the movement that's protecting workers while connecting global opportunities.</p>
                    <button class="copy-btn">📋 Copy to Clipboard</button>
                </div>
            `;
        }, 1500);
    }

    // Handle audit form submission
    async handleAuditSubmission(event) {
        event.preventDefault();
        
        const inputText = this.auditInput.value.trim();
        if (!inputText) {
            this.showError('Please enter a recruitment description for analysis.');
            return;
        }

        // Set loading state
        this.setButtonLoading(true);

        try {
            const response = await fetch('/api/audit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: inputText })
            });

            if (!response.ok) {
                throw new Error('Audit processing failed');
            }

            const result = await response.json();
            this.addLedgerEntry(result, true);
            this.auditInput.value = ''; // Clear input after successful submission

        } catch (error) {
            console.error('Audit submission error:', error);
            this.showError('Audit processing failed. Please try again.');
            
            // Fallback: Simulate audit result for demo purposes
            this.simulateAuditResult(inputText);
        } finally {
            this.setButtonLoading(false);
        }
    }

    // Set button loading state
    setButtonLoading(isLoading) {
        if (isLoading) {
            this.runAuditBtn.textContent = '🧠 SENTINEL IS THINKING...';
            this.runAuditBtn.disabled = true;
            this.runAuditBtn.style.opacity = '0.7';
        } else {
            this.runAuditBtn.textContent = 'RUN AUTONOMOUS COMPLIANCE AUDIT';
            this.runAuditBtn.disabled = false;
            this.runAuditBtn.style.opacity = '1';
        }
    }

    // Add entry to ledger stream
    addLedgerEntry(data, isNew = false) {
        const entry = document.createElement('div');
        
        // Determine entry type and styling
        const isCritical = data.riskLevel === 'CRITICAL' || data.status === 'FLAGGED_VIOLATION';
        const isCompliant = data.riskLevel === 'LOW' || data.status === 'VERIFIED_COMPLIANT';
        
        entry.className = `ledger-entry ${isCritical ? 'critical' : isCompliant ? 'compliant' : 'investigate'}`;
        entry.dataset.expanded = 'false';
        
        // Safe text handling
        const safeCompanyName = this.sanitizeText(data.companyName || data.company || 'Unknown Company');
        const safeRiskLevel = this.sanitizeText(data.riskLevel || 'UNKNOWN');
        const safeStatus = this.sanitizeText(data.status || 'ANALYSIS COMPLETE');
        const entryId = data.id || data._id || `AUD-${Date.now().toString().slice(-4)}`;
        
        // Format timestamp
        const timestamp = data.timestamp || data.auditTimestamp || new Date().toISOString();
        const timeAgo = this.formatTimeAgo(timestamp);

        // Build entry HTML
        let entryHTML = `
            <div class="entry-header">
                <span class="entry-id">${this.sanitizeText(entryId)}</span>
                <span class="entry-timestamp">${timeAgo}</span>
                <span class="entry-expand">▼</span>
            </div>
            <div class="entry-company">${safeCompanyName}</div>
            <div class="entry-status ${isCritical ? 'critical' : isCompliant ? 'compliant' : 'investigate'}">${safeStatus}</div>
            <div class="entry-details" style="display: none;">
        `;

        // Add Part 1 Audit Requirements
        entryHTML += `
            <div class="entry-section">
                <div class="section-title">PART 1: AUDIT REQUIREMENTS</div>
                <div class="detail-row">
                    <span class="detail-label">Risk Assessment:</span>
                    <span class="detail-value ${isCritical ? 'critical' : isCompliant ? 'compliant' : 'investigate'}">${safeRiskLevel}</span>
                </div>
        `;

        // Add flagged indicators if critical
        if (isCritical && data.structuredAnalysis) {
            const analysis = data.structuredAnalysis;
            const adminEmail = this.sanitizeText(analysis.adminEmail || 'Not detected');
            const inChargeRole = this.sanitizeText(analysis.inChargeRole || 'Not detected');
            
            entryHTML += `
                <div class="detail-row">
                    <span class="detail-label">Flagged Indicators:</span>
                    <span class="detail-value">Upfront fees detected, Admin Email: ${adminEmail}, In Charge: ${inChargeRole}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Regulatory Concerns:</span>
                    <span class="detail-value critical">ILO violations, Zero-fee policy breach</span>
                </div>
            `;
        } else if (isCompliant) {
            entryHTML += `
                <div class="detail-row">
                    <span class="detail-label">Flagged Indicators:</span>
                    <span class="detail-value compliant">None detected</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Regulatory Concerns:</span>
                    <span class="detail-value compliant">None - Compliant with ILO standards</span>
                </div>
            `;
        }

        entryHTML += `</div>`;

        // Add B2B Proposal Manager section
        if (data.structuredAnalysis && data.structuredAnalysis.b2bHumanProposal) {
            const proposal = this.sanitizeText(data.structuredAnalysis.b2bHumanProposal);
            entryHTML += `
                <div class="entry-section">
                    <div class="section-title">B2B PROPOSAL MANAGER</div>
                    <div class="proposal-content">${proposal}</div>
                    <button class="copy-proposal-btn" data-proposal="${this.sanitizeText(proposal)}">📋 Copy Proposal</button>
                </div>
            `;
        }

        entryHTML += `</div>`; // Close entry-details

        entry.innerHTML = entryHTML;

        // Add click event for expansion
        entry.addEventListener('click', (e) => {
            if (!e.target.classList.contains('copy-proposal-btn')) {
                this.toggleEntryExpansion(entry);
            }
        });

        // Add copy proposal button event
        const copyBtn = entry.querySelector('.copy-proposal-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.copyToClipboard(copyBtn.dataset.proposal);
            });
        }

        // Prepend to ledger
        this.ledgerContainer.insertBefore(entry, this.ledgerContainer.firstChild);

        // Keep only last 15 entries
        while (this.ledgerContainer.children.length > 15) {
            this.ledgerContainer.removeChild(this.ledgerContainer.lastChild);
        }

        // Scroll to top
        this.ledgerContainer.scrollTop = 0;
    }

    // Toggle entry expansion
    toggleEntryExpansion(entry) {
        const details = entry.querySelector('.entry-details');
        const expandIcon = entry.querySelector('.entry-expand');
        
        if (entry.dataset.expanded === 'false') {
            entry.dataset.expanded = 'true';
            details.style.display = 'block';
            expandIcon.textContent = '▲';
        } else {
            entry.dataset.expanded = 'false';
            details.style.display = 'none';
            expandIcon.textContent = '▼';
        }
    }

    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Proposal copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            alert('Failed to copy proposal');
        }
    }

    // Simulate audit result for demo/fallback
    simulateAuditResult(inputText) {
        const hasFee = inputText.toLowerCase().includes('fee') || 
                      inputText.toLowerCase().includes('payment') ||
                      inputText.toLowerCase().includes('charge');
        
        const simulatedResult = {
            id: `SIM-${Date.now().toString().slice(-4)}`,
            companyName: 'Manual Audit Input',
            riskLevel: hasFee ? 'CRITICAL' : 'LOW',
            status: hasFee ? 'FLAGGED_VIOLATION' : 'VERIFIED_COMPLIANT',
            timestamp: new Date().toISOString(),
            complianceViolationDetected: hasFee,
            structuredAnalysis: hasFee ? {
                adminEmail: 'detected@example.com',
                inChargeRole: 'Operations Manager',
                b2bHumanProposal: null
            } : {
                adminEmail: null,
                inChargeRole: null,
                b2bHumanProposal: 'Thank you for maintaining ethical recruitment practices. Our compliance tools can help you scale your operations while ensuring zero-fee policies.'
            }
        };

        this.addLedgerEntry(simulatedResult, true);
    }

    // Start live updates simulation
    startLiveUpdates() {
        setInterval(() => {
            const statuses = ['compliant', 'critical', 'investigate'];
            const companies = ['Global Recruitment Ltd', 'Dubai Security Services', 'Kampala Labor Solutions'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const randomCompany = companies[Math.floor(Math.random() * companies.length)];
            
            const liveEntry = {
                id: `LIVE-${Date.now().toString().slice(-4)}`,
                companyName: randomCompany,
                riskLevel: randomStatus.toUpperCase(),
                status: randomStatus === 'compliant' ? 'VERIFIED_COMPLIANT' : 
                        randomStatus === 'critical' ? 'FLAGGED_VIOLATION' : 'INVESTIGATE',
                timestamp: new Date().toISOString()
            };

            this.addLedgerEntry(liveEntry, false);
        }, 20000); // Every 20 seconds
    }

    // Utility: Sanitize text to prevent XSS
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Utility: Format time ago
    formatTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    }

    // Utility: Show error message
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'ledger-entry critical';
        errorDiv.innerHTML = `
            <div class="entry-header">
                <span class="entry-id">ERROR</span>
                <span class="entry-timestamp">Just now</span>
            </div>
            <div class="entry-company">System Alert</div>
            <div class="entry-alert">${this.sanitizeText(message)}</div>
        `;
        this.ledgerContainer.insertBefore(errorDiv, this.ledgerContainer.firstChild);
    }

    // Load Admin Dashboard telemetry data and ledger
    async loadAdminDashboardData() {
        const vitalsImpact = document.getElementById('vitalEthicalImpact');
        const vitalsNodes = document.getElementById('vitalActiveNodes');
        const vitalsSync = document.getElementById('vitalSyncRate');
        const adminLedger = document.getElementById('adminLedgerStream');

        try {
            const response = await fetch('/api/dashboard-stats');
            const data = await response.json();
            
            const impact = data.ethicalImpact !== undefined ? data.ethicalImpact : 500380;
            const nodes = data.verifiedActiveNodes !== undefined ? data.verifiedActiveNodes : 127;
            const sync = data.globalSyncRate !== undefined ? `${data.globalSyncRate}%` : '99.9%';
            
            if (vitalsImpact) vitalsImpact.textContent = `$${impact.toLocaleString()}`;
            if (vitalsNodes) vitalsNodes.textContent = nodes;
            if (vitalsSync) vitalsSync.textContent = sync;
            
            if (adminLedger) {
                adminLedger.innerHTML = '';
                const activities = data.recentActivity || [];
                if (activities.length === 0) {
                    adminLedger.innerHTML = '<p class="placeholder-text">No ledger logs found in MongoDB Atlas.</p>';
                    return;
                }
                
                activities.forEach(activity => {
                    const entry = document.createElement('div');
                    const isCritical = activity.riskAssessment === 'CRITICAL' || activity.status === 'FLAGGED_VIOLATION' || activity.riskLevel === 'CRITICAL';
                    const isCompliant = activity.riskAssessment === 'VERIFIED_COMPLIANT' || activity.status === 'VERIFIED_COMPLIANT' || activity.riskLevel === 'LOW';
                    
                    entry.className = `ledger-entry ${isCritical ? 'critical' : isCompliant ? 'compliant' : 'investigate'}`;
                    
                    const safeCompany = this.sanitizeText(activity.companyName || 'Unknown Company');
                    const safeStatus = this.sanitizeText(activity.status || 'VERIFIED_COMPLIANT');
                    const safeRisk = this.sanitizeText(activity.riskLevel || activity.riskAssessment || 'LOW');
                    const safeId = activity.nodeId || activity.id || `AUD-${Date.now().toString().slice(-4)}`;
                    
                    entry.innerHTML = `
                        <div class="entry-header">
                            <span class="entry-id">${this.sanitizeText(safeId)}</span>
                            <span class="entry-timestamp">Live Atlas Vault Sync</span>
                        </div>
                        <div class="entry-company">${safeCompany}</div>
                        <div class="entry-status ${isCritical ? 'critical' : isCompliant ? 'compliant' : 'investigate'}">${safeStatus}</div>
                        <div class="entry-details" style="display: block; margin-top: 8px; border-top: 1px solid var(--glass-border); padding-top: 8px;">
                            <div class="detail-row">
                                <span class="detail-label">Compliance Risk:</span>
                                <span class="detail-value ${isCritical ? 'critical' : isCompliant ? 'compliant' : 'investigate'}">${safeRisk}</span>
                            </div>
                        </div>
                    `;
                    adminLedger.appendChild(entry);
                });
            }
        } catch (error) {
            console.error('Failed to load admin telemetry:', error);
            if (adminLedger) {
                adminLedger.innerHTML = '<p class="placeholder-text text-crimson">⚠️ Server link timed out. Standard backup protocol active.</p>';
            }
        }
    }

    // HR Portal Semantic Search Dispatcher
    async handleHRSearch() {
        const queryInput = document.getElementById('hrSearchInput');
        const resultsContainer = document.getElementById('hrSearchResults');
        if (!queryInput || !resultsContainer) return;
        
        const query = queryInput.value.trim();
        if (!query) return;
        
        resultsContainer.innerHTML = '<div class="loading-placeholder">Executing Semantic Qdrant Query via Proxy Gateway (/api/old-library/search)...</div>';
        
        try {
            const response = await fetch('/api/old-library/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });
            
            if (!response.ok) throw new Error('Search failed');
            
            const data = await response.json();
            this.renderSearchResults(data, resultsContainer);
        } catch (error) {
            console.error('HR semantic search failed:', error);
            resultsContainer.innerHTML = `
                <div class="error-msg" style="margin-bottom: 12px; color: var(--purple);">
                    ⚠️ Qdrant Engine Offline. Serving Local Corridor Semantic Sandbox Results for: "${this.sanitizeText(query)}"
                </div>
            `;
            this.renderSimulatedSearchResults(query, resultsContainer);
        }
    }

    renderSearchResults(data, container) {
        if (data.summary) {
            const summaryDiv = document.createElement('div');
            summaryDiv.className = 'search-summary-card';
            summaryDiv.style.marginBottom = '16px';
            summaryDiv.style.padding = '16px';
            summaryDiv.style.background = 'rgba(168, 85, 247, 0.1)';
            summaryDiv.style.border = '1px dashed var(--purple)';
            summaryDiv.style.borderRadius = '8px';
            summaryDiv.innerHTML = `
                <h4 style="color: var(--purple); font-family: 'Share Tech Mono', monospace; font-size: 0.9rem; margin-bottom: 6px;">CORRIDOR AUDIT DECISION</h4>
                <p style="font-size: 0.8rem; line-height: 1.4; color: var(--text-primary);">${this.sanitizeText(data.summary)}</p>
            `;
            container.appendChild(summaryDiv);
        }
        
        const list = data.leads || data.results || [];
        if (list.length === 0) {
            container.innerHTML += '<p class="placeholder-text">No matching personnel records found.</p>';
            return;
        }
        
        list.forEach(item => {
            const card = document.createElement('div');
            card.className = 'search-result-card';
            card.style.background = 'rgba(0, 0, 0, 0.3)';
            card.style.border = '1px solid var(--glass-border)';
            card.style.borderRadius = '8px';
            card.style.padding = '16px';
            card.style.marginBottom = '12px';
            card.innerHTML = `
                <div class="result-title" style="font-size: 0.9rem; font-weight: 600; color: var(--emerald); margin-bottom: 4px;">${this.sanitizeText(item.title || item.name || 'Vetted Candidate')}</div>
                <div class="result-meta" style="display: flex; gap: 16px; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 8px;">
                    <span>📍 ${this.sanitizeText(item.location || 'Uganda-GCC Corridor')}</span>
                    <span>💰 ${this.sanitizeText(item.salary || 'Zero-Fee Mandate')}</span>
                </div>
                <p class="result-desc" style="font-size: 0.8rem; line-height: 1.4; color: var(--text-primary);">${this.sanitizeText(item.description || 'Verified compliant worker node.')}</p>
            `;
            container.appendChild(card);
        });
    }

    renderSimulatedSearchResults(query, container) {
        const simulatedList = [
            {
                title: "Logistics Specialist (GAMCA Clear)",
                location: "Kampala Hub → Dubai Marina Node",
                salary: "AED 3,200/month",
                description: `Matched semantic query "${query}" at 98.4% vector confidence score. Zero recruitment fees paid. Compliance cleared.`
            },
            {
                title: "Premium Security Officer (Luxembourg Route)",
                location: "Kampala Hub → Warsaw Sovereign Transit",
                salary: "EUR 2,100/month",
                description: `Matches query "${query}". Sovereign Bridge handshake verified with 0 upfront costs. Active node.`
            }
        ];
        this.renderSearchResults({ summary: `Fallback sandbox activated. Generated 2 potential matching candidate nodes for query: "${query}".`, leads: simulatedList }, container);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new OversightSentinelApp();
});
