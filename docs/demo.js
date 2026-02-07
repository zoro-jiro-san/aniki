// Interactive Demo for Aniki Landing Page
class AnikiDemo {
    constructor() {
        this.currentStep = 0;
        this.isRunning = false;
        this.demoSteps = [
            {
                command: "aniki init --security-level=enterprise --network=devnet",
                outputs: [
                    "🔧 Initializing Aniki Treasury Management System...",
                    "🌊 Connecting to Sui Devnet RPC...",
                    "✓ Connected to https://fullnode.devnet.sui.io",
                    "🛡️  Setting up enterprise security architecture...",
                    "✓ Air-gap wallet system configured",
                    "✓ Multi-signature thresholds established",
                    "🤖 Enabling AI fraud detection engine...",
                    "✓ ML models loaded: pattern-analysis, velocity-check, recipient-scoring",
                    "✅ Aniki initialized successfully!"
                ]
            },
            {
                command: "aniki setup-wallets --cold=0xc0ld...w4ll3t --hot=0xh0t...w4ll3t",
                outputs: [
                    "🔐 Configuring wallet architecture...",
                    "✓ Cold wallet registered: 0xc0ld...w4ll3t (Hardware Ledger)",
                    "✓ Hot wallet registered: 0xh0t...w4ll3t (Operational)",
                    "⚖️  Security thresholds configured:",
                    "  • Cold wallet approval: >100,000 SUI",
                    "  • Hot wallet limit: ≤10,000 SUI",
                    "  • Multi-sig required: >50,000 SUI",
                    "🔒 Wallet setup complete!"
                ]
            },
            {
                command: "aniki deploy-contracts --network=devnet",
                outputs: [
                    "📋 Compiling Move smart contracts...",
                    "✓ treasury.move compiled successfully",
                    "✓ security.move compiled successfully", 
                    "✓ agent_manager.move compiled successfully",
                    "🚀 Deploying to Sui Devnet...",
                    "✓ Package deployed: 0x1234...abcd",
                    "✓ Treasury object created: 0x5678...efgh",
                    "🔗 SuiNS registration: aniki-treasury.sui",
                    "📦 Contracts deployed and verified!"
                ]
            },
            {
                command: "aniki spawn-agent --task=\"DeFi Portfolio Management\" --budget=75000",
                outputs: [
                    "🤖 Spawning autonomous agent...",
                    "✓ Agent ID: agent_defi_001",
                    "💰 Budget allocated: 75,000 SUI",
                    "🔒 Security level: Standard (hot wallet authorized)",
                    "📋 Task: Monitor and rebalance DeFi positions",
                    "🎯 Target protocols: Cetus, Aftermath, Kriya",
                    "⏰ Execution schedule: Every 4 hours",
                    "🚀 Agent deployment successful!",
                    "",
                    "Agent Status:",
                    "├─ Active: ✅ Running",
                    "├─ Budget: 75,000 SUI available", 
                    "├─ Security: Hot wallet approved",
                    "└─ Next execution: 2026-02-07 21:00 UTC"
                ]
            },
            {
                command: "aniki monitor --fraud-detection --real-time",
                outputs: [
                    "🔍 Activating fraud detection systems...",
                    "🧠 ML models: pattern-analysis, velocity-check, recipient-scoring",
                    "📊 Monitoring 47 behavioral patterns...",
                    "⚡ Real-time analysis: ACTIVE",
                    "",
                    "📈 Treasury Dashboard:",
                    "├─ Total Balance: 1,250,000 SUI",
                    "├─ Cold Storage: 1,100,000 SUI (88%)",
                    "├─ Hot Wallet: 150,000 SUI (12%)",
                    "├─ Active Agents: 3",
                    "├─ Total Allocated: 125,000 SUI",
                    "└─ Available: 1,125,000 SUI",
                    "",
                    "🛡️  Security Status: ALL SYSTEMS OPERATIONAL",
                    "✅ No threats detected in last 24h",
                    "📊 Risk Score: 0.02/1.0 (Very Low)"
                ]
            },
            {
                command: "# Simulating high-value transaction...",
                outputs: [
                    "⚠️  SECURITY ALERT: High-value transaction detected!",
                    "",
                    "💸 Transaction Details:",
                    "├─ Amount: 150,000 SUI",
                    "├─ Recipient: 0x9876...5432",
                    "├─ Purpose: Large DeFi investment",
                    "└─ Exceeds cold wallet threshold",
                    "",
                    "🔐 COLD WALLET APPROVAL REQUIRED",
                    "├─ Approval method: Hardware wallet + QR code",
                    "├─ Security review: Multi-sig (2-of-3)",
                    "├─ Estimated approval time: 5-15 minutes",
                    "└─ Transaction status: PENDING APPROVAL",
                    "",
                    "🔗 Cold wallet approval URL generated:",
                    "https://aniki.sui.dev/approve/tx_abc123...xyz789"
                ]
            }
        ];
    }

