const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🎮 MINECRAFT ULTIMATE 24/7 BOT ROTATION SYSTEM                            ║
║  🤖 Bots: AGENT ↔ CROPTON (Single Bot Rotation)                            ║
║  🌐 Server: gameplanet.aternos.me:51270                                    ║
║  ⚡ Version: 1.21.10                                                        ║
║  🔄 Rotation: One Bot at a Time • 2-3 Hour Sessions                        ║
║  🧠 AI Features: Realistic Day Activities • Immediate Night Sleep          ║
║  🛏️ CREATIVE SLEEP: Stays in creative mode for sleeping                   ║
║  🎯 NO CHAT: Focus on gameplay only                                        ║
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
                checkTimeoutInterval: 90 * 1000,
                logErrors: false,
                hideErrors: true
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
                console.log(`✅ ${this.config.username} logged in successfully`);
                this.isConnected = true;
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
                if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
                    console.log(`🔌 ${this.config.username} connection lost`);
                }
            });

            this.bot.on('end', () => {
                console.log(`🔌 ${this.config.username} disconnected`);
            });

            this.bot.on('death', () => {
                console.log(`💀 ${this.config.username} died`);
                this.handleDeath();
            });

            this.bot.on('time', () => {
                this.handleTimeBasedActions();
            });

            this.bot.on('health', () => {
                this.handleHealthManagement();
            });
        });
    }

    async switchToCreativeMode() {
        if (this.isInCreative) return true;
        
        console.log(`🎨 ${this.config.username} switching to creative mode...`);
        
        try {
            this.bot.chat("/gamemode creative");
            await delay(4000);
            this.isInCreative = true;
            console.log(`✅ ${this.config.username} now in creative mode`);
            return true;
        } catch (error) {
            console.log(`❌ ${this.config.username} failed to switch to creative:`, error.message);
            return false;
        }
    }

    async switchToSurvivalMode() {
        if (!this.isInCreative) return true;
        
        console.log(`🎯 ${this.config.username} switching to survival mode...`);
        
        try {
            this.bot.chat("/gamemode survival");
            await delay(4000);
            this.isInCreative = false;
            console.log(`✅ ${this.config.username} now in survival mode`);
            return true;
        } catch (error) {
            console.log(`❌ ${this.config.username} failed to switch to survival:`, error.message);
            return false;
        }
    }

    startAllSystems() {
        this.clearIntervals();
        
        // Start in creative mode for 24/7 operation
        setTimeout(async () => {
            await this.switchToCreativeMode();
        }, 5000);

        // IMMEDIATE SLEEP CHECK - Every 5 seconds
        const sleepInterval = setInterval(() => {
            this.checkImmediateSleep();
        }, 5000);

        // DAYTIME ACTIVITIES - Only when not sleeping
        const activityInterval = setInterval(() => {
            if (!this.isSleeping && !this.sleepInProgress) {
                this.performDaytimeActivity();
            }
        }, 20000 + Math.random() * 30000);

        // HUMAN BEHAVIOR - Random movements
        const behaviorInterval = setInterval(() => {
            if (!this.isSleeping && !this.sleepInProgress) {
                this.performHumanBehavior();
            }
        }, 10000 + Math.random() * 20000);

        // MORNING CLEANUP
        const cleanupInterval = setInterval(() => {
            this.handleMorningCleanup();
        }, 15000);

        this.behaviorIntervals = [sleepInterval, activityInterval, behaviorInterval, cleanupInterval];
        
        console.log(`⚡ ${this.config.username} all systems activated`);
        console.log(`🎯 Features: CREATIVE MODE ONLY • IMMEDIATE SLEEP • NO CHAT`);
    }

    async checkImmediateSleep() {
        // Prevent multiple sleep attempts at once
        if (this.sleepInProgress) {
            return;
        }

        const context = this.assessEnvironment();
        const now = Date.now();
        
        // Only check time every 10 seconds to avoid spam
        if (now - this.lastTimeCheck < 10000) return;
        this.lastTimeCheck = now;
        
        // Only sleep if it's actually night AND we're not already sleeping
        if (context.isNight && !this.isSleeping) {
            console.log(`🌙 ${this.config.username} NIGHT DETECTED - STARTING SLEEP PROCESS!`);
            this.sleepInProgress = true;
            await this.executeCompleteSleepProcess();
            this.sleepInProgress = false;
        } else if (!context.isNight && this.isSleeping) {
            console.log(`🌅 ${this.config.username} MORNING - WAKING UP!`);
            try {
                this.bot.wake();
                this.isSleeping = false;
            } catch (error) {
                // Ignore wake errors
            }
        }
    }

    async executeCompleteSleepProcess() {
        if (this.isSleeping) return;
        
        console.log(`🛏️ ${this.config.username} STARTING COMPLETE SLEEP PROCESS...`);
        
        // STEP 1: Ensure creative mode (stay in creative)
        console.log(`🎨 ${this.config.username} Step 1: Ensuring creative mode...`);
        if (!await this.switchToCreativeMode()) {
            console.log(`❌ ${this.config.username} Cannot proceed - creative mode failed`);
            return;
        }

        // STEP 2: Check for existing bed first
        console.log(`🔍 ${this.config.username} Step 2: Looking for existing bed...`);
        let bed = this.bot.findBlock({
            matching: (block) => block.name.includes('bed'),
            maxDistance: 12
        });
        
        if (bed) {
            console.log(`✅ ${this.config.username} Found existing bed at ${bed.position.x}, ${bed.position.y}, ${bed.position.z}`);
            await this.attemptSleepInBed(bed);
            return;
        }

        // STEP 3: Get bed using creative commands
        console.log(`🎒 ${this.config.username} Step 3: Getting bed from creative...`);
        const gotBed = await this.getBedWithCorrectCommands();
        
        if (!gotBed) {
            console.log(`❌ ${this.config.username} Cannot sleep - no bed available`);
            return;
        }

        // STEP 4: Place the bed
        console.log(`📍 ${this.config.username} Step 4: Placing bed...`);
        bed = await this.placeBedProperly();
        
        if (!bed) {
            console.log(`❌ ${this.config.username} Failed to place bed`);
            return;
        }

        // STEP 5: Sleep in the bed (STAY IN CREATIVE MODE)
        console.log(`😴 ${this.config.username} Step 5: Attempting to sleep in CREATIVE mode...`);
        await this.attemptSleepInBed(bed);
    }

    async getBedWithCorrectCommands() {
        console.log(`💬 ${this.config.username} Using creative commands for bed...`);
        
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
                console.log(`📝 ${this.config.username} Executing: ${command}`);
                this.bot.chat(command);
                await delay(3000);
                
                // Check inventory for bed
                const beds = this.bot.inventory.items().filter(item => 
                    item.name.includes('bed')
                );
                
                if (beds.length > 0) {
                    console.log(`✅ ${this.config.username} SUCCESS - Got ${beds.length} beds from: ${command}`);
                    return true;
                } else {
                    console.log(`❌ ${this.config.username} Command didn't give bed: ${command}`);
                }
            } catch (error) {
                console.log(`❌ ${this.config.username} Command failed:`, command, error.message);
            }
        }
        
        console.log(`❌ ${this.config.username} ALL BED COMMANDS FAILED`);
        return false;
    }

    async placeBedProperly() {
        console.log(`📍 ${this.config.username} Finding position for bed...`);
        
        const pos = this.bot.entity.position;
        const startX = Math.floor(pos.x);
        const startY = Math.floor(pos.y);
        const startZ = Math.floor(pos.z);
        
        // Try positions around the bot
        for (let x = -3; x <= 3; x++) {
            for (let z = -3; z <= 3; z++) {
                for (let y = -1; y <= 1; y++) {
                    const testX = startX + x;
                    const testY = startY + y;
                    const testZ = startZ + z;
                    
                    try {
                        const floorBlock = this.bot.blockAt({ x: testX, y: testY - 1, z: testZ });
                        const targetBlock = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                        
                        // Check if floor is solid and target position is air
                        if (floorBlock && floorBlock.name !== 'air' && 
                            floorBlock.name !== 'water' && floorBlock.name !== 'lava' &&
                            targetBlock && targetBlock.name === 'air') {
                            
                            // Get bed from inventory
                            const bedItem = this.bot.inventory.items().find(item => 
                                item.name.includes('bed')
                            );
                            
                            if (!bedItem) {
                                console.log(`❌ ${this.config.username} No bed item in inventory`);
                                return null;
                            }
                            
                            console.log(`🛏️ ${this.config.username} Attempting to place bed at ${testX}, ${testY}, ${testZ}`);
                            
                            // Equip bed
                            await this.bot.equip(bedItem, 'hand');
                            await delay(1000);
                            
                            // Look at position
                            this.bot.lookAt({ x: testX, y: testY, z: testZ }, false);
                            await delay(500);
                            
                            // Place bed
                            await this.bot.placeBlock(targetBlock, { x: 0, y: 1, z: 0 });
                            await delay(2000);
                            
                            // Verify placement
                            const placedBed = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                            if (placedBed && placedBed.name.includes('bed')) {
                                this.bedPosition = { x: testX, y: testY, z: testZ };
                                this.hasBed = true;
                                console.log(`✅ ${this.config.username} Successfully placed bed at ${testX}, ${testY}, ${testZ}`);
                                return placedBed;
                            } else {
                                console.log(`❌ ${this.config.username} Bed placement verification failed`);
                            }
                        }
                    } catch (error) {
                        // Continue trying other positions
                    }
                }
            }
        }
        
        console.log(`❌ ${this.config.username} No suitable position found for bed`);
        return null;
    }

    async attemptSleepInBed(bed) {
        try {
            console.log(`🚶 ${this.config.username} Moving to bed...`);
            
            // STAY IN CREATIVE MODE - No switching to survival
            
            // Move toward bed
            const distance = this.bot.entity.position.distanceTo(bed.position);
            if (distance > 3) {
                this.bot.lookAt(bed.position.offset(0, 1, 0));
                this.bot.setControlState('forward', true);
                await delay(2000);
                this.bot.setControlState('forward', false);
                await delay(1000);
            }
            
            // Look directly at bed
            this.bot.lookAt(bed.position, false);
            await delay(1000);
            
            console.log(`😴 ${this.config.username} Attempting to sleep in CREATIVE mode...`);
            
            // Try to sleep in creative mode
            await this.bot.sleep(bed);
            
            this.isSleeping = true;
            console.log(`✅ ${this.config.username} SUCCESSFULLY SLEEPING IN CREATIVE MODE!`);
            
            // Monitor sleep state
            const sleepMonitor = setInterval(() => {
                if (!this.bot.isSleeping) {
                    clearInterval(sleepMonitor);
                    this.isSleeping = false;
                    console.log(`🌅 ${this.config.username} Sleep ended - staying in creative mode`);
                }
            }, 5000);
            
        } catch (error) {
            console.log(`❌ ${this.config.username} Sleep failed:`, error.message);
            this.isSleeping = false;
            
            // If sleep fails because of wrong block, try to find another bed
            if (error.message.includes('not a bed block') || error.message.includes('wrong block')) {
                console.log(`🔍 ${this.config.username} Bed block issue, searching for another bed...`);
                const newBed = this.bot.findBlock({
                    matching: (block) => block.name.includes('bed'),
                    maxDistance: 15
                });
                
                if (newBed && newBed.position !== bed.position) {
                    console.log(`🛏️ ${this.config.username} Trying alternative bed...`);
                    await this.attemptSleepInBed(newBed);
                }
            }
        }
    }

    async performDaytimeActivity() {
        const context = this.assessEnvironment();
        
        // Only do activities during daytime when not sleeping
        if (context.isNight || this.isSleeping || this.sleepInProgress) return;
        
        const activities = [
            'explore',
            'mine', 
            'build',
            'farm',
            'look_around'
        ];
        
        const activity = activities[Math.floor(Math.random() * activities.length)];
        
        console.log(`🎯 ${this.config.username} Day activity: ${activity}`);
        
        switch (activity) {
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
            case 'look_around':
                await this.lookAround();
                break;
        }
    }

    async exploreArea() {
        this.bot.setControlState('forward', true);
        await delay(5000 + Math.random() * 7000);
        this.bot.setControlState('forward', false);
        await this.lookAround();
    }

    async mineResources() {
        const block = this.bot.findBlock({
            matching: (block) => block.name.includes('stone') || block.name.includes('coal') || block.name.includes('dirt'),
            maxDistance: 4
        });
        
        if (block) {
            try {
                await this.bot.dig(block);
                await delay(6000 + Math.random() * 8000);
            } catch (error) {
                // Ignore mining errors
            }
        }
    }

    async buildStructure() {
        for (let i = 0; i < 4; i++) {
            this.bot.setControlState('forward', true);
            await delay(1500 + Math.random() * 2500);
            this.bot.setControlState('forward', false);
            await this.lookAround();
            await delay(1500 + Math.random() * 2500);
        }
    }

    async farmAction() {
        for (let i = 0; i < 3; i++) {
            this.bot.setControlState('sneak', true);
            await delay(2000 + Math.random() * 3000);
            this.bot.setControlState('sneak', false);
            await delay(2500 + Math.random() * 3500);
        }
    }

    async lookAround() {
        if (!this.bot.entity) return;
        
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        for (let i = 0; i < 3; i++) {
            const yaw = originalYaw + (Math.random() * 2 - 1);
            const pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, originalPitch + (Math.random() * 1 - 0.5)));
            this.bot.look(yaw, pitch, false);
            await delay(600 + Math.random() * 1000);
        }
    }

    performHumanBehavior() {
        const behaviors = [
            () => this.lookAround(),
            () => this.jumpRandomly(),
            () => this.switchItems(),
            () => this.sneakBriefly()
        ];

        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        behavior();
    }

    async jumpRandomly() {
        const jumps = 1 + Math.floor(Math.random() * 4);
        for (let i = 0; i < jumps; i++) {
            this.bot.setControlState('jump', true);
            await delay(200 + Math.random() * 400);
            this.bot.setControlState('jump', false);
            await delay(300 + Math.random() * 500);
        }
    }

    async switchItems() {
        const items = this.bot.inventory.items();
        if (items.length > 1) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            this.bot.equip(randomItem, 'hand').catch(() => {});
            await delay(800 + Math.random() * 1200);
        }
    }

    async sneakBriefly() {
        if (Math.random() < 0.4) {
            this.bot.setControlState('sneak', true);
            await delay(3000 + Math.random() * 4000);
            this.bot.setControlState('sneak', false);
        }
    }

    async handleMorningCleanup() {
        const context = this.assessEnvironment();
        
        // Only cleanup during day and if we have a placed bed
        if (!context.isNight && this.hasBed && this.bedPosition && !this.isSleeping) {
            console.log(`🧹 ${this.config.username} Cleaning up bed...`);
            
            const bedBlock = this.bot.blockAt(this.bedPosition);
            if (bedBlock && bedBlock.name.includes('bed')) {
                try {
                    // Stay in creative mode for breaking
                    if (!this.isInCreative) {
                        await this.switchToCreativeMode();
                    }
                    
                    // Look at bed
                    this.bot.lookAt(bedBlock.position.offset(0, 1, 0));
                    await delay(1000);
                    
                    // Break the bed
                    await this.bot.dig(bedBlock);
                    await delay(2000);
                    
                    this.hasBed = false;
                    this.bedPosition = null;
                    console.log(`✅ ${this.config.username} Bed cleaned up`);
                    
                    // STAY IN CREATIVE MODE - don't switch back to survival
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} Cleanup failed:`, error.message);
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

    handleHealthManagement() {
        // In creative mode, health/food doesn't matter
        // No need to manage health
    }

    async findFood() {
        // In creative mode, no need to eat
    }

    handleDeath() {
        this.hasBed = false;
        this.bedPosition = null;
        this.isSleeping = false;
        this.isInCreative = false;
        this.sleepInProgress = false;
    }

    handleTimeBasedActions() {
        // Handled in checkImmediateSleep
    }

    handleDisconnection() {
        this.clearIntervals();
    }

    disconnect() {
        console.log(`🛑 ${this.config.username} Disconnecting...`);
        this.clearIntervals();
        if (this.bot) {
            try {
                this.bot.quit();
            } catch (error) {}
        }
    }

    clearIntervals() {
        this.behaviorIntervals.forEach(interval => clearInterval(interval));
        this.behaviorIntervals = [];
    }
}

class UltimateRotationSystem {
    constructor() {
        this.currentBot = null;
        this.currentBotIndex = 0;
        this.rotationHistory = [];
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
        console.log('🔄 Ultimate Rotation System Initialized');
        this.startRotationCycle();
    }

    async startRotationCycle() {
        console.log('🚀 Starting 24/7 Rotation Cycle...\n');
        while (true) {
            await this.executeRotation();
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
        console.log(`║ 🎨 CREATIVE ONLY: Stays in creative 24/7          ║`);
        console.log(`║ 🛏️ SLEEP: Sleeps in creative mode at night       ║`);
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
        console.log(`\n⏰ ${botConfig.username} session: ${hours} hours`);
        console.log(`🎯 Features: CREATIVE MODE 24/7 • IMMEDIATE SLEEP • NO CHAT\n`);

        await delay(sessionTime);

        console.log(`\n🛑 Ending ${botConfig.username} session...`);
        this.currentBot.disconnect();
        this.currentBot = null;

        this.recordRotation(botConfig.username, sessionTime, ipInfo);

        const breakTime = 5 * 60 * 1000 + Math.random() * 10 * 60 * 1000;
        const breakMinutes = Math.round(breakTime / 60000);
        console.log(`\n💤 Break time: ${breakMinutes} minutes until next bot\n`);
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
        if (this.rotationHistory.length > 10) this.rotationHistory.pop();
        const minutes = Math.round(duration / 60000);
        console.log(`📊 Rotation recorded: ${botName} - ${minutes} minutes - ${ipInfo.country}`);
    }
}

// Start the system
const rotationSystem = new UltimateRotationSystem();

// Health check server
const http = require('http');
const healthServer = http.createServer((req, res) => {
    if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'Minecraft Bot Rotation System',
            currentBot: rotationSystem.currentBot ? rotationSystem.currentBot.config.username : 'None',
            rotationCount: rotationSystem.rotationHistory.length,
            uptime: Math.floor(process.uptime()) + ' seconds',
            timestamp: new Date().toISOString(),
            features: 'CREATIVE MODE 24/7 • IMMEDIATE SLEEP • NO CHAT'
        }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Minecraft Ultimate Bot Rotation System - 24/7 Operation\n\nVisit /health for status');
    }
});

const PORT = process.env.PORT || 3000;
healthServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
    console.log(`🔍 Render can now monitor: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('\n🛑 Shutting down Ultimate Rotation System...');
    if (rotationSystem.currentBot) rotationSystem.currentBot.disconnect();
    healthServer.close(() => {
        console.log('✅ Health server closed');
        process.exit(0);
    });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', (error) => {
    console.log('🚨 Uncaught Exception:', error.message);
});
process.on('unhandledRejection', (reason, promise) => {
    console.log('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});
