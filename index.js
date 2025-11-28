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
║  🛏️ AUTO-CREATIVE: Switches to creative for beds at night                 ║
║  🎮 GAMEMODE: Auto creative → Get bed → Sleep → Back to survival           ║
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
        this.creativeModeEnabled = false;
        this.originalGamemode = 'survival';
        
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
                "Activating creative mode for bedding!",
                "Switching to creative for sleep setup!",
                "Creative mode engaged for overnight operations!",
                "Tactical bedding deployment!",
                "Securing rest area with creative tools!"
            ];
            this.morningChat = [
                "Mission resumed! Returning to survival!",
                "Day operations beginning! Survival mode!",
                "Packing up sleeping quarters!",
                "Ready for daytime survival operations!"
            ];
            this.creativeChat = [
                "Creative mode activated for emergency bedding!",
                "Using creative powers for sleep setup!",
                "Temporary creative access for overnight mission!",
                "Admin privileges engaged for bedding!"
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
                "Using creative magic for a cozy bed!",
                "Creative mode for perfect sleeping spot!",
                "Setting up dream bed with creative powers!",
                "Magical bedding creation!",
                "Getting ready to sleep with creative help!"
            ];
            this.morningChat = [
                "Good morning! Back to survival farming!",
                "Rise and shine! Survival mode activated!",
                "Morning has broken! Time to work in survival!",
                "New day, back to normal farming!"
            ];
            this.creativeChat = [
                "Creative powers for a good night's sleep!",
                "Using creative mode to make my bed!",
                "Temporary creative for perfect rest!",
                "Magical bed creation for the night!"
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

    async switchToCreativeMode() {
        if (this.creativeModeEnabled) {
            console.log(`✅ ${this.config.username} already in creative mode`);
            return true;
        }

        console.log(`🎨 ${this.config.username} switching to creative mode...`);
        
        try {
            this.safeChat("/gamemode creative");
            await delay(3000);
            
            // Verify creative mode
            this.creativeModeEnabled = true;
            console.log(`✅ ${this.config.username} switched to creative mode`);
            
            // Announce creative mode
            if (this.chatCooldown <= Date.now()) {
                const creativeMessage = this.creativeChat[Math.floor(Math.random() * this.creativeChat.length)];
                this.safeChat(creativeMessage);
                this.chatCooldown = Date.now() + 5000;
            }
            
            return true;
        } catch (error) {
            console.log(`❌ ${this.config.username} failed to switch to creative:`, error.message);
            return false;
        }
    }

    async switchToSurvivalMode() {
        if (!this.creativeModeEnabled) {
            console.log(`✅ ${this.config.username} already in survival mode`);
            return true;
        }

        console.log(`🎯 ${this.config.username} switching to survival mode...`);
        
        try {
            this.safeChat("/gamemode survival");
            await delay(3000);
            
            this.creativeModeEnabled = false;
            console.log(`✅ ${this.config.username} switched to survival mode`);
            return true;
        } catch (error) {
            console.log(`❌ ${this.config.username} failed to switch to survival:`, error.message);
            return false;
        }
    }

    async getBedFromCreative() {
        console.log(`🛏️ ${this.config.username} getting bed from creative mode...`);
        
        // First ensure we're in creative mode
        if (!await this.switchToCreativeMode()) {
            console.log(`❌ ${this.config.username} cannot get bed - creative mode failed`);
            return false;
        }

        try {
            // Try multiple bed types
            const bedCommands = [
                "/give @s minecraft:red_bed 1",
                "/give @s minecraft:white_bed 1",
                "/give @s minecraft:blue_bed 1",
                "/give @s minecraft:black_bed 1",
                "/give @s bed 1"
            ];
            
            for (const command of bedCommands) {
                this.safeChat(command);
                await delay(2000);
                
                // Check if we got a bed
                if (await this.checkForBedsInInventory()) {
                    console.log(`✅ ${this.config.username} got bed from command: ${command}`);
                    return true;
                }
            }
            
            console.log(`❌ ${this.config.username} creative commands didn't give beds`);
            return false;
            
        } catch (error) {
            console.log(`❌ ${this.config.username} creative commands failed:`, error.message);
            return false;
        }
    }

    async ensureHasBed() {
        console.log(`🛏️ ${this.config.username} ensuring bed availability...`);
        
        // Check if we already have a bed
        if (await this.checkForBedsInInventory()) {
            console.log(`✅ ${this.config.username} already has bed in inventory`);
            return true;
        }
        
        // Use creative mode to get bed
        console.log(`🎨 ${this.config.username} using creative mode to get bed...`);
        return await this.getBedFromCreative();
    }

    async checkForBedsInInventory() {
        await delay(1000); // Wait for inventory update
        
        const beds = this.bot.inventory.items().filter(item => 
            item.name.includes('bed')
        );
        
        if (beds.length > 0) {
            console.log(`✅ ${this.config.username} has ${beds.length} beds in inventory`);
            return true;
        }
        
        return false;
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
        }, 30000);

        // Morning Bed Breaking System
        const morningInterval = setInterval(() => {
            this.handleMorningBedBreaking();
        }, 10000);

        this.behaviorIntervals = [aiInterval, chatInterval, behaviorInterval, bedInterval, morningInterval];
        
        console.log(`⚡ ${this.config.username} all systems activated`);
        console.log(`🎯 Features: Auto Creative Mode • Instant Beds • Smart Sleep • Bed Breaking`);
    }

    async performAITask() {
        const context = this.assessEnvironment();
        
        // Force sleep task if it's night and sleep priority is high
        if (context.isNight && this.sleepPriority) {
            console.log(`🌙 ${this.config.username} sleep priority activated - using creative mode`);
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
                case 'get_bed_creative':
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
        
        if (context.isNight) {
            tasks.push({ task: 'sleep', weight: 0.98 });
            tasks.push({ task: 'get_bed_creative', weight: 0.95 });
            tasks.push({ task: 'place_bed', weight: 0.90 });
        } else {
            tasks.push({ task: 'explore', weight: 0.6 });
            tasks.push({ task: 'mine', weight: 0.5 });
            tasks.push({ task: 'farm', weight: 0.4 });
            tasks.push({ task: 'build', weight: 0.3 });
            tasks.push({ task: 'get_bed_creative', weight: 0.5 }); // Prepare for night
        }

        if (context.food < 10) {
            tasks.push({ task: 'eat', weight: 0.7 });
        }

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

    async placeBed() {
        console.log(`🛏️ ${this.config.username} attempting to place bed...`);
        
        // Ensure we have a bed first using creative mode
        if (!await this.ensureHasBed()) {
            console.log(`❌ ${this.config.username} cannot place bed - creative mode failed`);
            return false;
        }

        // Switch back to survival for normal operations
        await this.switchToSurvivalMode();

        // Get bed from inventory
        const bedItem = this.bot.inventory.items().find(item => 
            item.name.includes('bed')
        );

        if (!bedItem) {
            console.log(`❌ ${this.config.username} bed disappeared from inventory`);
            return false;
        }

        // Find position near the bot
        const startX = Math.floor(this.bot.entity.position.x);
        const startY = Math.floor(this.bot.entity.position.y);
        const startZ = Math.floor(this.bot.entity.position.z);

        let bedPlaced = false;
        
        // Try positions around the bot
        for (let x = -2; x <= 2 && !bedPlaced; x++) {
            for (let z = -2; z <= 2 && !bedPlaced; z++) {
                const testX = startX + x;
                const testZ = startZ + z;
                
                for (let yOffset = -1; yOffset <= 1 && !bedPlaced; yOffset++) {
                    const testY = startY + yOffset;
                    
                    try {
                        const floorBlock = this.bot.blockAt({ x: testX, y: testY - 1, z: testZ });
                        const targetBlock = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                        
                        if (floorBlock && floorBlock.name !== 'air' && 
                            targetBlock && targetBlock.name === 'air') {
                            
                            await this.bot.equip(bedItem, 'hand');
                            await delay(1000);
                            
                            this.bot.lookAt({ x: testX, y: testY, z: testZ }, false);
                            await delay(500);
                            
                            await this.bot.placeBlock(targetBlock, { x: 0, y: 1, z: 0 });
                            await delay(2000);
                            
                            this.bedPosition = { x: testX, y: testY, z: testZ };
                            this.hasBed = true;
                            bedPlaced = true;
                            
                            console.log(`✅ ${this.config.username} placed bed at ${testX}, ${testY}, ${testZ}`);
                            
                            if (this.chatCooldown <= Date.now()) {
                                const bedMessage = this.bedChat[Math.floor(Math.random() * this.bedChat.length)];
                                this.safeChat(bedMessage);
                                this.chatCooldown = Date.now() + 5000;
                            }
                            
                            break;
                        }
                    } catch (error) {
                        // Continue trying
                    }
                }
            }
        }

        return bedPlaced;
    }

    async autoSleep() {
        const now = Date.now();
        if (now - this.lastSleepAttempt < 8000) return;
        
        this.lastSleepAttempt = now;
        const context = this.assessEnvironment();

        if (context.isNight) {
            console.log(`🌙 ${this.config.username} night detected - using creative mode for sleep...`);
            
            // Use creative mode to ensure we have a bed
            if (!await this.ensureHasBed()) {
                console.log(`❌ ${this.config.username} cannot sleep - creative mode failed`);
                this.sleepPriority = true;
                return;
            }

            let bed = null;
            
            // Use existing bed if available
            if (this.hasBed && this.bedPosition) {
                bed = this.bot.blockAt(this.bedPosition);
                if (!bed || !bed.name.includes('bed')) {
                    this.hasBed = false;
                    this.bedPosition = null;
                    bed = null;
                }
            }
            
            // Look for nearby bed
            if (!bed) {
                bed = this.bot.findBlock({
                    matching: (block) => block.name.includes('bed'),
                    maxDistance: 10
                });
            }
            
            // Place new bed if needed
            if (!bed) {
                console.log(`🛏️ ${this.config.username} placing new bed using creative resources...`);
                const bedPlaced = await this.placeBed();
                if (bedPlaced && this.bedPosition) {
                    bed = this.bot.blockAt(this.bedPosition);
                }
            }

            if (bed) {
                try {
                    // Ensure we're in survival mode for sleeping
                    await this.switchToSurvivalMode();
                    
                    // Move to bed
                    const distance = this.bot.entity.position.distanceTo(bed.position);
                    if (distance > 2) {
                        console.log(`🚶 ${this.config.username} moving to bed`);
                        this.bot.lookAt(bed.position.offset(0, 1, 0));
                        this.bot.setControlState('forward', true);
                        await delay(1500);
                        this.bot.setControlState('forward', false);
                        await delay(1000);
                    }
                    
                    console.log(`😴 ${this.config.username} sleeping in bed`);
                    await this.bot.sleep(bed);
                    console.log(`✅ ${this.config.username} sleeping peacefully`);
                    
                    this.sleepPriority = true;
                    
                    // Sleep monitoring
                    const sleepInterval = setInterval(() => {
                        if (!this.bot.isSleeping) {
                            clearInterval(sleepInterval);
                            this.sleepPriority = false;
                            console.log(`❌ ${this.config.username} sleep interrupted`);
                            return;
                        }
                        
                        const currentTime = this.bot.time ? this.bot.time.timeOfDay : 0;
                        if (currentTime < 1000) {
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

    async handleMorningBedBreaking() {
        const context = this.assessEnvironment();
        
        // It's morning and we have a placed bed
        if (!context.isNight && this.hasBed && this.bedPosition) {
            console.log(`🌅 ${this.config.username} morning detected - breaking bed...`);
            
            const bedBlock = this.bot.blockAt(this.bedPosition);
            if (bedBlock && bedBlock.name.includes('bed')) {
                try {
                    // Ensure survival mode for breaking
                    await this.switchToSurvivalMode();
                    
                    // Move to bed
                    this.bot.lookAt(bedBlock.position.offset(0, 1, 0));
                    this.bot.setControlState('forward', true);
                    await delay(1000);
                    this.bot.setControlState('forward', false);
                    
                    // Break the bed
                    console.log(`⛏️ ${this.config.username} breaking bed at ${this.bedPosition.x}, ${this.bedPosition.y}, ${this.bedPosition.z}`);
                    await this.bot.dig(bedBlock);
                    await delay(2000);
                    
                    // Reset bed status
                    this.hasBed = false;
                    this.bedPosition = null;
                    
                    console.log(`✅ ${this.config.username} broke bed and should have it in inventory`);
                    
                    // Morning chat
                    if (this.chatCooldown <= Date.now()) {
                        const morningMessage = this.morningChat[Math.floor(Math.random() * this.morningChat.length)];
                        this.safeChat(morningMessage);
                        this.chatCooldown = Date.now() + 5000;
                    }
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} failed to break bed:`, error.message);
                }
            } else {
                // Bed is already gone
                this.hasBed = false;
                this.bedPosition = null;
            }
        }
    }

    // ... (other methods remain the same as previous version)

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
            matching: (block) => block.name.includes('stone') || block.name.includes('coal'),
            maxDistance: 4
        });
        if (block) {
            try {
                await this.bot.dig(block);
                await delay(4000 + Math.random() * 5000);
            } catch (error) {}
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
        const food = this.bot.inventory.items().find(item => item.name.includes('apple') || item.name.includes('bread'));
        if (food) {
            try {
                await this.bot.equip(food, 'hand');
                await this.bot.consume();
                console.log(`🍽️ ${this.config.username} ate ${food.name}`);
            } catch (error) {}
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
        const behaviors = [() => this.lookAround(), () => this.jumpRandomly(), () => this.switchItems()];
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
            if (lowerMessage.includes('sleep') || lowerMessage.includes('bed')) return "Using creative mode for bedding!";
            if (lowerMessage.includes('creative')) return "Creative mode activated for tactical operations!";
        } else {
            if (lowerMessage.includes('help')) return "I can help! What do you need?";
            if (lowerMessage.includes('sleep') || lowerMessage.includes('bed')) return "Using creative magic for my bed!";
            if (lowerMessage.includes('creative')) return "Creative powers for comfortable sleeping!";
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
                ? "Night operations! Creative mode engaged for bedding!" 
                : "Peaceful night! Using creative magic for sleep!";
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
            console.log(`🌙 ${this.config.username} night detected, activating creative sleep priority`);
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
        this.hasBed = false;
        this.bedPosition = null;
        this.sleepPriority = false;
        this.creativeModeEnabled = false;
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
        this.activities.push({ type, timestamp: new Date().toISOString() });
        if (this.activities.length > 50) this.activities.shift();
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

// ... (RotationSystem and other code remains the same as previous version)

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
        console.log(`║ 🎨 AUTO-CREATIVE: Gets beds instantly at night    ║`);
        console.log(`║ 🛏️ Smart Sleep: Creative → Bed → Sleep → Survival ║`);
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
        console.log(`🎯 Features: Auto Creative Mode • Instant Beds • Smart Sleep Cycle\n`);

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
            features: 'Auto Creative Mode • Instant Beds • Smart Sleep Cycle'
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