    async startDemo() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.currentStep = 0;
        
        const demoContent = document.getElementById('demoContent');
        if (!demoContent) return;
        
        // Clear existing content
        demoContent.innerHTML = '<div class="demo-line demo-comment"># Aniki Interactive Demo Starting...</div>';
        await this.sleep(1000);
        
        // Run through all demo steps
        for (const step of this.demoSteps) {
            await this.executeStep(step);
            await this.sleep(2000); // Pause between steps
        }
        
        // Show completion message
        await this.sleep(1000);
        this.addLine('', 'output');
        this.addLine('🎉 Demo completed! Aniki is ready for production use.', 'success');
        this.addLine('🔗 GitHub: https://github.com/your-username/aniki', 'comment');
        this.addLine('📚 Documentation: https://your-username.github.io/aniki/docs.html', 'comment');
        
        this.isRunning = false;
    }

    async executeStep(step) {
        // Show command prompt
        this.addLine(`$ ${step.command}`, 'prompt');
        await this.sleep(500);
        
        // Show outputs with typing effect
        for (const output of step.outputs) {
            await this.sleep(300 + Math.random() * 200); // Variable delay
            this.addLine(output, 'output');
        }
        
        this.addLine('', 'output'); // Empty line
    }

    addLine(text, type) {
        const demoContent = document.getElementById('demoContent');
        if (!demoContent) return;
        
        const line = document.createElement('div');
        line.className = `demo-line demo-${type}`;
        line.textContent = text;
        
        // Special styling for success messages
        if (text.includes('✅') || text.includes('🎉')) {
            line.style.color = '#4CAF50';
            line.style.fontWeight = '600';
        }
        
        // Special styling for warnings/alerts
        if (text.includes('⚠️') || text.includes('ALERT') || text.includes('SECURITY')) {
            line.style.color = '#FF9800';
            line.style.fontWeight = '600';
        }
        
        demoContent.appendChild(line);
        
        // Auto-scroll to bottom
        demoContent.scrollTop = demoContent.scrollHeight;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Interactive command execution
    async executeCommand(command) {
        if (this.isRunning) return;
        
        const demoContent = document.getElementById('demoContent');
        if (!demoContent) return;
        
        // Clear content and show command
        demoContent.innerHTML = '';
        this.addLine(`$ ${command}`, 'prompt');
        
        // Simulate command execution
        await this.sleep(500);
        
        // Mock responses for different commands
        const responses = {
            'status': [
                '📊 Aniki Treasury Status:',
                '├─ Network: Sui Devnet',
                '├─ Treasury Balance: 1,250,000 SUI',
                '├─ Active Agents: 3',
                '├─ Security Level: Enterprise',
                '└─ System Status: OPERATIONAL ✅'
            ],
            'help': [
                '🤖 Aniki Treasury Management Commands:',
                '',
                'Core Commands:',
                '├─ init           Initialize Aniki system',
                '├─ status         Show system status', 
                '├─ deploy         Deploy Move contracts',
                '├─ spawn-agent    Create new autonomous agent',
                '└─ monitor        Start monitoring dashboard',
                '',
                'Security Commands:',
                '├─ setup-wallets  Configure cold/hot wallets',
                '├─ enable-fraud   Activate fraud detection',
                '├─ lockdown       Emergency system lockdown',
                '└─ approve        Approve pending transactions'
            ],
            'version': [
                '🏷️  Aniki v0.1.0 (OpenClaw Hackathon)',
                '├─ Sui SDK: v1.15.0',
                '├─ Move Compiler: 1.28.0', 
                '├─ Security Level: Enterprise',
                '└─ Build: 2026-02-07T19:22:00Z'
            ]
        };
        
        const response = responses[command.toLowerCase()] || [
            `❌ Unknown command: ${command}`,
            '💡 Try "help" for available commands'
        ];
        
        for (const line of response) {
            await this.sleep(200);
            this.addLine(line, 'output');
        }
    }
}

