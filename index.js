const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════════╗
║ 🎮 MINECRAFT ULTIMATE BOT ROTATION SYSTEM                   ║
║ 🤖 Bots: AGENT ↔ CROPTON (Single Bot Rotation)              ║
║ 🌐 Server: gameplanet.aternos.me:51270                      ║
║ ⚡ Version: 1.21.10                                          ║
║ 🔄 Rotation: One Bot at a Time • 2-3 Hour Sessions          ║
║ 🌍 IP Switching: Simulated Different Locations              ║
║ 🧠 AI Features: All Enabled • Auto-Sleep • Combat • Chat    ║
║ 🛏️ AUTO-BED: Places beds and sleeps immediately at night    ║
║ 🕒 24/7 Operation: Continuous Presence                      ║
╚══════════════════════════════════════════════════════════════╝
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
        
        this.setupBotBehavior();
    }

    async initialize() {
        try {
            console.log(`🚀 ${this.config.username} initializing...`);
            
            this.bot = mineflayer.createBot({
                host: this.config.host,
                port: this.config.port,
                username: this.config.username,
                version: this.config.version,
                auth: 'offline',
                checkTimeoutInterval: 60 * 1000,
                logErrors: false,
                hideErrors: true
            });

            await this.setupEventHandlers();
            return true;

        } catch (error) {
            console.log(`❌ ${this.config.username} init failed:`, error.message);
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
            this.activityWeights = { explore: 0.30, mine: 0.20, combat: 0.15, build: 0.10, social: 0.05, sleep: 0.20 };
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
            this.activityWeights = { explore: 0.20, mine: 0.10, farm: 0.30, build: 0.05, social: 0.10, sleep: 0.25 };
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
            }, 30000);

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
                console.log(`❌ ${this.config.username} kicked:`, reason);
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
        });
    }

    startAllSystems() {
        this.clearIntervals();
        
        // Main AI Decision System
        const aiInterval = setInterval(() => {
            this.performAITask();
        }, 40000 + Math.random() * 80000);

        // Smart Chat System
        const chatInterval = setInterval(() => {
            if (Math.random() < 0.35 && this.chatCooldown <= Date.now()) {
                this.smartChat();
            }
        }, 90000 + Math.random() * 150000);

        // Human Behavior System
        const behaviorInterval = setInterval(() => {
            this.performHumanBehavior();
        }, 20000 + Math.random() * 40000);

        // Combat System
        const combatInterval = setInterval(() => {
            this.autoCombat();
        }, 3000);

        // Environment Monitoring
        const monitorInterval = setInterval(() => {
            this.monitorEnvironment();
        }, 25000);

        // Inventory Management
        const inventoryInterval = setInterval(() => {
            this.manageInventory();
        }, 60000);

        // Bed Management System
        const bedInterval = setInterval(() => {
            this.checkBedStatus();
        }, 30000);

        this.behaviorIntervals = [aiInterval, chatInterval, behaviorInterval, combatInterval, monitorInterval, inventoryInterval, bedInterval];
        
        console.log(`⚡ ${this.config.username} all systems activated`);
    }

    async performAITask() {
        const context = this.assessEnvironment();
        
        // Force sleep task if it's night and sleep priority is high
        if (context.isNight && this.sleepPriority) {
            console.log(`🌙 ${this.config.username} sleep priority activated`);
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
            tasks.push({ task: 'sleep', weight: 0.9 });
            tasks.push({ task: 'place_bed', weight: 0.8 });
            tasks.push({ task: 'mine', weight: 0.2 });
            if (context.enemiesNearby) {
                tasks.push({ task: 'combat', weight: 0.3 });
            }
        } else {
            tasks.push({ task: 'explore', weight: 0.6 });
            tasks.push({ task: 'mine', weight: 0.5 });
            tasks.push({ task: 'farm', weight: 0.4 });
            tasks.push({ task: 'build', weight: 0.3 });
            tasks.push({ task: 'place_bed', weight: 0.4 }); // Prepare bed during day
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

    async placeBed() {
        console.log(`🛏️ ${this.config.username} attempting to place bed...`);
        
        // Check if we already have a bed placed
        if (this.hasBed && this.bedPosition) {
            const bedBlock = this.bot.blockAt(this.bedPosition);
            if (bedBlock && bedBlock.name.includes('bed')) {
                console.log(`✅ ${this.config.username} bed already placed at ${this.bedPosition}`);
                return true;
            } else {
                this.hasBed = false;
                this.bedPosition = null;
            }
        }

        // Look for bed in inventory
        const bedItem = this.bot.inventory.items().find(item => 
            item.name.includes('bed')
        );

        if (!bedItem) {
            console.log(`❌ ${this.config.username} no bed in inventory`);
            this.hasBed = false;
            return false;
        }

        // Find suitable position for bed (2x1 area on solid ground)
        const startX = Math.floor(this.bot.entity.position.x);
        const startY = Math.floor(this.bot.entity.position.y);
        const startZ = Math.floor(this.bot.entity.position.z);

        let bedPlaced = false;
        
        // Try positions around the bot
        for (let radius = 1; radius <= 3; radius++) {
            for (let x = -radius; x <= radius && !bedPlaced; x++) {
                for (let z = -radius; z <= radius && !bedPlaced; z++) {
                    const testX = startX + x;
                    const testZ = startZ + z;
                    
                    // Check if position is suitable for bed
                    const floorBlock = this.bot.blockAt({ x: testX, y: startY - 1, z: testZ });
                    const airBlock1 = this.bot.blockAt({ x: testX, y: startY, z: testZ });
                    const airBlock2 = this.bot.blockAt({ x: testX, y: startY + 1, z: testZ });
                    
                    if (floorBlock && floorBlock.name !== 'air' && 
                        airBlock1 && airBlock1.name === 'air' &&
                        airBlock2 && airBlock2.name === 'air') {
                        
                        try {
                            // Equip bed
                            await this.bot.equip(bedItem, 'hand');
                            
                            // Look at position
                            this.bot.lookAt({ x: testX, y: startY, z: testZ }, false);
                            await delay(500);
                            
                            // Place bed
                            await this.bot.placeBlock(airBlock1, { x: 0, y: 1, z: 0 });
                            
                            this.bedPosition = { x: testX, y: startY, z: testZ };
                            this.hasBed = true;
                            bedPlaced = true;
                            
                            console.log(`✅ ${this.config.username} placed bed at ${testX}, ${startY}, ${testZ}`);
                            
                            // Announce bed placement
                            if (this.chatCooldown <= Date.now()) {
                                const bedMessage = this.bedChat[Math.floor(Math.random() * this.bedChat.length)];
                                this.safeChat(bedMessage);
                                this.chatCooldown = Date.now() + 4000;
                            }
                            
                            break;
                        } catch (error) {
                            console.log(`❌ ${this.config.username} failed to place bed:`, error.message);
                        }
                    }
                }
                if (bedPlaced) break;
            }
            if (bedPlaced) break;
        }

        if (!bedPlaced) {
            console.log(`❌ ${this.config.username} could not find suitable bed location`);
            this.hasBed = false;
        }
        
        return bedPlaced;
    }

    async autoSleep() {
        const now = Date.now();
        if (now - this.lastSleepAttempt < 15000) return; // Reduced cooldown
        
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
                    matching: function(block) {
                        return block.name.includes('bed');
                    },
                    maxDistance: 10
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
                    console.log(`😴 ${this.config.username} sleeping in bed at ${bed.position}`);
                    await this.bot.sleep(bed);
                    console.log(`✅ ${this.config.username} sleeping peacefully`);
                    
                    // Set sleep priority to true while sleeping
                    this.sleepPriority = true;
                    
                    // Wait in bed until morning or interrupted
                    const maxSleepTime = 15 * 60 * 1000; // 15 minutes max
                    const sleepStart = Date.now();
                    
                    const sleepInterval = setInterval(function() {
                        if (!this.bot.isSleeping) {
                            clearInterval(sleepInterval);
                            this.sleepPriority = false;
                            console.log(`❌ ${this.config.username} sleep interrupted`);
                            return;
                        }
                        
                        const currentTime = this.bot.time ? this.bot.time.timeOfDay : 0;
                        if (currentTime < 1000 || currentTime > 23000) { // Morning
                            this.bot.wake();
                            clearInterval(sleepInterval);
                            this.sleepPriority = false;
                            console.log(`🌅 ${this.config.username} woke up at dawn`);
                        }
                        
                        // Emergency wakeup after max time
                        if (Date.now() - sleepStart > maxSleepTime) {
                            this.bot.wake();
                            clearInterval(sleepInterval);
                            this.sleepPriority = false;
                            console.log(`⏰ ${this.config.username} woke up after max sleep time`);
                        }
                    }.bind(this), 5000);
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} couldn't sleep:`, error.message);
                    this.sleepPriority = false;
                    
                    // If bed is obstructed, try to clear it or place new one
                    if (error.message.includes('obstructed') || error.message.includes('not valid')) {
                        console.log(`🛠️ ${this.config.username} bed obstructed, will try new location`);
                        this.hasBed = false;
                        this.bedPosition = null;
                        await delay(2000);
                        await this.placeBed();
                    }
                }
            } else {
                console.log(`❌ ${this.config.username} no bed available, cannot sleep`);
                this.sleepPriority = true; // Keep trying to sleep
                
                // Try to find materials to make a bed
                await this.findBedMaterials();
            }
        } else {
            this.sleepPriority = false;
        }
    }

    async findBedMaterials() {
        console.log(`🔍 ${this.config.username} searching for bed materials...`);
        
        const woodItems = this.bot.inventory.items().find(item => 
            item.name.includes('planks') || item.name.includes('log') || item.name.includes('wood')
        );
        
        const woolItems = this.bot.inventory.items().find(item => 
            item.name.includes('wool')
        );

        if (woodItems && woolItems) {
            console.log(`🎯 ${this.config.username} has materials for bed`);
            // In a real implementation, you'd craft the bed here
            return true;
        } else {
            console.log(`❌ ${this.config.username} missing bed materials`);
            return false;
        }
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

    async exploreArea() {
        console.log(`🧭 ${this.config.username} exploring...`);
        
        this.bot.setControlState('forward', true);
        await delay(3000 + Math.random() * 5000);
        this.bot.setControlState('forward', false);
        
        await this.lookAround();
        await delay(2000 + Math.random() * 3000);
        
        // Occasionally change direction
        if (Math.random() < 0.4) {
            this.bot.setControlState('left', true);
            await delay(1000 + Math.random() * 2000);
            this.bot.setControlState('left', false);
        }
    }

    async mineResources() {
        console.log(`⛏️ ${this.config.username} mining...`);
        
        const block = this.bot.findBlock({
            matching: function(block) {
                return block.name.includes('stone') || 
                       block.name.includes('coal') ||
                       block.name.includes('dirt') ||
                       block.name.includes('wood');
            },
            maxDistance: 4
        });
        
        if (block) {
            try {
                await this.bot.dig(block);
                await delay(4000 + Math.random() * 5000);
                this.learnFromExperience('mining_success', block.name);
            } catch (error) {
                this.learnFromExperience('mining_failed', block.name);
            }
        }
    }

    async engageCombat() {
        const enemy = this.bot.nearestEntity(function(entity) {
            return entity.type === 'mob' && 
                   entity.position.distanceTo(this.bot.entity.position) < 8;
        }.bind(this));
        
        if (enemy) {
            console.log(`⚔️ ${this.config.username} engaging combat!`);
            
            this.bot.attack(enemy);
            this.bot.lookAt(enemy.position.offset(0, 1.6, 0));
            
            // Tactical movement
            this.bot.setControlState('left', true);
            await delay(600 + Math.random() * 1000);
            this.bot.setControlState('left', false);
            
            this.bot.setControlState('right', true);
            await delay(600 + Math.random() * 1000);
            this.bot.setControlState('right', false);
            
            await delay(1500 + Math.random() * 2500);
            this.lastCombatTime = Date.now();
        }
    }

    autoCombat() {
        if (Date.now() - this.lastCombatTime < 5000) return;
        
        const enemy = this.bot.nearestEntity(function(entity) {
            return entity.type === 'mob' && 
                   entity.position.distanceTo(this.bot.entity.position) < 4;
        }.bind(this));
        
        if (enemy) {
            this.bot.attack(enemy);
            this.bot.lookAt(enemy.position.offset(0, 1.6, 0));
            this.lastCombatTime = Date.now();
        }
    }

    async findShelter() {
        console.log(`🏠 ${this.config.username} finding shelter...`);
        
        // Look for natural shelter
        const shelter = this.bot.findBlock({
            matching: function(block) {
                return block.name.includes('log') || 
                       block.name.includes('stone') ||
                       block.name.includes('house');
            },
            maxDistance: 12
        });

        if (shelter) {
            this.bot.lookAt(shelter.position);
            this.bot.setControlState('forward', true);
            await delay(4000 + Math.random() * 6000);
            this.bot.setControlState('forward', false);
        }
        
        // Wait out the night
        await delay(30000 + Math.random() * 60000);
    }

    async socialize() {
        const nearbyPlayers = Object.keys(this.bot.players).filter(function(name) {
            return name !== this.bot.username;
        }.bind(this));

        if (nearbyPlayers.length > 0) {
            console.log(`👥 ${this.config.username} socializing with ${nearbyPlayers.length} players`);
            
            if (Math.random() < 0.6 && this.chatCooldown <= Date.now()) {
                this.smartChat();
            }
            
            // Follow nearest player briefly
            if (Math.random() < 0.3) {
                const targetPlayer = this.bot.players[nearbyPlayers[0]];
                if (targetPlayer && targetPlayer.entity) {
                    this.bot.lookAt(targetPlayer.entity.position);
                    this.bot.setControlState('forward', true);
                    await delay(3000 + Math.random() * 4000);
                    this.bot.setControlState('forward', false);
                }
            }
        }
    }

    async buildStructure() {
        console.log(`🏗️ ${this.config.username} building...`);
        
        for (let i = 0; i < 5; i++) {
            this.bot.setControlState('forward', true);
            await delay(800 + Math.random() * 1200);
            this.bot.setControlState('forward', false);
            
            await this.lookAround();
            await delay(1000 + Math.random() * 2000);
            
            // Simulate block placement
            if (Math.random() < 0.3) {
                this.bot.setControlState('sneak', true);
                await delay(500 + Math.random() * 1000);
                this.bot.setControlState('sneak', false);
            }
        }
    }

    async farmAction() {
        console.log(`🌱 ${this.config.username} farming...`);
        
        for (let i = 0; i < 4; i++) {
            this.bot.setControlState('sneak', true);
            await delay(1000 + Math.random() * 1500);
            this.bot.setControlState('sneak', false);
            
            // Simulate planting/harvesting
            this.bot.swingArm('right');
            await delay(800 + Math.random() * 1200);
            
            await delay(1500 + Math.random() * 2500);
        }
    }

    async findFood() {
        console.log(`🍎 ${this.config.username} finding food...`);
        
        const food = this.bot.inventory.items().find(function(item) {
            return item.name.includes('apple') || 
                   item.name.includes('bread') ||
                   item.name.includes('cooked');
        });
        
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

    async retreat() {
        console.log(`🏃 ${this.config.username} retreating!`);
        
        this.bot.setControlState('back', true);
        await delay(3000 + Math.random() * 4000);
        this.bot.setControlState('back', false);
        
        await this.findShelter();
    }

    async lookAround() {
        if (!this.bot.entity) return;
        
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        for (let i = 0; i < 4; i++) {
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
            () => this.sneakBriefly(),
            () => this.checkSurroundings(),
            () => this.restBriefly()
        ];

        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        behavior();
    }

    async jumpRandomly() {
        const jumps = 1 + Math.floor(Math.random() * 5);
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

    async checkSurroundings() {
        this.bot.look(this.bot.entity.yaw + (Math.random() - 0.5), 
                     this.bot.entity.pitch + (Math.random() - 0.5), false);
        await delay(1000 + Math.random() * 2000);
    }

    async restBriefly() {
        this.bot.setControlState('sneak', true);
        await delay(2000 + Math.random() * 3000);
        this.bot.setControlState('sneak', false);
    }

    handleSmartChat(message) {
        const lowerMessage = message.toLowerCase();
        
        // Respond to direct mentions
        if (lowerMessage.includes(this.config.username.toLowerCase())) {
            setTimeout(async () => {
                if (this.chatCooldown <= Date.now()) {
                    const response = this.generateSmartResponse(message);
                    console.log(`💬 ${this.config.username} response: ${response}`);
                    this.safeChat(response);
                    this.recordConversation(message, response);
                    this.chatCooldown = Date.now() + 4000;
                    await delay(500);
                }
            }, 800 + Math.random() * 1500);
        }

        // Auto-greet
        if ((lowerMessage.includes('hello') || lowerMessage.includes('hi ')) && Math.random() < 0.4) {
            setTimeout(() => {
                if (this.chatCooldown <= Date.now()) {
                    const greeting = this.config.personality === 'agent' ? 'Agent ready!' : 'Hello there!';
                    this.safeChat(greeting);
                    this.chatCooldown = Date.now() + 4000;
                }
            }, 1500 + Math.random() * 2000);
        }
    }

    generateSmartResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (this.config.personality === 'agent') {
            if (lowerMessage.includes('help')) return "Agent assisting! Mission underway!";
            if (lowerMessage.includes('where')) return "Current position secured. Area patrolled.";
            if (lowerMessage.includes('what')) return "Classified operations ongoing.";
            if (lowerMessage.includes('sleep')) return "Agent doesn't require sleep!";
            if (lowerMessage.includes('fight') || lowerMessage.includes('combat')) return "Weapons ready! Engaging hostiles!";
            if (lowerMessage.includes('bed')) return "Establishing sleeping quarters!";
        } else {
            if (lowerMessage.includes('help')) return "I can help! What do you need?";
            if (lowerMessage.includes('farm')) return "I love farming! Crops growing well!";
            if (lowerMessage.includes('food')) return "I have fresh produce! Hungry?";
            if (lowerMessage.includes('sleep')) return "Good night! Rest well!";
            if (lowerMessage.includes('weather')) return "Perfect farming weather today!";
            if (lowerMessage.includes('bed')) return "Setting up my bed for the night!";
        }
        
        const responses = [
            'Hello!', 'Hi there!', 'Nice to see you!', 
            'What\'s up?', 'How can I help?', 'Great day!'
        ];
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
        } else if (context.health < 10) {
            phrase = this.config.personality === 'agent'
                ? "Agent requires medical attention."
                : "Feeling a bit tired... need food.";
        } else if (context.nearbyPlayers > 3) {
            phrase = this.config.personality === 'agent'
                ? "Multiple contacts detected. Monitoring."
                : "So many friendly players around today!";
        } else if (context.enemiesNearby) {
            phrase = this.config.personality === 'agent'
                ? "Hostile entities detected! Engaging!"
                : "Scary monsters nearby! Be careful!";
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
        
        // Immediately prioritize sleep when night comes
        if (context.isNight && !this.sleepPriority) {
            this.sleepPriority = true;
            console.log(`🌙 ${this.config.username} night detected, activating sleep priority`);
        }
        
        if (context.isNight && Math.random() < 0.3) {
            this.autoSleep();
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

    handleCombatDamage() {
        if (this.bot.health < 6) {
            this.retreat();
        }
    }

    handleMobSpawn(mob) {
        if (this.config.personality === 'agent' && Math.random() < 0.7) {
            setTimeout(() => {
                if (this.chatCooldown <= Date.now()) {
                    this.safeChat("Hostile entity detected! Engaging!");
                    this.chatCooldown = Date.now() + 4000;
                }
            }, 1000);
        }
    }

    handleWeatherChange() {
        if (Math.random() < 0.3 && this.chatCooldown <= Date.now()) {
            const comment = this.config.personality === 'agent' 
                ? "Weather conditions changing. Adjusting operations." 
                : "Rain is wonderful for the crops!";
            this.safeChat(comment);
            this.chatCooldown = Date.now() + 4000;
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

    learnFromCollection(item) {
        this.learnFromExperience('collected', item.name);
    }

    manageInventory() {
        const items = this.bot.inventory.items();
        if (items.length > 0) {
            const tool = items.find(function(item) {
                return item.name.includes('pickaxe') || item.name.includes('sword') || item.name.includes('axe');
            });
            if (tool) {
                this.bot.equip(tool, 'hand').catch(() => {});
            }
            
            // Prioritize keeping bed in inventory
            const bed = items.find(item => item.name.includes('bed'));
            if (bed) {
                console.log(`🛏️ ${this.config.username} has bed in inventory`);
            }
        }
    }

    monitorEnvironment() {
        const context = this.assessEnvironment();
        
        if (Math.random() < 0.08) {
            console.log(`📊 ${this.config.username} env: ${context.nearbyPlayers} players, night: ${context.isNight}, health: ${context.health}, food: ${context.food}, hasBed: ${this.hasBed}`);
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
            enemiesNearby,
            position: this.bot.entity ? this.bot.entity.position : null
        };
    }

    learnFromExperience(type, data) {
        const experience = `${type}:${data}`;
        this.aiMemory.set(experience, (this.aiMemory.get(experience) || 0) + 1);
        
        if (this.aiMemory.size > 100) {
            const firstKey = this.aiMemory.keys().next().value;
            this.aiMemory.delete(firstKey);
        }
    }

    recordConversation(input, output) {
        this.conversationHistory.push({
            input,
            output,
            timestamp: new Date().toISOString()
        });
        
        if (this.conversationHistory.length > 25) {
            this.conversationHistory.shift();
        }
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
        this.isRotating = false;
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
        console.log(`║ 🛏️ Auto-Bed: Places beds and sleeps at night      ║`);
        console.log(`╚══════════════════════════════════════════════════╝\n`);

        // Start bot session
        this.currentBot = new UltimateBot(botConfig);
        const connected = await this.currentBot.initialize();
        
        if (!connected) {
            console.log(`❌ Failed to connect ${botConfig.username}, retrying in 1 minute`);
            await delay(60000);
            return;
        }

        // Calculate session time (2-3 hours)
        const sessionTime = botConfig.sessionDuration + (Math.random() * 60 * 60 * 1000);
        const hours = Math.round(sessionTime / 3600000 * 10) / 10;
        
        console.log(`\n⏰ ${botConfig.username} session: ${hours} hours`);
        console.log(`🎯 Activities: AI Exploration • Auto-Combat • Smart Chat • Auto-Bed Sleeping\n`);

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
        
        // Display rotation history
        if (this.rotationHistory.length > 1) {
            console.log(`\n📈 Recent Rotations:`);
            this.rotationHistory.slice(0, 3).forEach(function(rot, index) {
                const mins = Math.round(rot.duration / 60000);
                console.log(`   ${index + 1}. ${rot.bot} - ${mins}min - ${rot.country}`);
            });
            console.log();
        }
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
            features: 'Auto-Bed Placement, Immediate Sleep, 24/7 Rotation'
        }));
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Minecraft Bot Rotation System - 24/7 Operation\n\nVisit /health for status');
    }
});

const PORT = process.env.PORT || 3000;
healthServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Health check server running on port ${PORT}`);
    console.log(`🔍 Render can now monitor: http://localhost:${PORT}/health`);
});

// === MODIFIED GRACEFUL SHUTDOWN ===
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
