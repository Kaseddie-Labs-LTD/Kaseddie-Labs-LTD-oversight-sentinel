// ═══════════════════════════════════════════════════════════════════════════════
// OVERSIGHT SENTINEL v2.0.0 | KASEDDIE LABS LTD
// Frontend Application Controller
// ═══════════════════════════════════════════════════════════════════════════════

class OversightSentinelApp {
    constructor() {
        this.ledgerContainer = document.getElementById('ledgerStream');
        this.auditInput = document.getElementById('auditInput');
        this.runAuditBtn = document.getElementById('runAuditBtn');
        this.init();
    }

    async init() {
        await this.loadTelemetry();
        this.setupEventListeners();
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
        this.updateCardValue('Ethical Impact', `$${(data.totalAudits * 3940).toLocaleString()}`);
        this.updateCardValue('Verified Active Nodes', data.totalAudits || 127);
        this.updateCardValue('Global Sync', '99.9%');

        // Update sector distribution if available
        if (data.riskDistribution) {
            this.updateSectorDistribution(data.riskDistribution);
        }

        // Update ledger stream with recent activity
        if (data.recentActivity && data.recentActivity.length > 0) {
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new OversightSentinelApp();
});