// Interactive terminal functionality
class InteractiveTerminal {
    constructor() {
        this.history = [];
        this.historyIndex = 0;
        this.demo = new AnikiDemo();
        
        this.setupTerminal();
    }

    setupTerminal() {
        // Add input field to demo container if it doesn't exist
        const demoContainer = document.querySelector('.demo-container');
        if (!demoContainer) return;
        
        // Create interactive input
        const inputContainer = document.createElement('div');
        inputContainer.className = 'demo-input-container';
        inputContainer.style.cssText = `
            background: #1a1a1a;
            border-top: 1px solid #333;
            padding: 1rem 2rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        `;
        
        const prompt = document.createElement('span');
        prompt.textContent = '$ ';
        prompt.style.color = '#4FC3F7';
        prompt.style.fontFamily = 'Courier New, monospace';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter command (try: status, help, version)';
        input.style.cssText = `
            flex: 1;
            background: transparent;
            border: none;
            color: #e0e0e0;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            outline: none;
        `;
        
        inputContainer.appendChild(prompt);
        inputContainer.appendChild(input);
        demoContainer.appendChild(inputContainer);
        
        // Handle input events
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = input.value.trim();
                if (command) {
                    this.executeCommand(command);
                    this.history.push(command);
                    this.historyIndex = this.history.length;
                    input.value = '';
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    input.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    input.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    input.value = '';
                }
            }
        });
    }

    async executeCommand(command) {
        if (command === 'demo') {
            await this.demo.startDemo();
        } else if (command === 'clear') {
            const demoContent = document.getElementById('demoContent');
            if (demoContent) {
                demoContent.innerHTML = '';
            }
        } else {
            await this.demo.executeCommand(command);
        }
    }
}

// Performance metrics animation
class MetricsAnimation {
    constructor() {
        this.setupMetricsCounter();
    }

    setupMetricsCounter() {
        // Animate numbers when they come into view
        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateMetrics(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all metric numbers
        document.querySelectorAll('.stat-number').forEach(stat => {
            observer.observe(stat);
        });
    }

    animateMetrics(container) {
        const numbers = container.querySelectorAll('.stat-number');
        
        numbers.forEach(numberElement => {
            const finalValue = numberElement.textContent;
            const numericValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
            const suffix = finalValue.replace(/[\d.]/g, '');
            
            this.animateNumber(numberElement, 0, numericValue, 2000, suffix);
        });
    }

    animateNumber(element, start, end, duration, suffix = '') {
        const startTime = performance.now();
        
        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentValue = start + (end - start) * easeOutCubic;
            
            // Format based on the type of number
            let displayValue;
            if (suffix.includes('%')) {
                displayValue = currentValue.toFixed(1) + '%';
            } else if (suffix.includes('+')) {
                displayValue = Math.floor(currentValue) + '+';
            } else if (suffix.includes('$')) {
                displayValue = '$' + Math.floor(currentValue);
            } else {
                displayValue = currentValue % 1 === 0 ? 
                    Math.floor(currentValue).toString() : 
                    currentValue.toFixed(1);
                displayValue += suffix;
            }
            
            element.textContent = displayValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        };
        
        requestAnimationFrame(updateNumber);
    }
}

// Loading and performance optimization
class PageOptimizer {
    constructor() {
        this.setupLazyLoading();
        this.optimizeAnimations();
    }

    setupLazyLoading() {
        // Lazy load images and heavy content
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    optimizeAnimations() {
        // Reduce animations for users who prefer reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
            
            // Add CSS to disable animations
            const style = document.createElement('style');
            style.textContent = `
                .reduced-motion * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize demo functionality
    window.anikiDemo = new AnikiDemo();
    
    // Setup interactive terminal
    new InteractiveTerminal();
    
    // Setup metrics animation
    new MetricsAnimation();
    
    // Setup performance optimizations
    new PageOptimizer();
    
    // Add enhanced demo button functionality
    const demoButton = document.querySelector('button[onclick="startDemo()"]');
    if (demoButton) {
        demoButton.onclick = () => window.anikiDemo.startDemo();
        demoButton.innerHTML = '<i class="fas fa-terminal"></i> Start Interactive Demo';
    }
});

// Enhanced demo function for global access
function startDemo() {
    if (window.anikiDemo) {
        window.anikiDemo.startDemo();
    }
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AnikiDemo, InteractiveTerminal, MetricsAnimation, PageOptimizer };
}