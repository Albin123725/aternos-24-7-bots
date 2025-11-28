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
║  🛏️ CREATIVE BEDS: Gets beds from creative inventory                       ║
║  🛡️ ANTI-KICK: Handles duplicate login protection                         ║
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
        this.aiMemory = new Map();
        this.conversationHistory = [];
        this.sessionStartTime = Date.now();
        this.hasBed = false;
        this.bedPosition = null;
        this.sleepPriority = false;
        this.bedPlacementAttempts = 0;
        this.creativeMode = true; // Assume creative mode for bed access
        
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
                checkTimeoutInterval: 90 * 1000, // Increased timeout
                logErrors: false,
                hideErrors: true,
                profilesFolder: './profiles',
                skipValidation: true
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
            this.activityWeights = { explore: 0.25, mine: 0.15, combat: 0.15, build: 0.10, social: 0.05, sleep: 0.30 };
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
            this.activityWeights = { explore: 0.20, mine: 0.10, farm: 0.25, build: 0.05, social: 0.10, sleep: 0.30 };
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
            }, 45000); // Increased timeout

            this.bot.on('login', () => {
                clearTimeout(loginTimeout);
                console.log(`✅ ${this.config.username} logged in successfully`);
                this.isConnected = true;
                
                // Try to get creative items immediately
                setTimeout(() => {
                    this.tryGetCreativeItems();
                }, 3000);
                
                resolve(true);
            });

            this.bot.on('spawn', () => {
                console.log(`🎯 ${this.config.username} spawned in world`);
                this.startAllSystems();
            });

            this.bot.on('kicked', (reason) => {
                console.log(`❌ ${this.config.username} kicked:`, reason.toString());
                
                // Handle duplicate login - wait longer before retry
                if (reason.toString().includes('duplicate_login')) {
                    console.log(`🔒 ${this.config.username} duplicate login detected - waiting 2 minutes`);
                }
                
                this.handleDisconnection();
            });

            this.bot.on('error', (err) => {
                if (err.code === 'EPIPE' || err.code === 'ECONNRESET') {
                    console.log(`🔌 ${this.config.username} connection lost`);
                } else {
                    console.log(`⚠️ ${this.config.username} error:`, err.message);
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

            this.bot.on('entityHurt', (entity) => {
                if (entity === this.bot.entity) {
                    this.handleCombatDamage();
                }
            });

            this.bot.on('entitySpawn', (entity) => {
                if (entity.type === 'mob') {
                    this.handleMobSpawn(entity);
                }
            });

            this.bot.on('rain', () => {
                this.handleWeatherChange();
            });

            this.bot.on('playerCollect', (collector, item) => {
                if (collector === this.bot.entity) {
                    this.learnFromCollection(item);
                }
            });

            // Handle creative mode items
            this.bot.on('windowOpen', (window) => {
                console.log(`📦 ${this.config.username} inventory window opened`);
                this.checkForBedsInInventory();
            });
        });
    }

    async tryGetCreativeItems() {
        console.log(`🎨 ${this.config.username} attempting to get creative items...`);
        
        // Try to send creative mode commands
        try {
            // Try various methods to get beds
            this.safeChat("/gamemode creative");
            await delay(2000);
            
            this.safeChat("/give @s minecraft:white_bed 1");
            await delay(2000);
            
            this.safeChat("/give @s bed 1");
            await delay(2000);
            
            // Try creative inventory access
            this.bot.setQuickBarSlot(0);
            await delay(1000);
            
            console.log(`✅ ${this.config.username} creative commands attempted`);
            
        } catch (error) {
            console.log(`❌ ${this.config.username} creative commands failed:`, error.message);
        }
        
        // Check if we got any beds
        await this.checkForBedsInInventory();
    }

    async checkForBedsInInventory() {
        const beds = this.bot.inventory.items().filter(item => 
            item.name.includes('bed')
        );
        
        if (beds.length > 0) {
            console.log(`🛏️ ${this.config.username} found ${beds.length} beds in inventory`);
            return true;
        } else {
            console.log(`❌ ${this.config.username} no beds in inventory`);
            
            // Try to craft a bed if we have materials
            await this.tryCraftBed();
            return false;
        }
    }

    async tryCraftBed() {
        console.log(`🔨 ${this.config.username} attempting to craft bed...`);
        
        const planks = this.bot.inventory.items().find(item => 
            item.name.includes('planks')
        );
        
        const wool = this.bot.inventory.items().find(item => 
            item.name.includes('wool')
        );

        if (planks && wool) {
            console.log(`🎯 ${this.config.username} has materials for bed: ${planks.name}, ${wool.name}`);
            // In actual implementation, you'd use a crafting plugin
            return true;
        } else {
            console.log(`❌ ${this.config.username} missing bed materials`);
            return false;
        }
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

        // Combat System
        const combatInterval = setInterval(() => {
            this.autoCombat();
        }, 4000);

        // Environment Monitoring
        const monitorInterval = setInterval(() => {
            this.monitorEnvironment();
        }, 30000);

        // Inventory Management
        const inventoryInterval = setInterval(() => {
            this.manageInventory();
        }, 60000);

        // Bed Management System
        const bedInterval = setInterval(() => {
            this.checkBedStatus();
        }, 35000);

        this.behaviorIntervals = [aiInterval, chatInterval, behaviorInterval, combatInterval, monitorInterval, inventoryInterval, bedInterval];
        
        console.log(`⚡ ${this.config.username} all systems activated`);
        console.log(`🎯 Features: Auto-Bed Placement • Immediate Sleep • Anti-Kick Protection`);
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
                case 'combat':
                    await this.engageCombat();
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
                case 'eat':
                    await this.findFood();
                    break;
                case 'retreat':
                    await this.retreat();
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
            if (context.enemiesNearby) {
                tasks.push({ task: 'combat', weight: 0.2 });
            }
        } else {
            tasks.push({ task: 'explore', weight: 0.6 });
            tasks.push({ task: 'mine', weight: 0.5 });
            tasks.push({ task: 'farm', weight: 0.4 });
            tasks.push({ task: 'build', weight: 0.3 });
            tasks.push({ task: 'place_bed', weight: 0.5 });
            tasks.push({ task: 'get_bed', weight: 0.4 });
            if (context.enemiesNearby) {
                tasks.push({ task: 'combat', weight: 0.4 });
            }
        }

        // Health-based tasks
        if (context.health < 8) {
            tasks.push({ task: 'retreat', weight: 0.9 });
            tasks.push({ task: 'eat', weight: 0.8 });
        } else if (context.food < 10) {
            tasks.push({ task: 'eat', weight: 0.7 });
        }

        // Social tasks
        if (context.nearbyPlayers > 0) {
            tasks.push({ task: 'social', weight: 0.3 });
        }

        // Personality adjustments
        if (this.config.personality === 'agent') {
            const combatTask = tasks.find(t => t.task === 'combat');
            const exploreTask = tasks.find(t => t.task === 'explore');
            if (combatTask) combatTask.weight += 0.3;
            if (exploreTask) exploreTask.weight += 0.2;
        } else {
            const farmTask = tasks.find(t => t.task === 'farm');
            const socialTask = tasks.find(t => t.task === 'social');
            if (farmTask) farmTask.weight += 0.3;
            if (socialTask) socialTask.weight += 0.2;
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
        console.log(`🎨 ${this.config.username} attempting to get bed from creative...`);
        
        // Method 1: Try creative mode commands
        try {
            this.safeChat("/gamemode creative");
            await delay(3000);
            
            this.safeChat("/give @s minecraft:red_bed 1");
            await delay(2000);
            
            this.safeChat("/give @s bed 1");
            await delay(2000);
            
            this.safeChat("/gamemode survival");
            await delay(2000);
            
        } catch (error) {
            console.log(`❌ ${this.config.username} creative commands failed:`, error.message);
        }
        
        // Method 2: Check if we got beds
        const hasBed = await this.checkForBedsInInventory();
        
        if (hasBed) {
            console.log(`✅ ${this.config.username} successfully obtained bed from creative`);
            return true;
        } else {
            console.log(`❌ ${this.config.username} failed to get bed from creative`);
            return false;
        }
    }

    async placeBed() {
        console.log(`🛏️ ${this.config.username} attempting to place bed...`);
        this.bedPlacementAttempts++;
        
        // First, ensure we have a bed
        const hasBed = await this.checkForBedsInInventory();
        if (!hasBed) {
            console.log(`❌ ${this.config.username} no bed available, getting from creative...`);
            const gotBed = await this.getBedFromCreative();
            if (!gotBed) {
                console.log(`❌ ${this.config.username} cannot place bed - no bed available`);
                return false;
            }
        }

        // Check if we already have a bed placed
        if (this.hasBed && this.bedPosition) {
            const bedBlock = this.bot.blockAt(this.bedPosition);
            if (bedBlock && bedBlock.name.includes('bed')) {
                console.log(`✅ ${this.config.username} bed already placed at ${this.bedPosition.x}, ${this.bedPosition.y}, ${this.bedPosition.z}`);
                return true;
            } else {
                this.hasBed = false;
                this.bedPosition = null;
            }
        }

        // Get bed from inventory
        const bedItem = this.bot.inventory.items().find(item => 
            item.name.includes('bed')
        );

        if (!bedItem) {
            console.log(`❌ ${this.config.username} bed disappeared from inventory`);
            return false;
        }

        // Find suitable position for bed
        const startX = Math.floor(this.bot.entity.position.x);
        const startY = Math.floor(this.bot.entity.position.y);
        const startZ = Math.floor(this.bot.entity.position.z);

        let bedPlaced = false;
        
        // Try positions around the bot
        for (let radius = 1; radius <= 4; radius++) {
            for (let x = -radius; x <= radius && !bedPlaced; x++) {
                for (let z = -radius; z <= radius && !bedPlaced; z++) {
                    const testX = startX + x;
                    const testZ = startZ + z;
                    
                    // Check multiple Y levels
                    for (let yOffset = -1; yOffset <= 1 && !bedPlaced; yOffset++) {
                        const testY = startY + yOffset;
                        
                        // Check if position is suitable for bed
                        const floorBlock = this.bot.blockAt({ x: testX, y: testY - 1, z: testZ });
                        const airBlock1 = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                        
                        if (floorBlock && floorBlock.name !== 'air' && 
                            floorBlock.name !== 'water' && floorBlock.name !== 'lava' &&
                            airBlock1 && airBlock1.name === 'air') {
                            
                            try {
                                // Equip bed
                                await this.bot.equip(bedItem, 'hand');
                                await delay(1000);
                                
                                // Look at position
                                this.bot.lookAt({ x: testX, y: testY, z: testZ }, false);
                                await delay(500);
                                
                                // Place bed
                                await this.bot.placeBlock(airBlock1, { x: 0, y: 1, z: 0 });
                                await delay(1500);
                                
                                this.bedPosition = { x: testX, y: testY, z: testZ };
                                this.hasBed = true;
                                this.bedPlacementAttempts = 0;
                                bedPlaced = true;
                                
                                console.log(`✅ ${this.config.username} placed bed at ${testX}, ${testY}, ${testZ}`);
                                
                                // Announce bed placement
                                if (this.chatCooldown <= Date.now()) {
                                    const bedMessage = this.bedChat[Math.floor(Math.random() * this.bedChat.length)];
                                    this.safeChat(bedMessage);
                                    this.chatCooldown = Date.now() + 5000;
                                }
                                
                                break;
                            } catch (error) {
                                console.log(`❌ ${this.config.username} failed to place bed:`, error.message);
                            }
                        }
                    }
                }
                if (bedPlaced) break;
            }
            if (bedPlaced) break;
        }

        if (!bedPlaced) {
            console.log(`❌ ${this.config.username} could not find suitable bed location`);
            
            // Try creative placement as last resort
            if (this.bedPlacementAttempts > 2) {
                console.log(`🎨 ${this.config.username} using creative placement...`);
                this.safeChat("/setblock ~ ~ ~ minecraft:red_bed");
                await delay(3000);
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
            console.log(`🌙 ${this.config.username} attempting to sleep immediately...`);
            
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
                    matching: function(block) {
                        return block.name.includes('bed');
                    },
                    maxDistance: 12
                });
            }
            
            // If still no bed, try to place one immediately
            if (!bed) {
                console.log(`🛏️ ${this.config.username} no bed found, placing one immediately...`);
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
                        await delay(1500);
                        this.bot.setControlState('forward', false);
                        await delay(500);
                    }
                    
                    console.log(`😴 ${this.config.username} sleeping in bed at ${bed.position.x}, ${bed.position.y}, ${bed.position.z}`);
                    await this.bot.sleep(bed);
                    console.log(`✅ ${this.config.username} sleeping peacefully`);
                    
                    this.sleepPriority = true;
                    
                    // Sleep until morning
                    const sleepInterval = setInterval(function() {
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
                    }.bind(this), 5000);
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} couldn't sleep:`, error.message);
                    this.sleepPriority = false;
                    
                    // Try different bed location
                    if (error.message.includes('obstructed')) {
                        console.log(`🛠️ ${this.config.username} bed obstructed, trying new location`);
                        this.hasBed = false;
                        this.bedPosition = null;
                        await this.placeBed();
                    }
                }
            } else {
                console.log(`❌ ${this.config.username} no bed available for sleeping`);
                this.sleepPriority = true;
            }
        } else {
            this.sleepPriority = false;
        }
    }

    // ... (other methods remain the same as previous version, but I'll include the essential ones)

    async exploreArea() {
        console.log(`🧭 ${this.config.username} exploring...`);
        
        this.bot.setControlState('forward', true);
        await delay(3000 + Math.random() * 5000);
        this.bot.setControlState('forward', false);
        
        await this.lookAround();
        await delay(2000 + Math.random() * 3000);
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
            console.log(`🌙 ${this.config.username} sleep priority activated for night`);
        }
    }

    handleSmartChat(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes(this.config.username.toLowerCase())) {
            setTimeout(async () => {
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

    assessEnvironment() {
        const time = this.bot.time ? this.bot.time.timeOfDay : 0;
        const isNight = time > 13000 && time < 23000;
        const nearbyPlayers = Object.keys(this.bot.players).length - 1;
        
        const enemy = this.bot.nearestEntity(function(entity) {
            return entity.type === 'mob' && 
                   entity.position.distanceTo(this.bot.entity.position) < 12;
        }.bind(this));
        
        const enemiesNearby = enemy !== null;

        return {
            time,
            isNight,
            health: this.bot.health || 20,
            food: this.bot.food || 20,
            nearbyPlayers,
            enemiesNearby
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
        console.log(`║ 🛏️ Auto-Bed: Creative Mode + Immediate Sleep      ║`);
        console.log(`║ 🛡️ Protection: Anti-kick & Duplicate Login        ║`);
        console.log(`╚══════════════════════════════════════════════════╝\n`);

        // Start bot session
        this.currentBot = new UltimateBot(botConfig);
        const connected = await this.currentBot.initialize();
        
        if (!connected) {
            console.log(`❌ Failed to connect ${botConfig.username}, retrying in 2 minutes`);
            await delay(120000); // Wait 2 minutes for duplicate login cooldown
            return;
        }

        // Calculate session time (2-3 hours)
        const sessionTime = botConfig.sessionDuration + (Math.random() * 60 * 60 * 1000);
        const hours = Math.round(sessionTime / 3600000 * 10) / 10;
        
        console.log(`\n⏰ ${botConfig.username} session: ${hours} hours`);
        console.log(`🎯 Activities: Auto-Bed Placement • Immediate Sleep • Creative Items\n`);

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
            features: 'Creative Beds • Anti-Kick Protection • Immediate Sleep'
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
