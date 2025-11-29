const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🎮 ULTIMATE 24/7 ATERNOS BOT SYSTEM                                       ║
║  🤖 Bots: AGENT ↔ CROPTON (24/7 Aternos Proven)                           ║
║  🌐 Server: gameplanet.aternos.me:51270                                    ║
║  ⚡ Version: 1.21.10                                                        ║
║  🔄 24/7 PROVEN: Advanced Anti-AFK • Server Activity Simulation           ║
║  🛡️ ATERNOS OPTIMIZED: Prevents Auto-Shutdown • Mimics Real Players      ║
║  🎨 PERMANENT CREATIVE: Gamemode Protection                               ║
║  🛏️ SMART SLEEP: Advanced Bed Management                                  ║
║  🕒 TRUE 24/7: Continuous Aternos Operation                               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

// Global delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

class UltimateBot {
    constructor(config) {
        this.config = config;
        this.bot = null;
        this.isConnected = false;
        this.behaviorIntervals = [];
        this.lastSleepAttempt = 0;
        this.hasBed = false;
        this.bedPosition = null;
        this.isSleeping = false;
        this.isInCreative = true;
        this.lastTimeCheck = 0;
        this.sleepInProgress = false;
        this.bedPlaceAttempts = 0;
        this.lastBedCheck = 0;
        this.occupiedBeds = new Set();
        this.lastGamemodeCheck = 0;
        this.gamemodeProtectionEnabled = true;
        this.creativeEnforcementAttempts = 0;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 1000; // Much higher for 24/7
        this.reconnectDelay = 3000; // Faster reconnection
        this.serverUptimeStart = Date.now();
        this.lastActivityTime = Date.now();
        this.activityCounter = 0;
        
        console.log(`🤖 ${this.config.username} initialized for 24/7 ATERNOS OPERATION`);
    }

    async initialize() {
        try {
            console.log(`🚀 Initializing ${this.config.username} for 24/7 operation...`);
            console.log(`🔗 Connecting to: ${this.config.host}:${this.config.port}`);
            
            this.bot = mineflayer.createBot({
                host: this.config.host,
                port: this.config.port,
                username: this.config.username,
                version: this.config.version,
                auth: 'offline',
                checkTimeoutInterval: 60 * 1000,
                logErrors: true,
                hideErrors: false,
                physicsEnabled: true
            });

            await this.setupEventHandlers();
            return true;

        } catch (error) {
            console.log(`❌ Failed to initialize ${this.config.username}:`, error.message);
            return false;
        }
    }

    setupEventHandlers() {
        return new Promise((resolve) => {
            const loginTimeout = setTimeout(() => {
                console.log(`⏰ ${this.config.username} login timeout`);
                resolve(false);
            }, 45000);

            this.bot.on('login', () => {
                clearTimeout(loginTimeout);
                console.log(`✅ ${this.config.username} logged in successfully - 24/7 MODE ACTIVATED`);
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.reconnectDelay = 3000;
                this.serverUptimeStart = Date.now();
                
                setTimeout(async () => {
                    await this.enforceCreativeMode();
                }, 3000);
                
                resolve(true);
            });

            this.bot.on('spawn', () => {
                console.log(`🎯 ${this.config.username} spawned in world - 24/7 SYSTEMS STARTING`);
                this.start24_7Systems();
            });

            this.bot.on('kicked', (reason) => {
                const uptimeHours = Math.round((Date.now() - this.serverUptimeStart) / 3600000 * 10) / 10;
                console.log(`🚫 ${this.config.username} KICKED after ${uptimeHours}h:`, reason.toString());
                console.log(`🔄 ${this.config.username} scheduling ULTRA-FAST reconnect...`);
                this.handleDisconnection();
                
                setTimeout(() => {
                    this.ultraFastReconnect();
                }, 1000); // Even faster reconnection
            });

            this.bot.on('end', (reason) => {
                const uptimeHours = Math.round((Date.now() - this.serverUptimeStart) / 3600000 * 10) / 10;
                console.log(`🔌 ${this.config.username} SERVER DISCONNECTED after ${uptimeHours}h:`, reason || 'Aternos maintenance?');
                console.log(`🔄 ${this.config.username} scheduling aggressive reconnect...`);
                this.handleDisconnection();
                
                setTimeout(() => {
                    this.ultraFastReconnect();
                }, this.reconnectDelay);
            });

            this.bot.on('error', (err) => {
                console.log(`🔌 ${this.config.username} connection error:`, err.message);
            });

            this.bot.on('game', (packet) => {
                try {
                    if (packet && typeof packet.gameMode === 'number') {
                        this.handleGamemodeChange(packet.gameMode);
                    }
                } catch (error) {
                    // Silent error handling
                }
            });

            this.bot.on('death', () => {
                console.log(`💀 ${this.config.username} died - respawning...`);
                this.handleDeath();
            });

            this.bot.on('time', () => {
                this.handleTimeBasedActions();
            });

            resolve(true);
        });
    }

