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
║  🛏️ WORKING SLEEP: Proper creative inventory access                       ║
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
        
        this.setupBotBehavior();
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

    setupBotBehavior() {
        // No chat phrases - focus on gameplay only
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
                
                // Switch to creative mode immediately for bed access
                setTimeout(async () => {
                    await this.switchToCreativeMode();
                }, 3000);
                
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
            await delay(3000);
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
            await delay(3000);
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
        
        // IMMEDIATE SLEEP CHECK - Every 3 seconds
        const sleepInterval = setInterval(() => {
            this.checkImmediateSleep();
        }, 3000);

        // DAYTIME ACTIVITIES - Only when not sleeping
        const activityInterval = setInterval(() => {
            if (!this.isSleeping) {
                this.performDaytimeActivity();
            }
        }, 15000 + Math.random() * 25000);

        // HUMAN BEHAVIOR - Random movements
        const behaviorInterval = setInterval(() => {
            if (!this.isSleeping) {
                this.performHumanBehavior();
            }
        }, 8000 + Math.random() * 15000);

        // MORNING CLEANUP
        const cleanupInterval = setInterval(() => {
            this.handleMorningCleanup();
        }, 10000);

        this.behaviorIntervals = [sleepInterval, activityInterval, behaviorInterval, cleanupInterval];
        
        console.log(`⚡ ${this.config.username} all systems activated`);
        console.log(`🎯 Features: IMMEDIATE SLEEP • REALISTIC DAY ACTIVITIES • NO CHAT`);
    }

    async checkImmediateSleep() {
        const context = this.assessEnvironment();
        const now = Date.now();
        
        // Only check time every 5 seconds to avoid spam
        if (now - this.lastTimeCheck < 5000) return;
        this.lastTimeCheck = now;
        
        // Only sleep if it's actually night AND we're not already sleeping
        if (context.isNight && !this.isSleeping) {
            console.log(`🌙 ${this.config.username} NIGHT DETECTED - SLEEPING IMMEDIATELY!`);
            await this.executeImmediateSleep();
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

    async executeImmediateSleep() {
        if (this.isSleeping) return;
        
        console.log(`🛏️ ${this.config.username} EXECUTING IMMEDIATE SLEEP...`);
        
        // Step 1: Ensure creative mode for bed access
        await this.switchToCreativeMode();
        
        // Step 2: Check for existing bed within 15 blocks
        let bed = this.bot.findBlock({
            matching: (block) => block.name.includes('bed'),
            maxDistance: 15
        });
        
        if (bed) {
            console.log(`✅ ${this.config.username} found existing bed`);
            await this.sleepInBed(bed);
            return;
        }
        
        // Step 3: Get bed using creative commands (simpler approach)
        console.log(`🎒 ${this.config.username} getting bed...`);
        const gotBed = await this.getBedSimple();
        
        if (gotBed) {
            // Step 4: Place bed immediately
            console.log(`🛏️ ${this.config.username} placing bed...`);
            bed = await this.placeBedSimple();
            
            if (bed) {
                await this.sleepInBed(bed);
            } else {
                console.log(`❌ ${this.config.username} failed to place bed`);
            }
        } else {
            console.log(`❌ ${this.config.username} no bed available`);
        }
    }

    async getBedSimple() {
        // Simple approach: Use creative commands to get bed
        console.log(`💬 ${this.config.username} using creative commands for bed...`);
        
        const commands = [
            "/give @s bed 1",
            "/give @s white_bed 1",
            "/give @s red_bed 1",
            "/give @s black_bed 1"
        ];
        
        for (const command of commands) {
            try {
                this.bot.chat(command);
                await delay(2000);
                
                // Check if we got a bed in inventory
                const hasBed = this.bot.inventory.items().some(item => 
                    item.name.includes('bed')
                );
                
                if (hasBed) {
                    console.log(`✅ ${this.config.username} got bed from: ${command}`);
                    return true;
                }
            } catch (error) {
                console.log(`❌ ${this.config.username} command failed:`, command);
            }
        }
        
        return false;
    }

    async placeBedSimple() {
        console.log(`📍 ${this.config.username} finding bed position...`);
        
        const pos = this.bot.entity.position;
        const startX = Math.floor(pos.x);
        const startY = Math.floor(pos.y);
        const startZ = Math.floor(pos.z);
        
        // Simple placement: try positions around the bot
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                const testX = startX + x;
                const testZ = startZ + z;
                const testY = startY;
                
                try {
                    const floorBlock = this.bot.blockAt({ x: testX, y: testY - 1, z: testZ });
                    const targetBlock = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                    
                    if (floorBlock && floorBlock.name !== 'air' && targetBlock && targetBlock.name === 'air') {
                        
                        // Get bed item from inventory
                        const bedItem = this.bot.inventory.items().find(item => 
                            item.name.includes('bed')
                        );
                        
                        if (!bedItem) {
                            console.log(`❌ ${this.config.username} no bed item to place`);
                            return null;
                        }
                        
                        // Equip and place bed
                        await this.bot.equip(bedItem, 'hand');
                        this.bot.lookAt({ x: testX, y: testY, z: testZ }, false);
                        await this.bot.placeBlock(targetBlock, { x: 0, y: 1, z: 0 });
                        await delay(1000);
                        
                        // Verify placement
                        const placedBed = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                        if (placedBed && placedBed.name.includes('bed')) {
                            this.bedPosition = { x: testX, y: testY, z: testZ };
                            this.hasBed = true;
                            console.log(`✅ ${this.config.username} bed placed at ${testX}, ${testY}, ${testZ}`);
                            return placedBed;
                        }
                    }
                } catch (error) {
                    // Continue trying other positions
                }
            }
        }
        
        console.log(`❌ ${this.config.username} no suitable position found`);
        return null;
    }

    async sleepInBed(bed) {
        try {
            console.log(`🚶 ${this.config.username} moving to bed...`);
            
            // Switch to survival for sleeping
            await this.switchToSurvivalMode();
            
            // Move toward bed
            this.bot.lookAt(bed.position.offset(0, 1, 0));
            this.bot.setControlState('forward', true);
            await delay(1500);
            this.bot.setControlState('forward', false);
            await delay(500);
            
            console.log(`😴 ${this.config.username} sleeping...`);
            await this.bot.sleep(bed);
            
            this.isSleeping = true;
            console.log(`✅ ${this.config.username} SLEEPING SUCCESSFULLY`);
            
        } catch (error) {
            console.log(`❌ ${this.config.username} sleep failed:`, error.message);
            this.isSleeping = false;
        }
    }

    async performDaytimeActivity() {
        const context = this.assessEnvironment();
        
        // Only do activities during daytime
        if (context.isNight || this.isSleeping) return;
        
        const activities = [
            'explore',
            'mine', 
            'build',
            'farm'
        ];
        
        const activity = activities[Math.floor(Math.random() * activities.length)];
        
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
        }
    }

    async exploreArea() {
        console.log(`🧭 ${this.config.username} exploring...`);
        
        this.bot.setControlState('forward', true);
        await delay(4000 + Math.random() * 6000);
        this.bot.setControlState('forward', false);
        
        await this.lookAround();
        await delay(2000 + Math.random() * 3000);
    }

    async mineResources() {
        console.log(`⛏️ ${this.config.username} mining...`);
        
        const block = this.bot.findBlock({
            matching: (block) => block.name.includes('stone') || block.name.includes('coal') || block.name.includes('dirt'),
            maxDistance: 4
        });
        
        if (block) {
            try {
                await this.bot.dig(block);
                await delay(5000 + Math.random() * 7000);
            } catch (error) {
                // Ignore mining errors
            }
        }
    }

    async buildStructure() {
        console.log(`🏗️ ${this.config.username} building...`);
        
        for (let i = 0; i < 3; i++) {
            this.bot.setControlState('forward', true);
            await delay(1000 + Math.random() * 2000);
            this.bot.setControlState('forward', false);
            
            await this.lookAround();
            await delay(1000 + Math.random() * 2000);
        }
    }

    async farmAction() {
        console.log(`🌱 ${this.config.username} farming...`);
        
        for (let i = 0; i < 2; i++) {
            this.bot.setControlState('sneak', true);
            await delay(1500 + Math.random() * 2000);
            this.bot.setControlState('sneak', false);
            await delay(2000 + Math.random() * 3000);
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

    async lookAround() {
        if (!this.bot.entity) return;
        
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        for (let i = 0; i < 2; i++) {
            const yaw = originalYaw + (Math.random() * 1.5 - 0.75);
            const pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, originalPitch + (Math.random() * 0.8 - 0.4)));
            this.bot.look(yaw, pitch, false);
            await delay(400 + Math.random() * 800);
        }
    }

    async jumpRandomly() {
        const jumps = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < jumps; i++) {
            this.bot.setControlState('jump', true);
            await delay(150 + Math.random() * 300);
            this.bot.setControlState('jump', false);
            await delay(200 + Math.random() * 400);
        }
    }

    async switchItems() {
        const items = this.bot.inventory.items();
        if (items.length > 1) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            this.bot.equip(randomItem, 'hand').catch(() => {});
            await delay(500 + Math.random() * 1000);
        }
    }

    async sneakBriefly() {
        if (Math.random() < 0.3) {
            this.bot.setControlState('sneak', true);
            await delay(2000 + Math.random() * 3000);
            this.bot.setControlState('sneak', false);
        }
    }

    async handleMorningCleanup() {
        const context = this.assessEnvironment();
        
        // Only cleanup during day and if we have a placed bed
        if (!context.isNight && this.hasBed && this.bedPosition) {
            console.log(`🧹 ${this.config.username} cleaning up bed...`);
            
            const bedBlock = this.bot.blockAt(this.bedPosition);
            if (bedBlock && bedBlock.name.includes('bed')) {
                try {
                    await this.switchToCreativeMode();
                    await this.bot.dig(bedBlock);
                    await delay(1000);
                    
                    this.hasBed = false;
                    this.bedPosition = null;
                    console.log(`✅ ${this.config.username} bed cleaned up`);
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} cleanup failed:`, error.message);
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
        if (this.bot.food < 15) {
            this.findFood();
        }
    }

    async findFood() {
        const food = this.bot.inventory.items().find(item => 
            item.name.includes('apple') || item.name.includes('bread') || item.name.includes('cooked')
        );
        
        if (food) {
            try {
                await this.bot.equip(food, 'hand');
                await this.bot.consume();
            } catch (error) {
                // Ignore eating errors
            }
        }
    }

    handleDeath() {
        this.hasBed = false;
        this.bedPosition = null;
        this.isSleeping = false;
    }

    handleTimeBasedActions() {
        // Handled in checkImmediateSleep
    }

    handleDisconnection() {
        this.clearIntervals();
    }

    disconnect() {
        console.log(`🛑 ${this.config.username} disconnecting...`);
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
        console.log(`║ 🛏️ IMMEDIATE SLEEP: No chat, focus on gameplay   ║`);
        console.log(`║ 🎯 REALISTIC: Day activities like real player     ║`);
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
        console.log(`🎯 Features: NO CHAT • IMMEDIATE SLEEP • REALISTIC DAY ACTIVITIES\n`);

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
            features: 'NO CHAT • IMMEDIATE SLEEP • REALISTIC ACTIVITIES'
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
