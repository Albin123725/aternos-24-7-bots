const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🎮 MINECRAFT ULTIMATE 24/7 BOT ROTATION SYSTEM                            ║
║  🤖 Bots: AGENT ↔ CROPTON (Single Bot Rotation)                            ║
║  🌐 Server: gameplanet.aternos.me:51270                                    ║
║  ⚡ Version: 1.21.10                                                        ║
║  🔄 Rotation: One Bot at a Time • 2-3 Hour Sessions                        ║
║  🧠 AI Features: All Enabled • Auto-Sleep • Combat • Chat                  ║
║  🛏️ CREATIVE INVENTORY: Uses creative mode beds directly                  ║
║  🎯 IMMEDIATE ACTION: Gets bed → Places → Sleeps in 30 seconds             ║
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
        this.isSleeping = false;
        this.isInCreative = false;
        
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
                "Creative inventory access! Getting bed!",
                "Using creative mode bedding!",
                "Creative tools activated for sleep setup!",
                "Deploying creative bed immediately!"
            ];
            this.morningChat = [
                "Mission resumed! Cleaning up bedding!",
                "Day operations beginning!",
                "Night shift complete! Breaking camp!"
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
                "Using creative magic for cozy bed!",
                "Creative mode for perfect sleeping spot!",
                "Getting creative bed for the night!",
                "Creative inventory bedding setup!"
            ];
            this.morningChat = [
                "Good morning! Time to start farming!",
                "Rise and shine! Another beautiful day!",
                "Morning has broken! Time to work!",
                "New day, new crops to tend!"
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
                
                // Switch to creative mode immediately
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

    async switchToCreativeMode() {
        if (this.isInCreative) return true;
        
        console.log(`🎨 ${this.config.username} switching to creative mode...`);
        
        try {
            this.safeChat("/gamemode creative");
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
            this.safeChat("/gamemode survival");
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

        // Main AI Decision System
        const aiInterval = setInterval(() => {
            if (!this.isSleeping) {
                this.performAITask();
            }
        }, 20000 + Math.random() * 40000);

        // Smart Chat System
        const chatInterval = setInterval(() => {
            if (Math.random() < 0.3 && this.chatCooldown <= Date.now() && !this.isSleeping) {
                this.smartChat();
            }
        }, 60000 + Math.random() * 90000);

        // Human Behavior System
        const behaviorInterval = setInterval(() => {
            if (!this.isSleeping) {
                this.performHumanBehavior();
            }
        }, 10000 + Math.random() * 20000);

        // Morning cleanup system
        const cleanupInterval = setInterval(() => {
            this.handleMorningCleanup();
        }, 10000);

        this.behaviorIntervals = [sleepInterval, aiInterval, chatInterval, behaviorInterval, cleanupInterval];
        
        console.log(`⚡ ${this.config.username} all systems activated`);
        console.log(`🎯 Features: CREATIVE INVENTORY • IMMEDIATE SLEEP • AUTO CLEANUP`);
    }

    async checkImmediateSleep() {
        const context = this.assessEnvironment();
        
        // FORCE SLEEP if it's night and we're not sleeping
        if (context.isNight && !this.isSleeping) {
            console.log(`🌙 ${this.config.username} NIGHT DETECTED - SLEEPING IMMEDIATELY!`);
            await this.executeImmediateSleep();
        }
        
        // Wake up if it's morning
        if (!context.isNight && this.isSleeping) {
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
        
        console.log(`🛏️ ${this.config.username} EXECUTING IMMEDIATE SLEEP PROTOCOL...`);
        
        // Step 1: Ensure we're in creative mode for bed access
        await this.switchToCreativeMode();
        
        // Step 2: Check for existing bed within 20 blocks
        let bed = this.bot.findBlock({
            matching: (block) => block.name.includes('bed'),
            maxDistance: 20
        });
        
        if (bed) {
            console.log(`✅ ${this.config.username} found existing bed nearby`);
            await this.sleepInBed(bed);
            return;
        }
        
        // Step 3: Get bed from creative inventory
        console.log(`🎒 ${this.config.username} getting bed from creative inventory...`);
        const gotBed = await this.getBedFromCreativeInventory();
        
        if (gotBed) {
            // Step 4: Place bed immediately
            console.log(`🛏️ ${this.config.username} placing new bed...`);
            bed = await this.placeBedImmediately();
            
            if (bed) {
                await this.sleepInBed(bed);
            } else {
                console.log(`❌ ${this.config.username} failed to place bed, retrying in 5 seconds`);
                setTimeout(() => this.executeImmediateSleep(), 5000);
            }
        } else {
            console.log(`❌ ${this.config.username} no bed in creative inventory, retrying in 5 seconds`);
            setTimeout(() => this.executeImmediateSleep(), 5000);
        }
    }

    async getBedFromCreativeInventory() {
        console.log(`🔍 ${this.config.username} searching creative inventory for beds...`);
        
        // All possible bed types in creative inventory
        const bedTypes = [
            'white_bed', 'orange_bed', 'magenta_bed', 'light_blue_bed', 
            'yellow_bed', 'lime_bed', 'pink_bed', 'gray_bed', 
            'light_gray_bed', 'cyan_bed', 'purple_bed', 'blue_bed', 
            'brown_bed', 'green_bed', 'red_bed', 'black_bed',
            'bed' // Generic bed as fallback
        ];
        
        // Try to find any bed in creative inventory
        for (const bedType of bedTypes) {
            try {
                // Look for the bed item in inventory
                const bedItem = this.bot.creative.items.find(item => 
                    item && item.name && item.name.includes(bedType)
                );
                
                if (bedItem) {
                    console.log(`✅ ${this.config.username} found ${bedType} in creative inventory`);
                    
                    // Try to equip the bed
                    try {
                        await this.bot.equip(bedItem, 'hand');
                        await delay(1000);
                        console.log(`✅ ${this.config.username} equipped ${bedType}`);
                        return true;
                    } catch (equipError) {
                        console.log(`❌ ${this.config.username} failed to equip ${bedType}:`, equipError.message);
                        continue;
                    }
                }
            } catch (error) {
                console.log(`❌ ${this.config.username} error searching for ${bedType}:`, error.message);
            }
        }
        
        // If no specific bed found, try any item with 'bed' in name
        try {
            const anyBed = this.bot.creative.items.find(item => 
                item && item.name && item.name.includes('bed')
            );
            
            if (anyBed) {
                console.log(`✅ ${this.config.username} found generic bed item`);
                await this.bot.equip(anyBed, 'hand');
                await delay(1000);
                return true;
            }
        } catch (error) {
            console.log(`❌ ${this.config.username} no beds found in creative inventory`);
        }
        
        return false;
    }

    async placeBedImmediately() {
        console.log(`📍 ${this.config.username} finding position for bed...`);
        
        const pos = this.bot.entity.position;
        const startX = Math.floor(pos.x);
        const startY = Math.floor(pos.y);
        const startZ = Math.floor(pos.z);
        
        // Try positions in expanding circles around the bot
        for (let radius = 1; radius <= 3; radius++) {
            for (let x = -radius; x <= radius; x++) {
                for (let z = -radius; z <= radius; z++) {
                    const testX = startX + x;
                    const testZ = startZ + z;
                    
                    // Try current Y level and one block above/below
                    for (let yOffset = -1; yOffset <= 1; yOffset++) {
                        const testY = startY + yOffset;
                        
                        try {
                            const floorBlock = this.bot.blockAt({ x: testX, y: testY - 1, z: testZ });
                            const targetBlock = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                            
                            // Check if position is suitable for bed
                            if (floorBlock && floorBlock.name !== 'air' && 
                                floorBlock.name !== 'water' && floorBlock.name !== 'lava' &&
                                targetBlock && targetBlock.name === 'air') {
                                
                                console.log(`✅ ${this.config.username} placing bed at ${testX}, ${testY}, ${testZ}`);
                                
                                // Look at the position
                                this.bot.lookAt({ x: testX, y: testY, z: testZ }, false);
                                await delay(500);
                                
                                // Place the bed
                                await this.bot.placeBlock(targetBlock, { x: 0, y: 1, z: 0 });
                                await delay(1000);
                                
                                // Verify bed was placed
                                const placedBed = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                                if (placedBed && placedBed.name.includes('bed')) {
                                    this.bedPosition = { x: testX, y: testY, z: testZ };
                                    this.hasBed = true;
                                    console.log(`✅ ${this.config.username} successfully placed bed`);
                                    return placedBed;
                                }
                            }
                        } catch (error) {
                            // Continue trying other positions
                        }
                    }
                }
            }
        }
        
        console.log(`❌ ${this.config.username} could not find suitable bed position`);
        return null;
    }

    async sleepInBed(bed) {
        try {
            console.log(`🚶 ${this.config.username} moving to bed...`);
            
            // Switch to survival mode for sleeping
            await this.switchToSurvivalMode();
            
            // Move toward bed
            this.bot.lookAt(bed.position.offset(0, 1, 0));
            this.bot.setControlState('forward', true);
            await delay(1500);
            this.bot.setControlState('forward', false);
            await delay(500);
            
            console.log(`😴 ${this.config.username} attempting to sleep...`);
            await this.bot.sleep(bed);
            
            this.isSleeping = true;
            console.log(`✅ ${this.config.username} SUCCESSFULLY SLEEPING!`);
            
            // Sleep announcement
            if (this.chatCooldown <= Date.now()) {
                const bedMessage = this.bedChat[Math.floor(Math.random() * this.bedChat.length)];
                this.safeChat(bedMessage);
                this.chatCooldown = Date.now() + 5000;
            }
            
        } catch (error) {
            console.log(`❌ ${this.config.username} sleep failed:`, error.message);
            this.isSleeping = false;
            
            // Try again in 3 seconds
            setTimeout(() => this.executeImmediateSleep(), 3000);
        }
    }

    async handleMorningCleanup() {
        const context = this.assessEnvironment();
        
        if (!context.isNight && this.hasBed && this.bedPosition) {
            console.log(`🧹 ${this.config.username} morning cleanup - breaking bed...`);
            
            const bedBlock = this.bot.blockAt(this.bedPosition);
            if (bedBlock && bedBlock.name.includes('bed')) {
                try {
                    // Switch to creative for breaking
                    await this.switchToCreativeMode();
                    
                    // Break the bed
                    await this.bot.dig(bedBlock);
                    await delay(1000);
                    
                    this.hasBed = false;
                    this.bedPosition = null;
                    console.log(`✅ ${this.config.username} broke bed`);
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} failed to break bed:`, error.message);
                }
            } else {
                this.hasBed = false;
                this.bedPosition = null;
            }
        }
        
        // Clean up any other placed blocks near the bot
        if (!context.isNight) {
            await this.cleanupNearbyBlocks();
        }
    }

    async cleanupNearbyBlocks() {
        const pos = this.bot.entity.position;
        const startX = Math.floor(pos.x);
        const startY = Math.floor(pos.y);
        const startZ = Math.floor(pos.z);
        
        // Check blocks in 5x5 area around bot
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                for (let y = -1; y <= 1; y++) {
                    const checkX = startX + x;
                    const checkY = startY + y;
                    const checkZ = startZ + z;
                    
                    try {
                        const block = this.bot.blockAt({ x: checkX, y: checkY, z: checkZ });
                        if (block && block.name !== 'air' && !block.name.includes('bed')) {
                            // Break non-bed blocks (dirt, etc.)
                            await this.bot.dig(block);
                            await delay(500);
                            console.log(`🧹 ${this.config.username} cleaned up ${block.name}`);
                        }
                    } catch (error) {
                        // Ignore cleanup errors
                    }
                }
            }
        }
    }

    async performAITask() {
        if (this.isSleeping) {
            return;
        }
        
        const context = this.assessEnvironment();
        
        // Don't do other tasks if it's night
        if (context.isNight) {
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
                case 'social':
                    await this.socialize();
                    break;
                case 'build':
                    await this.buildStructure();
                    break;
                case 'farm':
                    await this.farmAction();
                    break;
                default:
                    await this.exploreArea();
            }
        } catch (error) {
            console.log(`❌ ${this.config.username} task failed:`, error.message);
        }
    }

    chooseAITask(context) {
        const tasks = [
            { task: 'explore', weight: 0.6 },
            { task: 'mine', weight: 0.5 },
            { task: 'farm', weight: 0.4 },
            { task: 'build', weight: 0.3 },
            { task: 'social', weight: 0.2 }
        ];

        const totalWeight = tasks.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const task of tasks) {
            random -= task.weight;
            if (random <= 0) return task.task;
        }
        
        return 'explore';
    }

    async exploreArea() {
        console.log(`🧭 ${this.config.username} exploring...`);
        
        this.bot.setControlState('forward', true);
        await delay(3000 + Math.random() * 4000);
        this.bot.setControlState('forward', false);
        
        await this.lookAround();
        await delay(2000 + Math.random() * 3000);
    }

    async mineResources() {
        console.log(`⛏️ ${this.config.username} mining...`);
        
        const block = this.bot.findBlock({
            matching: (block) => block.name.includes('stone') || block.name.includes('coal'),
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
        const nearbyPlayers = Object.keys(this.bot.players).filter(name => name !== this.bot.username);
        if (nearbyPlayers.length > 0 && this.chatCooldown <= Date.now()) {
            this.smartChat();
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
            await delay(1000 + Math.random() * 1500);
            this.bot.setControlState('sneak', false);
            await delay(1500 + Math.random() * 2500);
        }
    }

    async lookAround() {
        if (!this.bot.entity) return;
        
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        for (let i = 0; i < 3; i++) {
            const yaw = originalYaw + (Math.random() * 1.5 - 0.75);
            const pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, originalPitch + (Math.random() * 0.8 - 0.4)));
            this.bot.look(yaw, pitch, false);
            await delay(300 + Math.random() * 600);
        }
    }

    performHumanBehavior() {
        if (this.isSleeping) return;
        
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
        const jumps = 1 + Math.floor(Math.random() * 3);
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
        if (Math.random() < 0.3) {
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
            if (lowerMessage.includes('sleep')) return "Using creative inventory for bedding!";
        } else {
            if (lowerMessage.includes('help')) return "I can help! What do you need?";
            if (lowerMessage.includes('sleep')) return "Creative mode beds are the best!";
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
                ? "Night operations! Creative bedding deployed!" 
                : "Peaceful night! Creative bed setup complete!";
        } else if (context.nearbyPlayers > 1) {
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
        // Handled in checkImmediateSleep
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
                console.log(`🍽️ ${this.config.username} ate ${food.name}`);
            } catch (error) {
                // Ignore eating errors
            }
        }
    }

    handleDeath() {
        const deathMessages = this.config.personality === 'agent' 
            ? ["Mission failed! Will return!", "Tactical retreat! Regrouping!"]
            : ["Oh no! I'll be back!", "That hurt! Time to respawn!"];
        
        const message = deathMessages[Math.floor(Math.random() * deathMessages.length)];
        setTimeout(() => this.safeChat(message), 2000);
        
        this.hasBed = false;
        this.bedPosition = null;
        this.sleepPriority = false;
        this.isSleeping = false;
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

// ... (RotationSystem remains the same as previous versions)

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
        console.log(`║ 🛏️ CREATIVE INVENTORY: Uses creative mode beds    ║`);
        console.log(`║ 🎯 IMMEDIATE: Sleeps within 30 seconds of night   ║`);
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
        console.log(`🎯 Features: CREATIVE INVENTORY • IMMEDIATE SLEEP • AUTO CLEANUP\n`);

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
            features: 'CREATIVE INVENTORY • IMMEDIATE SLEEP • AUTO CLEANUP'
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