    start24_7Systems() {
        this.clearIntervals();
        
        setTimeout(async () => {
            await this.enforceCreativeMode();
        }, 2000);

        // 🎯 ENHANCED 24/7 ACTIVITY SYSTEMS

        // 1. ULTRA-FAST GAMEMODE PROTECTION
        const gamemodeInterval = setInterval(() => {
            this.checkGamemodeProtection();
        }, 10000); // Every 10 seconds

        // 2. ENHANCED SLEEP SYSTEM
        const sleepInterval = setInterval(() => {
            this.checkEnhancedSleep();
        }, 3000); // Faster sleep detection

        // 3. ADVANCED ANTI-AFK SYSTEM (Proven to work on Aternos)
        const antiAfkInterval = setInterval(() => {
            this.advancedAntiAFK();
        }, 15000 + Math.random() * 15000); // Random intervals

        // 4. SERVER ACTIVITY SIMULATION
        const activityInterval = setInterval(() => {
            this.simulateServerActivity();
        }, 30000 + Math.random() * 30000); // Server activity pulses

        // 5. REALISTIC DAYTIME ACTIVITIES
        const daytimeInterval = setInterval(() => {
            if (!this.isSleeping && !this.sleepInProgress && this.isInCreative) {
                this.performAdvancedDaytimeActivity();
            }
        }, 25000 + Math.random() * 35000);

        // 6. BED MANAGEMENT
        const bedInterval = setInterval(() => {
            this.handleBedManagement();
        }, 20000);

        // 7. UPTIME MONITORING
        const uptimeInterval = setInterval(() => {
            this.monitor24_7Uptime();
        }, 10 * 60 * 1000); // Every 10 minutes

        this.behaviorIntervals = [
            gamemodeInterval, sleepInterval, antiAfkInterval, 
            activityInterval, daytimeInterval, bedInterval, uptimeInterval
        ];
        
        console.log(`⚡ ${this.config.username} 24/7 SYSTEMS ACTIVATED`);
        console.log(`🎯 PROVEN ATERNOS FEATURES: Advanced Anti-AFK • Server Activity • 24/7 Operation`);
    }

    // 🎯 ADVANCED ANTI-AFK SYSTEM (Proven to keep Aternos online)
    advancedAntiAFK() {
        try {
            const activities = [
                () => this.complexLookAround(),
                () => this.randomMovement(),
                () => this.inventoryInteraction(),
                () => this.blockInteraction(),
                () => this.jumpSequence()
            ];

            const activity = activities[Math.floor(Math.random() * activities.length)];
            activity();
            
            this.activityCounter++;
            this.lastActivityTime = Date.now();
            
        } catch (error) {
            // Silent error handling for 24/7 stability
        }
    }

    complexLookAround() {
        if (!this.bot.entity) return;
        
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        // Complex looking patterns that mimic real players
        const lookSequence = [
            { yaw: originalYaw + (Math.random() * 2 - 1), pitch: originalPitch + (Math.random() * 0.5 - 0.25) },
            { yaw: originalYaw + (Math.random() * 3 - 1.5), pitch: originalPitch + (Math.random() * 0.8 - 0.4) },
            { yaw: originalYaw + (Math.random() * 1 - 0.5), pitch: originalPitch + (Math.random() * 0.3 - 0.15) }
        ];
        
        let sequenceIndex = 0;
        const executeLook = () => {
            if (sequenceIndex < lookSequence.length) {
                const look = lookSequence[sequenceIndex];
                this.bot.look(look.yaw, look.pitch, false);
                sequenceIndex++;
                setTimeout(executeLook, 200 + Math.random() * 300);
            }
        };
        executeLook();
    }

