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
║  🧠 AI Features: All Enabled • Auto-Sleep • Combat • Chat                  ║
║  🛏️ CREATIVE BEDS: Takes beds from creative inventory                      ║
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
        this.activities = [];
        this.chatCooldown = 0;
        this.behaviorIntervals = [];
        this.lastSleepAttempt = 0;
        this.lastCombatTime = 0;
        this.conversationHistory = [];
        this.sessionStartTime = Date.now();
        this.hasBed = false;
        this.bedPosition = null;
        this.sleepPriority = false;
        this.bedPlacementAttempts = 0;
        
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
        if (this.config.personality === 'agent') {
            this.chatPhrases = [
                "Agent reporting for duty!",
                "Mission: Explore and survive!",
                "Area secure!",
                "Proceeding with operations!",
                "Everything under control!",
                "Agent on duty!",
                "Securing the perimeter!",
                "All systems operational!",
                "Scanning area for resources!",
                "Mission parameters set!",
                "Hostile entities detected!",
                "Weapons ready for engagement!",
                "Tactical assessment complete!",
                "Moving to designated coordinates!"
            ];
            this.bedChat = [
                "Establishing sleeping quarters!",
                "Setting up camp for the night!",
                "Deploying tactical bedding!",
                "Preparing overnight position!",
                "Securing rest area!"
            ];
        } else {
            this.chatPhrases = [
                "Time to farm some crops!",
                "Harvest season approaching!",
                "Crops growing nicely!",
                "Farm life is wonderful!",
                "Planting new seeds today!",
                "Fresh produce coming up!",
                "Agricultural operations active!",
                "Green thumb activated!",
                "Perfect weather for farming!",
                "Soil quality excellent!",
                "Time to water the plants!",
                "Harvest looking good this year!",
                "Farm expansion in progress!",
                "Fresh vegetables for everyone!"
            ];
            this.bedChat = [
                "Time to set up a cozy bed!",
                "Preparing my sleeping spot!",
                "Setting up for a good night's rest!",
                "Making my bed for the night!",
                "Getting ready to sleep!"
            ];
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

            this.bot.on('message', (jsonMsg) => {
                const message = jsonMsg.toString();
                this.handleSmartChat(message);
            });

            this.bot.on('time', () => {
                this.handleTimeBasedActions();
            });

            this.bot.on('health', () => {
                this.handleHealthManagement();
            });
        });
    }

    startAllSystems() {
        this.clearIntervals();
        
        // Main AI Decision System
        const aiInterval = setInterval(() => {
            this.performAITask();
        }, 45000 + Math.random() * 90000);

        // Smart Chat System
        const chatInterval = setInterval(() => {
            if (Math.random() < 0.35 && this.chatCooldown <= Date.now()) {
                this.smartChat();
            }
        }, 120000 + Math.random() * 180000);

        // Human Behavior System
        const behaviorInterval = setInterval(() => {
            this.performHumanBehavior();
        }, 25000 + Math.random() * 50000);

        // Bed Management System
        const bedInterval = setInterval(() => {
            this.checkBedStatus();
        }, 35000);

        this.behaviorIntervals = [aiInterval, chatInterval, behaviorInterval, bedInterval];
        
        console.log(`⚡ ${this.config.username} all systems activated`);
        console.log(`🎯 Features: Creative Inventory Beds • Immediate Sleep • 24/7 Rotation`);
    }

    async performAITask() {
        const context = this.assessEnvironment();
        
        // Force sleep task if it's night and sleep priority is high
        if (context.isNight && this.sleepPriority) {
            console.log(`🌙 ${this.config.username} sleep priority activated - forcing sleep`);
            await this.autoSleep();
            return;
        }
        
        const task = this.chooseAITask(context);
        
        console.log(`🧠 ${this.config.username} AI decision: ${task}`);
        
        try {
            switch (task) {
                case 'explore':
                    await this.exploreArea();
                    break;
                case 'mine':
                    await this.mineResources();
                    break;
                case 'sleep':
                    await this.autoSleep();
                    break;
                case 'social':
                    await this.socialize();
                    break;
                case 'build':
                    await this.buildStructure();
                    break;
                case 'farm':
                    await this.farmAction();
                    break;
                case 'place_bed':
                    await this.placeBed();
                    break;
                case 'get_bed':
                    await this.getBedFromCreative();
                    break;
                default:
                    await this.exploreArea();
            }
            this.recordActivity(task);
        } catch (error) {
            console.log(`❌ ${this.config.username} task failed:`, error.message);
        }
    }

    chooseAITask(context) {
        const tasks = [];
        
        // Environment-based tasks
        if (context.isNight) {
            tasks.push({ task: 'sleep', weight: 0.95 });
            tasks.push({ task: 'place_bed', weight: 0.90 });
            tasks.push({ task: 'get_bed', weight: 0.85 });
            tasks.push({ task: 'mine', weight: 0.1 });
        } else {
            tasks.push({ task: 'explore', weight: 0.6 });
            tasks.push({ task: 'mine', weight: 0.5 });
            tasks.push({ task: 'farm', weight: 0.4 });
            tasks.push({ task: 'build', weight: 0.3 });
            tasks.push({ task: 'place_bed', weight: 0.5 });
            tasks.push({ task: 'get_bed', weight: 0.4 });
        }

        // Health-based tasks
        if (context.health < 8) {
            tasks.push({ task: 'eat', weight: 0.8 });
        } else if (context.food < 10) {
            tasks.push({ task: 'eat', weight: 0.7 });
        }

        // Social tasks
        if (context.nearbyPlayers > 0) {
            tasks.push({ task: 'social', weight: 0.3 });
        }

        const totalWeight = tasks.reduce((sum, t) => sum + (t.weight || 0), 0);
        if (totalWeight === 0) return 'explore';
        
        let random = Math.random() * totalWeight;
        
        for (const task of tasks) {
            if (!task.weight) continue;
            random -= task.weight;
            if (random <= 0) return task.task;
        }
        
        return 'explore';
    }

    async getBedFromCreative() {
        console.log(`🎨 ${this.config.username} getting bed from creative inventory...`);
        
        try {
            // Method 1: Try creative mode command
            this.safeChat("/gamemode creative");
            await delay(2000);
            
            // Method 2: Give bed command
            this.safeChat("/give @s minecraft:red_bed 1");
            await delay(2000);
            
            this.safeChat("/give @s bed 1");
            await delay(2000);
            
            // Method 3: Switch back to survival
            this.safeChat("/gamemode survival");
            await delay(2000);
            
            console.log(`✅ ${this.config.username} creative commands executed`);
            
        } catch (error) {
            console.log(`❌ ${this.config.username} creative commands failed:`, error.message);
        }
        
        // Check if we got beds
        return await this.checkForBedsInInventory();
    }

    async checkForBedsInInventory() {
        await delay(1000); // Wait for inventory update
        
        const beds = this.bot.inventory.items().filter(item => 
            item.name.includes('bed')
        );
        
        if (beds.length > 0) {
            console.log(`🛏️ ${this.config.username} found ${beds.length} beds in inventory`);
            return true;
        } else {
            console.log(`❌ ${this.config.username} no beds in inventory after creative commands`);
            return false;
        }
    }

    async placeBed() {
        console.log(`🛏️ ${this.config.username} attempting to place bed...`);
        
        // First, ensure we have a bed
        const hasBed = await this.checkForBedsInInventory();
        if (!hasBed) {
            console.log(`🎨 ${this.config.username} no bed available, getting from creative...`);
            const gotBed = await this.getBedFromCreative();
            if (!gotBed) {
                console.log(`❌ ${this.config.username} cannot place bed - creative commands not working`);
                return false;
            }
        }

        // Get bed from inventory
        const bedItem = this.bot.inventory.items().find(item => 
            item.name.includes('bed')
        );

        if (!bedItem) {
            console.log(`❌ ${this.config.username} bed not found in inventory`);
            return false;
        }

        // Find suitable position for bed near the bot
        const startX = Math.floor(this.bot.entity.position.x);
        const startY = Math.floor(this.bot.entity.position.y);
        const startZ = Math.floor(this.bot.entity.position.z);

        let bedPlaced = false;
        
        // Try positions in a 3x3 area around the bot
        for (let x = -2; x <= 2 && !bedPlaced; x++) {
            for (let z = -2; z <= 2 && !bedPlaced; z++) {
                const testX = startX + x;
                const testZ = startZ + z;
                
                // Check current Y level and one block above/below
                for (let yOffset = -1; yOffset <= 1 && !bedPlaced; yOffset++) {
                    const testY = startY + yOffset;
                    
                    try {
                        // Check if position is suitable
                        const floorBlock = this.bot.blockAt({ x: testX, y: testY - 1, z: testZ });
                        const targetBlock = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                        
                        if (floorBlock && floorBlock.name !== 'air' && 
                            targetBlock && targetBlock.name === 'air') {
                            
                            // Equip bed
                            await this.bot.equip(bedItem, 'hand');
                            await delay(1000);
                            
                            // Look at position
                            this.bot.lookAt({ x: testX, y: testY, z: testZ }, false);
                            await delay(500);
                            
                            // Place bed
                            await this.bot.placeBlock(targetBlock, { x: 0, y: 1, z: 0 });
                            await delay(2000);
                            
                            this.bedPosition = { x: testX, y: testY, z: testZ };
                            this.hasBed = true;
                            bedPlaced = true;
                            
                            console.log(`✅ ${this.config.username} placed bed at ${testX}, ${testY}, ${testZ}`);
                            
                            // Announce bed placement
                            if (this.chatCooldown <= Date.now()) {
                                const bedMessage = this.bedChat[Math.floor(Math.random() * this.bedChat.length)];
                                this.safeChat(bedMessage);
                                this.chatCooldown = Date.now() + 5000;
                            }
                            
                            break;
                        }
                    } catch (error) {
                        // Continue trying other positions
                    }
                }
            }
        }

        if (!bedPlaced) {
            console.log(`❌ ${this.config.username} could not place bed - no suitable location found`);
            
            // Last resort: Try creative placement command
            console.log(`🎨 ${this.config.username} trying creative placement...`);
            this.safeChat("/setblock ~ ~ ~ minecraft:red_bed");
            await delay(3000);
        }
        
        return bedPlaced;
    }

    async autoSleep() {
        const now = Date.now();
        if (now - this.lastSleepAttempt < 10000) return;
        
        this.lastSleepAttempt = now;
        const context = this.assessEnvironment();

        if (context.isNight) {
            console.log(`🌙 ${this.config.username} attempting to sleep...`);
            
            // First try to use existing bed
            let bed = null;
            if (this.hasBed && this.bedPosition) {
                bed = this.bot.blockAt(this.bedPosition);
                if (!bed || !bed.name.includes('bed')) {
                    this.hasBed = false;
                    this.bedPosition = null;
                    bed = null;
                }
            }
            
            // If no existing bed, look for nearby bed
            if (!bed) {
                bed = this.bot.findBlock({
                    matching: (block) => block.name.includes('bed'),
                    maxDistance: 10
                });
            }
            
            // If still no bed, place one immediately
            if (!bed) {
                console.log(`🛏️ ${this.config.username} no bed found, placing one...`);
                const bedPlaced = await this.placeBed();
                if (bedPlaced && this.bedPosition) {
                    bed = this.bot.blockAt(this.bedPosition);
                }
            }

            if (bed) {
                try {
                    // Move closer to bed if needed
                    const distance = this.bot.entity.position.distanceTo(bed.position);
                    if (distance > 2) {
                        console.log(`🚶 ${this.config.username} moving to bed (${Math.round(distance)} blocks away)`);
                        this.bot.lookAt(bed.position.offset(0, 1, 0));
                        this.bot.setControlState('forward', true);
                        await delay(2000);
                        this.bot.setControlState('forward', false);
                        await delay(1000);
                    }
                    
                    console.log(`😴 ${this.config.username} sleeping in bed`);
                    await this.bot.sleep(bed);
                    console.log(`✅ ${this.config.username} sleeping peacefully`);
                    
                    this.sleepPriority = true;
                    
                    // Sleep until morning
                    const sleepInterval = setInterval(() => {
                        if (!this.bot.isSleeping) {
                            clearInterval(sleepInterval);
                            this.sleepPriority = false;
                            console.log(`❌ ${this.config.username} sleep interrupted`);
                            return;
                        }
                        
                        const currentTime = this.bot.time ? this.bot.time.timeOfDay : 0;
                        if (currentTime < 1000) { // Morning
                            this.bot.wake();
                            clearInterval(sleepInterval);
                            this.sleepPriority = false;
                            console.log(`🌅 ${this.config.username} woke up at dawn`);
                        }
                    }, 5000);
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} couldn't sleep:`, error.message);
                    this.sleepPriority = false;
                }
            } else {
                console.log(`❌ ${this.config.username} no bed available for sleeping`);
                this.sleepPriority = true;
            }
        } else {
            this.sleepPriority = false;
        }
    }

    async exploreArea() {
        console.log(`🧭 ${this.config.username} exploring...`);
        
        this.bot.setControlState('forward', true);
        await delay(3000 + Math.random() * 5000);
        this.bot.setControlState('forward', false);
        
        await this.lookAround();
        await delay(2000 + Math.random() * 3000);
    }

    async mineResources() {
        console.log(`⛏️ ${this.config.username} mining...`);
        
        const block = this.bot.findBlock({
            matching: (block) => 
                block.name.includes('stone') || 
                block.name.includes('coal') ||
                block.name.includes('dirt'),
            maxDistance: 4
        });
        
        if (block) {
            try {
                await this.bot.dig(block);
                await delay(4000 + Math.random() * 5000);
            } catch (error) {
                // Ignore mining errors
            }
        }
    }

    async socialize() {
        const nearbyPlayers = Object.keys(this.bot.players).filter(name => 
            name !== this.bot.username
        );

        if (nearbyPlayers.length > 0) {
            console.log(`👥 ${this.config.username} socializing with ${nearbyPlayers.length} players`);
            
            if (Math.random() < 0.6 && this.chatCooldown <= Date.now()) {
                this.smartChat();
            }
        }
    }

    async buildStructure() {
        console.log(`🏗️ ${this.config.username} building...`);
        
        for (let i = 0; i < 4; i++) {
            this.bot.setControlState('forward', true);
            await delay(1000 + Math.random() * 2000);
            this.bot.setControlState('forward', false);
            
            await this.lookAround();
            await delay(1000 + Math.random() * 2000);
        }
    }

    async farmAction() {
        console.log(`🌱 ${this.config.username} farming...`);
        
        for (let i = 0; i < 3; i++) {
            this.bot.setControlState('sneak', true);
            await delay(1000 + Math.random() * 1500);
            this.bot.setControlState('sneak', false);
            
            await delay(1500 + Math.random() * 2500);
        }
    }

    async findFood() {
        console.log(`🍎 ${this.config.username} finding food...`);
        
        const food = this.bot.inventory.items().find(item => 
            item.name.includes('apple') || 
            item.name.includes('bread')
        );
        
        if (food) {
            try {
                await this.bot.equip(food, 'hand');
                await this.bot.consume();
                console.log(`🍽️ ${this.config.username} ate ${food.name}`);
            } catch (error) {
                // Ignore eating errors
            }
        }
    }

    async lookAround() {
        if (!this.bot.entity) return;
        
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        for (let i = 0; i < 3; i++) {
            const yaw = originalYaw + (Math.random() * 1.5 - 0.75);
            const pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, 
                originalPitch + (Math.random() * 0.8 - 0.4)));
            this.bot.look(yaw, pitch, false);
            await delay(300 + Math.random() * 600);
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
            await delay(100 + Math.random() * 200);
            this.bot.setControlState('jump', false);
            await delay(150 + Math.random() * 300);
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
        if (Math.random() < 0.25) {
            this.bot.setControlState('sneak', true);
            await delay(1500 + Math.random() * 2000);
            this.bot.setControlState('sneak', false);
        }
    }

    handleSmartChat(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes(this.config.username.toLowerCase())) {
            setTimeout(() => {
                if (this.chatCooldown <= Date.now()) {
                    const response = this.generateSmartResponse(message);
                    console.log(`💬 ${this.config.username} response: ${response}`);
                    this.safeChat(response);
                    this.chatCooldown = Date.now() + 4000;
                }
            }, 1000 + Math.random() * 2000);
        }
    }

    generateSmartResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (this.config.personality === 'agent') {
            if (lowerMessage.includes('help')) return "Agent assisting! Mission underway!";
            if (lowerMessage.includes('where')) return "Current position secured. Area patrolled.";
            if (lowerMessage.includes('sleep') || lowerMessage.includes('bed')) return "Establishing sleeping quarters!";
        } else {
            if (lowerMessage.includes('help')) return "I can help! What do you need?";
            if (lowerMessage.includes('farm')) return "I love farming! Crops growing well!";
            if (lowerMessage.includes('sleep') || lowerMessage.includes('bed')) return "Setting up my bed for the night!";
        }
        
        const responses = ['Hello!', 'Hi there!', 'Nice to see you!', 'What\'s up?'];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    smartChat() {
        if (this.chatCooldown > Date.now()) return;
        
        const context = this.assessEnvironment();
        let phrase;

        if (context.isNight) {
            phrase = this.config.personality === 'agent' 
                ? "Night patrol active. All sectors secure." 
                : "Peaceful night. Perfect for resting.";
        } else if (context.nearbyPlayers > 2) {
            phrase = this.config.personality === 'agent'
                ? "Multiple contacts detected. Monitoring."
                : "So many friendly players around today!";
        } else {
            phrase = this.chatPhrases[Math.floor(Math.random() * this.chatPhrases.length)];
        }

        console.log(`💬 ${this.config.username} chat: ${phrase}`);
        this.safeChat(phrase);
        this.chatCooldown = Date.now() + 4000;
    }

    safeChat(message) {
        if (typeof message === 'string' && message.trim().length > 0) {
            try {
                this.bot.chat(message);
            } catch (error) {
                console.log(`❌ ${this.config.username} chat error:`, error.message);
            }
        }
    }

    handleTimeBasedActions() {
        const context = this.assessEnvironment();
        
        if (context.isNight && !this.sleepPriority) {
            this.sleepPriority = true;
            console.log(`🌙 ${this.config.username} night detected, activating sleep priority`);
        }
        
        if (!context.isNight && this.bot.isSleeping) {
            this.bot.wake();
            this.sleepPriority = false;
        }
    }

    handleHealthManagement() {
        if (this.bot.food < 12) {
            this.findFood();
        }
    }

    handleDeath() {
        const deathMessages = this.config.personality === 'agent' 
            ? ["Mission failed! Will return!", "Tactical retreat! Regrouping!", "Agent down! Reinforcements needed!"]
            : ["Oh no! I'll be back!", "That hurt! Time to respawn!", "Back to farming soon!"];
        
        const message = deathMessages[Math.floor(Math.random() * deathMessages.length)];
        setTimeout(() => this.safeChat(message), 2000);
        
        // Reset bed status on death
        this.hasBed = false;
        this.bedPosition = null;
        this.sleepPriority = false;
    }

    checkBedStatus() {
        if (this.hasBed && this.bedPosition) {
            const bedBlock = this.bot.blockAt(this.bedPosition);
            if (!bedBlock || !bedBlock.name.includes('bed')) {
                console.log(`⚠️ ${this.config.username} bed missing at saved position`);
                this.hasBed = false;
                this.bedPosition = null;
            }
        }
        
        // Increase sleep priority as night approaches
        const context = this.assessEnvironment();
        if (context.isNight && !this.sleepPriority) {
            this.sleepPriority = true;
        }
    }

    assessEnvironment() {
        const time = this.bot.time ? this.bot.time.timeOfDay : 0;
        const isNight = time > 13000 && time < 23000;
        const nearbyPlayers = Object.keys(this.bot.players).length - 1;

        return {
            time,
            isNight,
            health: this.bot.health || 20,
            food: this.bot.food || 20,
            nearbyPlayers
        };
    }

    recordActivity(type) {
        this.activities.push({
            type,
            timestamp: new Date().toISOString()
        });
        
        if (this.activities.length > 50) {
            this.activities.shift();
        }
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
            } catch (error) {
                // Ignore quit errors
            }
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
        console.log(`║ 🛏️ Auto-Bed: Creative Inventory Access            ║`);
        console.log(`║ 🎯 Features: Immediate Sleep • 24/7 Operation     ║`);
        console.log(`╚══════════════════════════════════════════════════╝\n`);

        // Start bot session
        this.currentBot = new UltimateBot(botConfig);
        const connected = await this.currentBot.initialize();
        
        if (!connected) {
            console.log(`❌ Failed to connect ${botConfig.username}, retrying in 2 minutes`);
            await delay(120000);
            return;
        }

        // Calculate session time (2-3 hours)
        const sessionTime = botConfig.sessionDuration + (Math.random() * 60 * 60 * 1000);
        const hours = Math.round(sessionTime / 3600000 * 10) / 10;
        
        console.log(`\n⏰ ${botConfig.username} session: ${hours} hours`);
        console.log(`🎯 Activities: Creative Beds • Immediate Sleep • AI Behavior\n`);

        // Wait for session duration
        await delay(sessionTime);

        // End session
        console.log(`\n🛑 Ending ${botConfig.username} session...`);
        this.currentBot.disconnect();
        this.currentBot = null;

        // Record rotation
        this.recordRotation(botConfig.username, sessionTime, ipInfo);

        // Break between bots (5-15 minutes)
        const breakTime = 5 * 60 * 1000 + Math.random() * 10 * 60 * 1000;
        const breakMinutes = Math.round(breakTime / 60000);
        
        console.log(`\n💤 Break time: ${breakMinutes} minutes until next bot\n`);
        await delay(breakTime);

        // Move to next bot
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
        
        if (this.rotationHistory.length > 10) {
            this.rotationHistory.pop();
        }

        const minutes = Math.round(duration / 60000);
        console.log(`📊 Rotation recorded: ${botName} - ${minutes} minutes - ${ipInfo.country}`);
    }
}

// Start the ultimate rotation system
const rotationSystem = new UltimateRotationSystem();

// === HEALTH CHECK SERVER ===
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
            features: 'Creative Inventory Beds • Immediate Sleep • 24/7 Rotation'
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

// === GRACEFUL SHUTDOWN ===
const gracefulShutdown = async () => {
    console.log('\n🛑 Shutting down Ultimate Rotation System...');
    if (rotationSystem.currentBot) {
        rotationSystem.currentBot.disconnect();
    }
    healthServer.close(() => {
        console.log('✅ Health server closed');
        process.exit(0);
    });
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Global error handling
process.on('uncaughtException', (error) => {
    console.log('🚨 Uncaught Exception:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
});
