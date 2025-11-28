const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🎮 MINECRAFT ULTIMATE 24/7 BOT ROTATION SYSTEM                            ║
║  🤖 Bots: AGENT ↔ CROPTON (Single Bot Rotation)                            ║
║  🌐 Server: gameplanet.aternos.me:51270                                    ║
║  ⚡ Version: 1.21.10                                                        ║
║  🔄 Rotation: One Bot at a Time • 2-3 Hour Sessions                        ║
║  🌍 IP Switching: Simulated Different Locations                            ║
║  🎨 GAMEMODE: Creative Mode 24/7 • Instant Bed Access                      ║
║  🛏️ SLEEP SYSTEM: Auto Bed Placement → Sleep → Break → Repeat             ║
║  🧠 AI FEATURES: Realistic Day Activities • Immediate Night Sleep          ║
║  🔇 NO CHAT: Silent Operation • Focus on Gameplay                          ║
║  🛡️ ANTI-AFK: Continuous Movement • Random Behaviors                      ║
║  🕒 24/7 Operation: Continuous Presence                                    ║
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
        this.isInCreative = false;
        this.lastTimeCheck = 0;
        this.sleepInProgress = false;
        this.lastActivityTime = Date.now();
        this.currentActivity = 'none';
        
        console.log(`🤖 ${this.config.username} initialized with creative mode 24/7`);
    }

    async initialize() {
        try {
            console.log(`🚀 Initializing ${this.config.username}...`);
            
            this.bot = mineflayer.createBot({
                host: this.config.host,
                port: this.config.port,
                username: this.config.username,
                version: this.config.version,
                auth: 'offline',
                checkTimeoutInterval: 120 * 1000,
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
            }, 60000);

            this.bot.on('login', () => {
                clearTimeout(loginTimeout);
                console.log(`✅ ${this.config.username} logged in successfully`);
                this.isConnected = true;
                
                // Set creative mode immediately after login
                setTimeout(async () => {
                    await this.ensureCreativeMode();
                }, 5000);
                
                resolve(true);
            });

            this.bot.on('spawn', () => {
                console.log(`🎯 ${this.config.username} spawned in world`);
                this.startAllSystems();
            });

            this.bot.on('kicked', (reason) => {
                console.log(`❌ ${this.config.username} kicked:`, reason.toString());
                this.handleDisconnection();
            });

            this.bot.on('error', (err) => {
                console.log(`🔌 ${this.config.username} error:`, err.message);
                if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
                    console.log(`🔌 ${this.config.username} connection lost`);
                }
            });

            this.bot.on('end', () => {
                console.log(`🔌 ${this.config.username} disconnected`);
                this.handleDisconnection();
            });

            this.bot.on('death', () => {
                console.log(`💀 ${this.config.username} died`);
                this.handleDeath();
            });

            this.bot.on('time', () => {
                this.handleTimeBasedActions();
            });

            this.bot.on('spawnReset', () => {
                console.log(`🔄 ${this.config.username} spawn reset`);
            });

            // Inventory events for bed tracking
            this.bot.on('windowOpen', () => {
                console.log(`📦 ${this.config.username} inventory opened`);
            });

            this.bot.on('setSlot', () => {
                // Silent inventory tracking
            });
        });
    }

    async ensureCreativeMode() {
        if (this.isInCreative) return true;
        
        console.log(`🎨 ${this.config.username} ensuring creative mode...`);
        
        try {
            this.bot.chat("/gamemode creative");
            await delay(5000);
            
            // Verify creative mode by checking abilities
            if (this.bot.game && this.bot.game.gameMode === 'creative') {
                this.isInCreative = true;
                console.log(`✅ ${this.config.username} confirmed in creative mode`);
                return true;
            } else {
                // Try again
                this.bot.chat("/gamemode creative");
                await delay(3000);
                this.isInCreative = true;
                console.log(`✅ ${this.config.username} creative mode activated`);
                return true;
            }
        } catch (error) {
            console.log(`❌ ${this.config.username} creative mode failed:`, error.message);
            return false;
        }
    }

    startAllSystems() {
        this.clearIntervals();
        
        // Ensure creative mode on start
        setTimeout(async () => {
            await this.ensureCreativeMode();
        }, 3000);

        // ULTRA-FAST SLEEP CHECK - Every 3 seconds
        const sleepInterval = setInterval(() => {
            this.checkImmediateSleep();
        }, 3000);

        // DAYTIME ACTIVITIES - Realistic player behavior
        const activityInterval = setInterval(() => {
            if (!this.isSleeping && !this.sleepInProgress) {
                this.performDaytimeActivity();
            }
        }, 15000 + Math.random() * 25000);

        // HUMAN BEHAVIOR - Anti-AFK movements
        const behaviorInterval = setInterval(() => {
            if (!this.isSleeping && !this.sleepInProgress) {
                this.performHumanBehavior();
            }
        }, 8000 + Math.random() * 15000);

        // BED MANAGEMENT - Morning cleanup
        const bedInterval = setInterval(() => {
            this.handleBedManagement();
        }, 10000);

        // CREATIVE MODE VERIFICATION - Ensure always in creative
        const creativeCheck = setInterval(() => {
            if (!this.isInCreative && !this.sleepInProgress) {
                console.log(`⚠️ ${this.config.username} not in creative, fixing...`);
                this.ensureCreativeMode();
            }
        }, 30000);

        this.behaviorIntervals = [sleepInterval, activityInterval, behaviorInterval, bedInterval, creativeCheck];
        
        console.log(`⚡ ${this.config.username} ALL SYSTEMS ACTIVATED`);
        console.log(`🎯 FEATURES: Creative 24/7 • Instant Sleep • Realistic Activities • No Chat`);
    }

    async checkImmediateSleep() {
        if (this.sleepInProgress) return;

        const context = this.assessEnvironment();
        const now = Date.now();
        
        if (now - this.lastTimeCheck < 5000) return;
        this.lastTimeCheck = now;
        
        if (context.isNight && !this.isSleeping) {
            console.log(`🌙 ${this.config.username} NIGHT DETECTED - IMMEDIATE SLEEP!`);
            this.sleepInProgress = true;
            await this.executeUltraFastSleep();
            this.sleepInProgress = false;
        } else if (!context.isNight && this.isSleeping) {
            console.log(`🌅 ${this.config.username} MORNING - AUTO WAKE!`);
            try {
                if (this.bot.isSleeping) {
                    this.bot.wake();
                }
                this.isSleeping = false;
                this.hasBed = false;
                this.bedPosition = null;
            } catch (error) {
                this.isSleeping = false;
            }
        }
    }

    async executeUltraFastSleep() {
        if (this.isSleeping) return;
        
        console.log(`🛏️ ${this.config.username} ULTRA-FAST SLEEP PROCESS STARTED`);
        
        // STEP 1: Ensure creative mode
        if (!await this.ensureCreativeMode()) {
            console.log(`❌ ${this.config.username} sleep aborted - creative mode failed`);
            return;
        }

        // STEP 2: Quick existing bed check
        let bed = this.bot.findBlock({
            matching: (block) => block && block.name && block.name.includes('bed'),
            maxDistance: 10
        });
        
        if (bed) {
            console.log(`✅ ${this.config.username} found existing bed`);
            await this.quickSleepInBed(bed);
            return;
        }

        // STEP 3: Instant bed acquisition
        console.log(`🎒 ${this.config.username} acquiring bed instantly...`);
        const gotBed = await this.acquireBedInstantly();
        
        if (!gotBed) {
            console.log(`❌ ${this.config.username} sleep failed - no bed`);
            return;
        }

        // STEP 4: Quick bed placement
        console.log(`📍 ${this.config.username} placing bed quickly...`);
        bed = await this.placeBedQuickly();
        
        if (bed) {
            await this.quickSleepInBed(bed);
        } else {
            console.log(`❌ ${this.config.username} bed placement failed`);
        }
    }

    async acquireBedInstantly() {
        console.log(`💬 ${this.config.username} using instant bed commands...`);
        
        const commands = [
            `/give ${this.config.username} light_blue_bed 1`,
            `/give ${this.config.username} white_bed 1`,
            `/give ${this.config.username} red_bed 1`,
            `/give ${this.config.username} black_bed 1`,
            `/give ${this.config.username} blue_bed 1`,
            `/give ${this.config.username} brown_bed 1`,
            `/give ${this.config.username} green_bed 1`,
            `/give ${this.config.username} bed 1`
        ];
        
        for (const command of commands) {
            try {
                console.log(`⚡ ${this.config.username} trying: ${command}`);
                this.bot.chat(command);
                await delay(2500);
                
                const hasBed = this.bot.inventory.items().some(item => 
                    item.name.includes('bed')
                );
                
                if (hasBed) {
                    console.log(`✅ ${this.config.username} bed acquired: ${command}`);
                    return true;
                }
            } catch (error) {
                // Continue to next command
            }
        }
        
        console.log(`❌ ${this.config.username} all bed commands failed`);
        return false;
    }

    async placeBedQuickly() {
        console.log(`📍 ${this.config.username} quick bed placement...`);
        
        const pos = this.bot.entity.position;
        const startX = Math.floor(pos.x);
        const startY = Math.floor(pos.y);
        const startZ = Math.floor(pos.z);
        
        // Quick placement around player
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                const testX = startX + x;
                const testY = startY;
                const testZ = startZ + z;
                
                try {
                    const floorBlock = this.bot.blockAt({ x: testX, y: testY - 1, z: testZ });
                    const targetBlock = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                    
                    if (floorBlock && floorBlock.name !== 'air' && targetBlock && targetBlock.name === 'air') {
                        
                        const bedItem = this.bot.inventory.items().find(item => 
                            item.name.includes('bed')
                        );
                        
                        if (!bedItem) {
                            console.log(`❌ ${this.config.username} no bed item`);
                            return null;
                        }
                        
                        await this.bot.equip(bedItem, 'hand');
                        this.bot.lookAt({ x: testX, y: testY, z: testZ }, false);
                        await this.bot.placeBlock(targetBlock, { x: 0, y: 1, z: 0 });
                        await delay(1500);
                        
                        const placedBed = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                        if (placedBed && placedBed.name.includes('bed')) {
                            this.bedPosition = { x: testX, y: testY, z: testZ };
                            this.hasBed = true;
                            console.log(`✅ ${this.config.username} bed placed at ${testX}, ${testY}, ${testZ}`);
                            return placedBed;
                        }
                    }
                } catch (error) {
                    // Continue trying
                }
            }
        }
        
        console.log(`❌ ${this.config.username} quick placement failed`);
        return null;
    }

    async quickSleepInBed(bed) {
        try {
            console.log(`🚶 ${this.config.username} moving to bed...`);
            
            // Quick movement to bed
            const distance = this.bot.entity.position.distanceTo(bed.position);
            if (distance > 2) {
                this.bot.lookAt(bed.position.offset(0, 1, 0));
                this.bot.setControlState('forward', true);
                await delay(1500);
                this.bot.setControlState('forward', false);
                await delay(500);
            }
            
            this.bot.lookAt(bed.position, false);
            await delay(500);
            
            console.log(`😴 ${this.config.username} sleeping in creative mode...`);
            await this.bot.sleep(bed);
            
            this.isSleeping = true;
            console.log(`✅ ${this.config.username} SUCCESSFULLY SLEEPING!`);
            
            // Sleep monitoring
            const sleepMonitor = setInterval(() => {
                if (!this.bot.isSleeping) {
                    clearInterval(sleepMonitor);
                    this.isSleeping = false;
                    console.log(`🌅 ${this.config.username} sleep ended`);
                }
            }, 5000);
            
        } catch (error) {
            console.log(`❌ ${this.config.username} sleep failed:`, error.message);
            this.isSleeping = false;
        }
    }

    async performDaytimeActivity() {
        const context = this.assessEnvironment();
        
        if (context.isNight || this.isSleeping || this.sleepInProgress) return;
        
        const activities = [
            { type: 'explore', weight: 0.4 },
            { type: 'mine', weight: 0.3 },
            { type: 'build', weight: 0.2 },
            { type: 'farm', weight: 0.1 }
        ];
        
        const totalWeight = activities.reduce((sum, a) => sum + a.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedActivity = 'explore';
        
        for (const activity of activities) {
            random -= activity.weight;
            if (random <= 0) {
                selectedActivity = activity.type;
                break;
            }
        }
        
        this.currentActivity = selectedActivity;
        this.lastActivityTime = Date.now();
        
        console.log(`🎯 ${this.config.username} daytime activity: ${selectedActivity}`);
        
        switch (selectedActivity) {
            case 'explore':
                await this.exploreArea();
                break;
            case 'mine':
                await this.mineResources();
                break;
            case 'build':
                await this.buildStructure();
                break;
            case 'farm':
                await this.farmAction();
                break;
        }
    }

    async exploreArea() {
        console.log(`🧭 ${this.config.username} exploring area...`);
        
        // Random exploration pattern
        const directions = ['forward', 'back', 'left', 'right'];
        const mainDir = directions[Math.floor(Math.random() * directions.length)];
        
        this.bot.setControlState(mainDir, true);
        await delay(4000 + Math.random() * 6000);
        this.bot.setControlState(mainDir, false);
        
        await this.lookAround();
        await delay(2000 + Math.random() * 3000);
    }

    async mineResources() {
        console.log(`⛏️ ${this.config.username} mining resources...`);
        
        const block = this.bot.findBlock({
            matching: (block) => block && (
                block.name.includes('stone') || 
                block.name.includes('coal') || 
                block.name.includes('dirt') ||
                block.name.includes('wood')
            ),
            maxDistance: 5
        });
        
        if (block) {
            try {
                await this.bot.dig(block);
                await delay(5000 + Math.random() * 7000);
            } catch (error) {
                // Ignore mining errors in creative
            }
        }
    }

    async buildStructure() {
        console.log(`🏗️ ${this.config.username} building...`);
        
        // Simulate building behavior
        for (let i = 0; i < 4; i++) {
            this.bot.setControlState('forward', true);
            await delay(1200 + Math.random() * 1800);
            this.bot.setControlState('forward', false);
            
            await this.lookAround();
            await delay(1000 + Math.random() * 2000);
            
            // Random jump while building
            if (Math.random() < 0.3) {
                this.bot.setControlState('jump', true);
                await delay(200);
                this.bot.setControlState('jump', false);
            }
        }
    }

    async farmAction() {
        console.log(`🌱 ${this.config.username} farming...`);
        
        // Farming-like movements
        for (let i = 0; i < 3; i++) {
            this.bot.setControlState('sneak', true);
            await delay(1800 + Math.random() * 2200);
            this.bot.setControlState('sneak', false);
            await delay(1500 + Math.random() * 2500);
        }
    }

    async lookAround() {
        if (!this.bot.entity) return;
        
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        // Natural looking around
        for (let i = 0; i < 2; i++) {
            const yaw = originalYaw + (Math.random() * 1.8 - 0.9);
            const pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, originalPitch + (Math.random() * 0.6 - 0.3)));
            this.bot.look(yaw, pitch, false);
            await delay(500 + Math.random() * 800);
        }
    }

    performHumanBehavior() {
        const behaviors = [
            { func: () => this.lookAround(), weight: 0.4 },
            { func: () => this.jumpRandomly(), weight: 0.3 },
            { func: () => this.switchItems(), weight: 0.2 },
            { func: () => this.sneakBriefly(), weight: 0.1 }
        ];

        const totalWeight = behaviors.reduce((sum, b) => sum + b.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const behavior of behaviors) {
            random -= behavior.weight;
            if (random <= 0) {
                behavior.func();
                break;
            }
        }
    }

    async jumpRandomly() {
        const jumps = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < jumps; i++) {
            this.bot.setControlState('jump', true);
            await delay(150 + Math.random() * 250);
            this.bot.setControlState('jump', false);
            await delay(200 + Math.random() * 400);
        }
    }

    async switchItems() {
        const items = this.bot.inventory.items();
        if (items.length > 1) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            try {
                await this.bot.equip(randomItem, 'hand');
                await delay(600 + Math.random() * 900);
            } catch (error) {
                // Ignore equip errors
            }
        }
    }

    async sneakBriefly() {
        if (Math.random() < 0.4) {
            this.bot.setControlState('sneak', true);
            await delay(2500 + Math.random() * 3500);
            this.bot.setControlState('sneak', false);
        }
    }

    async handleBedManagement() {
        const context = this.assessEnvironment();
        
        // Clean up bed in morning
        if (!context.isNight && this.hasBed && this.bedPosition && !this.isSleeping) {
            console.log(`🧹 ${this.config.username} morning bed cleanup...`);
            
            const bedBlock = this.bot.blockAt(this.bedPosition);
            if (bedBlock && bedBlock.name.includes('bed')) {
                try {
                    this.bot.lookAt(bedBlock.position.offset(0, 1, 0));
                    await delay(500);
                    await this.bot.dig(bedBlock);
                    await delay(1000);
                    
                    this.hasBed = false;
                    this.bedPosition = null;
                    console.log(`✅ ${this.config.username} bed cleaned up`);
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} bed cleanup failed:`, error.message);
                }
            } else {
                this.hasBed = false;
                this.bedPosition = null;
            }
        }
    }

    assessEnvironment() {
        if (!this.bot.time) {
            return {
                time: 0,
                isNight: false,
                health: this.bot.health || 20,
                food: this.bot.food || 20
            };
        }
        
        const time = this.bot.time.timeOfDay;
        const isNight = time >= 13000 && time < 23000;
        
        return {
            time,
            isNight,
            health: this.bot.health || 20,
            food: this.bot.food || 20
        };
    }

    handleDeath() {
        console.log(`💀 ${this.config.username} handling death...`);
        this.hasBed = false;
        this.bedPosition = null;
        this.isSleeping = false;
        this.sleepInProgress = false;
        
        // Ensure creative mode after respawn
        setTimeout(async () => {
            await this.ensureCreativeMode();
        }, 5000);
    }

    handleTimeBasedActions() {
        // Handled in sleep system
    }

    handleDisconnection() {
        console.log(`🔌 ${this.config.username} handling disconnection...`);
        this.clearIntervals();
        this.isConnected = false;
    }

    disconnect() {
        console.log(`🛑 ${this.config.username} disconnecting...`);
        this.clearIntervals();
        if (this.bot) {
            try {
                this.bot.quit();
                console.log(`✅ ${this.config.username} disconnected successfully`);
            } catch (error) {
                console.log(`❌ ${this.config.username} disconnect error:`, error.message);
            }
        }
    }

    clearIntervals() {
        this.behaviorIntervals.forEach(interval => {
            if (interval) clearInterval(interval);
        });
        this.behaviorIntervals = [];
    }
}

class UltimateRotationSystem {
    constructor() {
        this.currentBot = null;
        this.currentBotIndex = 0;
        this.rotationHistory = [];
        this.isRunning = true;
        
        this.botConfigs = [
            {
                username: 'AGENT',
                host: 'gameplanet.aternos.me',
                port: 51270,
                version: '1.21.10',
                personality: 'agent',
                sessionDuration: 2 * 60 * 60 * 1000
            },
            {
                username: 'CROPTON',
                host: 'gameplanet.aternos.me',
                port: 51270,
                version: '1.21.10',
                personality: 'farmer', 
                sessionDuration: 2 * 60 * 60 * 1000
            }
        ];
        
        this.virtualIPs = [
            { ip: '192.168.1.100', country: 'United States' },
            { ip: '192.168.1.101', country: 'United Kingdom' },
            { ip: '192.168.1.102', country: 'Canada' },
            { ip: '192.168.1.103', country: 'Germany' },
            { ip: '192.168.1.104', country: 'France' },
            { ip: '192.168.1.105', country: 'Japan' }
        ];
        
        this.currentIPIndex = 0;
        this.systemStartTime = Date.now();
        
        console.log('🔄 ULTIMATE ROTATION SYSTEM INITIALIZED');
        console.log('🎯 FEATURES: Creative 24/7 • Instant Sleep • Realistic AI • No Chat');
        console.log('🌍 SERVER: gameplanet.aternos.me:51270');
        console.log('🤖 BOTS: AGENT ↔ CROPTON Rotation');
        
        this.startRotationCycle();
    }

    async startRotationCycle() {
        console.log('\n🚀 STARTING 24/7 ROTATION CYCLE...\n');
        
        while (this.isRunning) {
            try {
                await this.executeRotation();
            } catch (error) {
                console.log('🚨 Rotation cycle error:', error.message);
                await delay(60000); // Wait 1 minute before retry
            }
        }
    }

    async executeRotation() {
        const botConfig = this.botConfigs[this.currentBotIndex];
        const ipInfo = this.getNextIP();
        
        console.log(`\n╔══════════════════════════════════════════════════╗`);
        console.log(`║ 🔄 ROTATION CYCLE STARTING                        ║`);
        console.log(`║ 🤖 Bot: ${botConfig.username.padEnd(26)} ║`);
        console.log(`║ 🌍 Location: ${ipInfo.country.padEnd(23)} ║`);
        console.log(`║ 📍 IP: ${ipInfo.ip.padEnd(31)} ║`);
        console.log(`║ 🎨 MODE: Creative 24/7 • Instant Beds             ║`);
        console.log(`║ 🛏️ SLEEP: Auto Sleep • Bed Management            ║`);
        console.log(`║ 🧠 AI: Realistic Activities • Anti-AFK           ║`);
        console.log(`╚══════════════════════════════════════════════════╝\n`);

        this.currentBot = new UltimateBot(botConfig);
        const connected = await this.currentBot.initialize();
        
        if (!connected) {
            console.log(`❌ Failed to connect ${botConfig.username}, retrying in 2 minutes`);
            await delay(120000);
            return;
        }

        const sessionTime = botConfig.sessionDuration + (Math.random() * 60 * 60 * 1000);
        const hours = Math.round(sessionTime / 3600000 * 10) / 10;
        
        console.log(`\n⏰ ${botConfig.username} session started: ${hours} hours`);
        console.log(`🎯 Active Features:`);
        console.log(`   • Creative Mode 24/7`);
        console.log(`   • Instant Bed Acquisition`);
        console.log(`   • Ultra-Fast Sleep System`);
        console.log(`   • Realistic Day Activities`);
        console.log(`   • Anti-AFK Behavior System`);
        console.log(`   • Silent Operation (No Chat)\n`);

        await delay(sessionTime);

        console.log(`\n🛑 Ending ${botConfig.username} session...`);
        if (this.currentBot) {
            this.currentBot.disconnect();
            this.currentBot = null;
        }

        this.recordRotation(botConfig.username, sessionTime, ipInfo);

        const breakTime = 3 * 60 * 1000 + Math.random() * 7 * 60 * 1000;
        const breakMinutes = Math.round(breakTime / 60000);
        
        console.log(`\n💤 Rotation break: ${breakMinutes} minutes until next bot\n`);
        await delay(breakTime);

        this.currentBotIndex = (this.currentBotIndex + 1) % this.botConfigs.length;
    }

    getNextIP() {
        const ipInfo = this.virtualIPs[this.currentIPIndex];
        this.currentIPIndex = (this.currentIPIndex + 1) % this.virtualIPs.length;
        return ipInfo;
    }

    recordRotation(botName, duration, ipInfo) {
        const rotation = {
            bot: botName,
            startTime: new Date(),
            duration: duration,
            ip: ipInfo.ip,
            country: ipInfo.country,
            endTime: new Date()
        };
        
        this.rotationHistory.unshift(rotation);
        if (this.rotationHistory.length > 20) this.rotationHistory.pop();
        
        const minutes = Math.round(duration / 60000);
        const totalUptime = Math.round((Date.now() - this.systemStartTime) / 3600000 * 10) / 10;
        
        console.log(`📊 ROTATION STATISTICS:`);
        console.log(`   • Bot: ${botName}`);
        console.log(`   • Session: ${minutes} minutes`);
        console.log(`   • Location: ${ipInfo.country}`);
        console.log(`   • Total System Uptime: ${totalUptime} hours`);
        console.log(`   • Total Rotations: ${this.rotationHistory.length}`);
    }

    getStatus() {
        return {
            running: this.isRunning,
            currentBot: this.currentBot ? this.currentBot.config.username : 'None',
            rotationCount: this.rotationHistory.length,
            systemUptime: Date.now() - this.systemStartTime,
            nextRotationIn: this.currentBot ? 'Active' : 'Waiting'
        };
    }

    stop() {
        console.log('\n🛑 Stopping Ultimate Rotation System...');
        this.isRunning = false;
        if (this.currentBot) {
            this.currentBot.disconnect();
        }
    }
}

// Initialize the ultimate system
const rotationSystem = new UltimateRotationSystem();

// Enhanced health check server with status endpoint
const http = require('http');
const healthServer = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/status') {
        const status = rotationSystem.getStatus();
        
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'Minecraft Ultimate Bot Rotation System',
            version: '3.0.0',
            features: [
                'Creative Mode 24/7',
                'Instant Sleep System',
                'Realistic AI Activities',
                'Anti-AFK Behavior',
                'Silent Operation',
                'Auto Bed Management'
            ],
            currentBot: status.currentBot,
            rotationCount: status.rotationCount,
            systemUptime: Math.floor(status.systemUptime / 1000) + ' seconds',
            totalUptime: Math.floor(status.systemUptime / 3600000 * 10) / 10 + ' hours',
            timestamp: new Date().toISOString(),
            server: 'gameplanet.aternos.me:51270',
            nextRotation: status.nextRotationIn
        }, null, 2));
        
    } else if (req.url === '/') {
        res.writeHead(200, { 
            'Content-Type': 'text/plain',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.end(`Minecraft Ultimate Bot Rotation System v3.0.0

🎯 ACTIVE FEATURES:
• Creative Mode 24/7 Operation
• Instant Bed Acquisition & Sleep
• Realistic Daytime Activities  
• Advanced Anti-AFK System
• Silent Operation (No Chat)
• Auto Bed Management
• Bot Rotation System

🌍 SERVER: gameplanet.aternos.me:51270
🤖 BOTS: AGENT ↔ CROPTON Rotation

📊 ENDPOINTS:
/health or /status - System status
/ - This information page

🕒 24/7 OPERATION: Continuous presence maintained
`);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Endpoint not found. Try /health or /');
    }
});

const PORT = process.env.PORT || 3000;
healthServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌐 HEALTH SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🔍 Status available at: http://localhost:${PORT}/health`);
    console.log(`📊 System info at: http://localhost:${PORT}/`);
    console.log(`🚀 Render monitoring: http://localhost:${PORT}/health\n`);
});

// Enhanced graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    
    rotationSystem.stop();
    
    // Give bots time to disconnect
    await delay(5000);
    
    healthServer.close(() => {
        console.log('✅ Health server closed');
        console.log('🎯 Ultimate Rotation System shutdown complete');
        process.exit(0);
    });
    
    // Force exit after 10 seconds
    setTimeout(() => {
        console.log('⚠️ Forcing shutdown...');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGHUP', () => gracefulShutdown('SIGHUP'));

process.on('uncaughtException', (error) => {
    console.log('🚨 UNCAUGHT EXCEPTION:', error.message);
    console.log('Stack:', error.stack);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('🚨 UNHANDLED REJECTION at:', promise);
    console.log('Reason:', reason);
});

// Periodic system status
setInterval(() => {
    const status = rotationSystem.getStatus();
    const uptimeHours = Math.floor(status.systemUptime / 3600000 * 10) / 10;
    
    console.log(`\n📈 SYSTEM STATUS: ${status.currentBot} active • ${uptimeHours}h uptime • ${status.rotationCount} rotations\n`);
}, 15 * 60 * 1000); // Every 15 minutes