    randomMovement() {
        const movements = [
            { control: 'forward', duration: 800 + Math.random() * 1200 },
            { control: 'back', duration: 500 + Math.random() * 800 },
            { control: 'left', duration: 600 + Math.random() * 1000 },
            { control: 'right', duration: 700 + Math.random() * 900 },
            { control: 'sneak', duration: 1500 + Math.random() * 2000 }
        ];
        
        const movement = movements[Math.floor(Math.random() * movements.length)];
        this.bot.setControlState(movement.control, true);
        
        setTimeout(() => {
            this.bot.setControlState(movement.control, false);
        }, movement.duration);
    }

    inventoryInteraction() {
        const items = this.bot.inventory.items();
        if (items.length > 1) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            this.bot.equip(randomItem, 'hand').catch(() => {});
        }
    }

    blockInteraction() {
        // Simulate block looking/interaction
        const nearbyBlock = this.bot.findBlock({
            matching: (block) => block && block.name !== 'air',
            maxDistance: 4
        });
        
        if (nearbyBlock) {
            this.bot.lookAt(nearbyBlock.position, false);
        }
    }

    jumpSequence() {
        const jumps = 1 + Math.floor(Math.random() * 3);
        let jumpCount = 0;
        
        const doJump = () => {
            if (jumpCount < jumps) {
                this.bot.setControlState('jump', true);
                setTimeout(() => {
                    this.bot.setControlState('jump', false);
                    jumpCount++;
                    setTimeout(doJump, 100 + Math.random() * 200);
                }, 100 + Math.random() * 150);
            }
        };
        doJump();
    }

    // 🎯 SERVER ACTIVITY SIMULATION (Key for 24/7)
    simulateServerActivity() {
        try {
            // Force chunk loading by moving to different areas
            if (this.activityCounter % 5 === 0) {
                this.bot.setControlState('forward', true);
                setTimeout(() => {
                    this.bot.setControlState('forward', false);
                }, 2000 + Math.random() * 3000);
            }
            
            // Simulate player-like server interactions
            if (this.activityCounter % 8 === 0) {
                this.complexLookAround();
            }
            
        } catch (error) {
            // Silent handling for stability
        }
    }

    // 🎯 ENHANCED DAYTIME ACTIVITIES
    async performAdvancedDaytimeActivity() {
        const activities = [
            { type: 'explore', weight: 0.3, func: () => this.advancedExplore() },
            { type: 'mine', weight: 0.25, func: () => this.advancedMining() },
            { type: 'build', weight: 0.2, func: () => this.advancedBuilding() },
            { type: 'farm', weight: 0.15, func: () => this.advancedFarming() },
            { type: 'travel', weight: 0.1, func: () => this.longDistanceTravel() }
        ];
        
        const totalWeight = activities.reduce((sum, a) => sum + a.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedActivity = activities[0];
        
        for (const activity of activities) {
            random -= activity.weight;
            if (random <= 0) {
                selectedActivity = activity;
                break;
            }
        }
        
        console.log(`🎯 ${this.config.username} advanced activity: ${selectedActivity.type}`);
        await selectedActivity.func();
    }

    async advancedExplore() {
        // More complex exploration patterns
        const directions = ['forward', 'back', 'left', 'right'];
        const mainDir = directions[Math.floor(Math.random() * directions.length)];
        const secondaryDir = directions[Math.floor(Math.random() * directions.length)];
        
        this.bot.setControlState(mainDir, true);
        if (Math.random() < 0.3) this.bot.setControlState(secondaryDir, true);
        
        await delay(4000 + Math.random() * 5000);
        
        this.bot.setControlState(mainDir, false);
        this.bot.setControlState(secondaryDir, false);
        
        await this.complexLookAround();
    }

    async advancedMining() {
        const blocks = this.bot.findBlocks({
            matching: (block) => block && (
                block.name.includes('stone') || 
                block.name.includes('dirt') ||
                block.name.includes('wood') ||
                block.name.includes('sand')
            ),
            maxDistance: 6,
            count: 5
        });
        
        if (blocks.length > 0) {
            const targetBlock = this.bot.blockAt(blocks[Math.floor(Math.random() * blocks.length)]);
            if (targetBlock) {
                try {
                    this.bot.lookAt(targetBlock.position, false);
                    await delay(1000);
                    await this.bot.dig(targetBlock);
                    await delay(3000 + Math.random() * 4000);
                } catch (error) {
                    // Silent error handling
                }
            }
        }
    }

    async advancedBuilding() {
        // Simulate building behavior
        for (let i = 0; i < 4; i++) {
            this.bot.setControlState('forward', true);
            await delay(1200 + Math.random() * 1800);
            this.bot.setControlState('forward', false);
            
            await this.complexLookAround();
            await delay(800 + Math.random() * 1200);
            
            // Random jump while "building"
            if (Math.random() < 0.4) {
                this.bot.setControlState('jump', true);
                await delay(150);
                this.bot.setControlState('jump', false);
            }
        }
    }

    async advancedFarming() {
        // More complex farming simulation
        for (let i = 0; i < 3; i++) {
            this.bot.setControlState('sneak', true);
            await delay(1800 + Math.random() * 2200);
            this.bot.setControlState('sneak', false);
            
            // Look around while "farming"
            await this.complexLookAround();
            await delay(1200 + Math.random() * 1800);
        }
    }

    async longDistanceTravel() {
        // Simulate longer distance movement
        console.log(`🧭 ${this.config.username} embarking on long-distance travel`);
        
        this.bot.setControlState('forward', true);
        await delay(8000 + Math.random() * 12000); // Longer movement
        this.bot.setControlState('forward', false);
        
        // Complex looking around after travel
        await this.complexLookAround();
    }

    // 🎯 ULTRA-FAST RECONNECTION SYSTEM
    async ultraFastReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log(`💤 ${this.config.username} taking extended break after ${this.reconnectAttempts} attempts`);
            setTimeout(() => {
                this.reconnectAttempts = 0;
                this.ultraFastReconnect();
            }, 10 * 60 * 1000); // 10 minute break then retry
            return;
        }

        this.reconnectAttempts++;
        console.log(`🔗 ${this.config.username} ULTRA-FAST reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
        
        try {
            await this.initialize();
        } catch (error) {
            console.log(`❌ ${this.config.username} reconnection failed`);
            
            // Faster retry for Aternos
            this.reconnectDelay = Math.min(this.reconnectDelay * 1.2, 30000); // Max 30 seconds
            console.log(`⏳ Next reconnect in ${this.reconnectDelay/1000} seconds...`);
            
            setTimeout(() => {
                this.ultraFastReconnect();
            }, this.reconnectDelay);
        }
    }

    // 🎯 24/7 UPTIME MONITORING
    monitor24_7Uptime() {
        const currentUptime = Date.now() - this.serverUptimeStart;
        const uptimeHours = Math.round(currentUptime / 3600000 * 10) / 10;
        const activityMinutes = Math.round((Date.now() - this.lastActivityTime) / 60000);
        
        console.log(`📊 ${this.config.username} 24/7 STATUS:`);
        console.log(`   • Uptime: ${uptimeHours} hours`);
        console.log(`   • Activities: ${this.activityCounter}`);
        console.log(`   • Last activity: ${activityMinutes} minutes ago`);
        console.log(`   • Reconnect attempts: ${this.reconnectAttempts}`);
        
        // Auto-celebration for long uptime
        if (uptimeHours > 12) {
            console.log(`🎉 ${this.config.username} achieved ${uptimeHours}h uptime - 24/7 SUCCESS!`);
        }
    }

    // 🛡️ GAMEMODE PROTECTION (same as before but optimized)
    async enforceCreativeMode() {
        if (this.isInCreative && this.creativeEnforcementAttempts === 0) return true;
        
        this.creativeEnforcementAttempts++;
        
        try {
            const commands = [
                "/gamemode creative",
                "/gamemode c", 
                "/minecraft:gamemode creative"
            ];
            
            for (const command of commands) {
                try {
                    this.bot.chat(command);
                    await delay(2000); // Faster command execution
                    
                    this.isInCreative = true;
                    this.creativeEnforcementAttempts = 0;
                    return true;
                    
                } catch (error) {
                    // Silent error handling
                }
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // 🛏️ SLEEP SYSTEM (same as before but optimized)
    async checkEnhancedSleep() {
        if (this.sleepInProgress || !this.isInCreative) return;

        const context = this.assessEnvironment();
        const now = Date.now();
        
        if (now - this.lastTimeCheck < 5000) return; // Faster checking
        this.lastTimeCheck = now;
        
        if (context.isNight && !this.isSleepi
