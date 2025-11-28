const mineflayer = require('mineflayer');
const Vec3 = require('vec3').Vec3;

console.log(`
🎮 MINECRAFT AI BOT SYSTEM STARTING...
🤖 Bots: AGENT and CROPTON
🌐 Server: gameplanet.aternos.me:51270
⚡ Version: 1.21.10
🧠 AI Features: Activated
😴 Auto-Sleep: Activated
🎯 All Features: Enabled
`);

class UltimateBot {
    constructor(config) {
        this.config = config;
        this.bot = null;
        this.isConnected = false;
        this.activities = [];
        this.startTime = Date.now();
        this.lastSleepAttempt = 0;
        this.aiMemory = new Map();
        this.conversationHistory = [];
        this.lastActivityTime = Date.now();
        this.currentTask = 'exploring';
        
        this.initialize();
    }

    initialize() {
        try {
            console.log(`🚀 Initializing ${this.config.username}...`);
            
            // Use offline mode to avoid Microsoft auth issues
            this.bot = mineflayer.createBot({
                host: this.config.host,
                port: this.config.port,
                username: this.config.username,
                version: this.config.version,
                auth: 'offline', // Changed to offline mode
                checkTimeoutInterval: 60 * 1000,
                logErrors: false,
                hideErrors: true
            });

            this.setupEventHandlers();
            this.setupBotBehavior();

        } catch (error) {
            console.log(`❌ Failed to initialize ${this.config.username}:`, error.message);
            this.scheduleRestart();
        }
    }

    setupEventHandlers() {
        this.bot.on('login', () => {
            console.log(`✅ ${this.config.username} logged in successfully`);
            this.isConnected = true;
            this.recordActivity('login');
        });

        this.bot.on('spawn', () => {
            console.log(`🎯 ${this.config.username} spawned in world`);
            this.startBehaviorCycle();
            this.startAIFeatures();
            this.recordActivity('spawn');
        });

        this.bot.on('kicked', (reason) => {
            console.log(`❌ ${this.config.username} kicked:`, reason);
            this.handleDisconnection();
        });

        this.bot.on('error', (err) => {
            console.log(`⚠️ ${this.config.username} error:`, err.message);
            this.handleDisconnection();
        });

        this.bot.on('end', () => {
            console.log(`🔌 ${this.config.username} disconnected`);
            this.handleDisconnection();
        });

        this.bot.on('death', () => {
            console.log(`💀 ${this.config.username} died`);
            this.handleDeath();
            this.recordActivity('death');
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
                this.handleCombat();
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
    }

    setupBotBehavior() {
        if (this.config.username === 'AGENT') {
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
                "Mission parameters set!"
            ];
            this.personality = { 
                curiosity: 0.8, 
                caution: 0.7, 
                sociability: 0.4,
                aggression: 0.6
            };
        } else {
            this.chatPhrases = [
                "Time to farm some crops!",
                "Harvest season!",
                "Crops growing nicely!",
                "Farm life is good!",
                "Planting some seeds!",
                "Fresh produce coming up!",
                "Agricultural operations!",
                "Green thumb activated!",
                "Perfect weather for farming!",
                "Soil quality excellent!"
            ];
            this.personality = { 
                curiosity: 0.6, 
                caution: 0.5, 
                sociability: 0.8,
                aggression: 0.2
            };
        }
    }

    startBehaviorCycle() {
        // Main activity loop with AI decisions
        setInterval(() => {
            this.performAITask();
        }, 45000 + Math.random() * 90000);

        // Smart chatting system
        setInterval(() => {
            if (Math.random() < 0.4) {
                this.smartChat();
            }
        }, 120000 + Math.random() * 180000);

        // Human-like behaviors
        setInterval(() => {
            this.performHumanBehavior();
        }, 25000 + Math.random() * 45000);

        // Environment monitoring
        setInterval(() => {
            this.monitorEnvironment();
        }, 30000);

        console.log(`🎯 ${this.config.username} behavior systems activated`);
    }

    startAIFeatures() {
        // AI Learning system
        setInterval(() => {
            this.learnFromExperience();
        }, 60000);

        // Auto-combat system
        setInterval(() => {
            this.autoCombat();
        }, 5000);

        // Inventory management
        setInterval(() => {
            this.manageInventory();
        }, 120000);
    }

    async performAITask() {
        const context = this.assessEnvironment();
        const task = this.chooseAITask(context);
        
        console.log(`🧠 ${this.config.username} AI task: ${task}`);
        this.currentTask = task;

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
                case 'fight':
                    await this.engageCombat();
                    break;
                case 'eat':
                    await this.findFood();
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
        
        // Time-based tasks
        if (context.isNight) {
            tasks.push({ task: 'sleep', weight: 0.8 });
            tasks.push({ task: 'mine', weight: 0.4 });
        } else {
            tasks.push({ task: 'explore', weight: 0.7 });
            tasks.push({ task: 'mine', weight: 0.6 });
            tasks.push({ task: 'build', weight: 0.3 });
            tasks.push({ task: 'farm', weight: 0.5 });
        }

        // Health-based tasks
        if (context.health < 10) {
            tasks.push({ task: 'eat', weight: 0.9 });
        }

        // Combat tasks
        if (context.enemiesNearby) {
            tasks.push({ task: 'fight', weight: this.personality.aggression });
        }

        // Social tasks
        if (context.nearbyPlayers > 0) {
            tasks.push({ task: 'social', weight: this.personality.sociability });
        }

        // Personality adjustments
        if (this.config.username === 'AGENT') {
            tasks.find(t => t.task === 'explore').weight += 0.2;
            tasks.find(t => t.task === 'fight').weight += 0.3;
        } else {
            tasks.find(t => t.task === 'farm').weight += 0.3;
            tasks.find(t => t.task === 'social').weight += 0.2;
        }

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
        
        const direction = Math.random() * Math.PI * 2;
        const distance = 10 + Math.random() * 25;
        
        const targetX = this.bot.entity.position.x + Math.cos(direction) * distance;
        const targetZ = this.bot.entity.position.z + Math.sin(direction) * distance;
        
        // Simple movement without pathfinder
        this.bot.setControlState('forward', true);
        await this.delay(2000 + Math.random() * 4000);
        this.bot.setControlState('forward', false);
        
        await this.lookAround();
        await this.delay(1000 + Math.random() * 3000);
    }

    async mineResources() {
        console.log(`⛏️ ${this.config.username} mining...`);
        
        const block = this.bot.findBlock({
            matching: block => 
                block.name.includes('stone') || 
                block.name.includes('coal') ||
                block.name.includes('dirt') ||
                block.name.includes('wood'),
            maxDistance: 4
        });
        
        if (block) {
            try {
                await this.bot.dig(block);
                await this.delay(3000 + Math.random() * 4000);
                this.learnFromExperience('mining_success', block.name);
            } catch (error) {
                this.learnFromExperience('mining_failed', block.name);
            }
        }
    }

    async autoSleep() {
        const now = Date.now();
        if (now - this.lastSleepAttempt < 30000) return;
        
        this.lastSleepAttempt = now;
        const context = this.assessEnvironment();

        if (context.isNight) {
            console.log(`🌙 ${this.config.username} attempting to sleep...`);
            
            const bed = this.bot.findBlock({
                matching: block => block.name.includes('bed'),
                maxDistance: 6
            });

            if (bed) {
                try {
                    await this.bot.sleep(bed);
                    console.log(`😴 ${this.config.username} sleeping peacefully`);
                    
                    // Wait in bed until morning or interrupted
                    const sleepInterval = setInterval(() => {
                        if (!this.bot.isSleeping) {
                            clearInterval(sleepInterval);
                            return;
                        }
                        
                        const currentTime = this.bot.time.timeOfDay;
                        if (currentTime < 1000 || currentTime > 23000) {
                            this.bot.wake();
                            clearInterval(sleepInterval);
                            console.log(`🌅 ${this.config.username} woke up`);
                        }
                    }, 5000);
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} couldn't sleep:`, error.message);
                }
            } else {
                console.log(`🛏️ ${this.config.username} no bed found, taking shelter`);
                await this.takeShelter();
            }
        }
    }

    async takeShelter() {
        // Find or create shelter at night
        console.log(`🏠 ${this.config.username} seeking shelter...`);
        
        // Look for nearby shelter
        const shelter = this.bot.findBlock({
            matching: block => 
                block.name.includes('house') || 
                block.name.includes('shelter') ||
                (block.name.includes('log') && this.bot.blockAt(block.position.offset(0, 2, 0))?.name === 'air'),
            maxDistance: 12
        });

        if (shelter) {
            // Move toward shelter
            this.bot.lookAt(shelter.position);
            this.bot.setControlState('forward', true);
            await this.delay(3000 + Math.random() * 5000);
            this.bot.setControlState('forward', false);
        }
        
        // Wait out the night safely
        await this.delay(60000 + Math.random() * 120000);
    }

    async socialize() {
        const nearbyPlayers = Object.keys(this.bot.players).filter(name => 
            name !== this.bot.username
        );

        if (nearbyPlayers.length > 0) {
            console.log(`👥 ${this.config.username} socializing with ${nearbyPlayers.length} players`);
            
            // Greet players
            if (Math.random() < 0.7) {
                this.smartChat();
            }
            
            // Follow a random player briefly
            if (Math.random() < 0.4) {
                const targetPlayer = this.bot.players[nearbyPlayers[0]];
                if (targetPlayer && targetPlayer.entity) {
                    this.bot.lookAt(targetPlayer.entity.position);
                    this.bot.setControlState('forward', true);
                    await this.delay(4000 + Math.random() * 6000);
                    this.bot.setControlState('forward', false);
                }
            }
        }
    }

    async buildStructure() {
        console.log(`🏗️ ${this.config.username} building...`);
        
        // Simulate building by moving in patterns
        for (let i = 0; i < 4; i++) {
            const direction = Math.random() * Math.PI * 2;
            const distance = 2 + Math.random() * 4;
            
            this.bot.setControlState('forward', true);
            await this.delay(1000 + Math.random() * 2000);
            this.bot.setControlState('forward', false);
            
            await this.lookAround();
            await this.delay(1000 + Math.random() * 2000);
        }
    }

    async farmAction() {
        console.log(`🌱 ${this.config.username} farming...`);
        
        // Simulate farming actions
        for (let i = 0; i < 3; i++) {
            this.bot.setControlState('sneak', true);
            await this.delay(800 + Math.random() * 1200);
            this.bot.setControlState('sneak', false);
            
            await this.delay(1000 + Math.random() * 2000);
        }
    }

    async engageCombat() {
        const enemy = this.bot.nearestEntity(entity => 
            entity.type === 'mob' && 
            entity.position.distanceTo(this.bot.entity.position) < 8
        );
        
        if (enemy) {
            console.log(`⚔️ ${this.config.username} engaging combat!`);
            
            // Attack enemy
            this.bot.attack(enemy);
            this.bot.lookAt(enemy.position.offset(0, 1.6, 0));
            
            // Move around while fighting
            this.bot.setControlState('left', true);
            await this.delay(800 + Math.random() * 1200);
            this.bot.setControlState('left', false);
            this.bot.setControlState('right', true);
            await this.delay(800 + Math.random() * 1200);
            this.bot.setControlState('right', false);
            
            await this.delay(2000 + Math.random() * 3000);
        }
    }

    autoCombat() {
        // Auto-attack nearby hostile mobs
        const enemy = this.bot.nearestEntity(entity => 
            entity.type === 'mob' && 
            entity.position.distanceTo(this.bot.entity.position) < 4 &&
            this.personality.aggression > 0.3
        );
        
        if (enemy) {
            this.bot.attack(enemy);
            this.bot.lookAt(enemy.position.offset(0, 1.6, 0));
        }
    }

    async findFood() {
        console.log(`🍎 ${this.config.username} looking for food...`);
        
        const food = this.bot.inventory.items().find(item => 
            item.name.includes('apple') || 
            item.name.includes('bread') ||
            item.name.includes('cooked')
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

    handleSmartChat(message) {
        const lowerMessage = message.toLowerCase();
        
        // Respond to direct mentions
        if (lowerMessage.includes(this.config.username.toLowerCase())) {
            setTimeout(() => {
                const response = this.generateSmartResponse(message);
                console.log(`💬 ${this.config.username} response: ${response}`);
                this.bot.chat(response);
                this.recordConversation(message, response);
            }, 1000 + Math.random() * 2000);
        }

        // Learn from conversations
        if (lowerMessage.includes('help') || lowerMessage.includes('come here')) {
            this.learnFromExperience('help_request', message);
        }

        // Auto-greet
        if ((lowerMessage.includes('hello') || lowerMessage.includes('hi ')) && Math.random() < 0.5) {
            setTimeout(() => {
                const greeting = this.config.username === 'AGENT' ? 'Agent ready!' : 'Hello friend!';
                this.bot.chat(greeting);
            }, 2000 + Math.random() * 3000);
        }
    }

    generateSmartResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (this.config.username === 'AGENT') {
            if (lowerMessage.includes('help')) return ["Agent assisting!", "Support deployed!", "On my way!"];
            if (lowerMessage.includes('where')) return ["Current position: operational", "Location secured", "Area patrolled"];
            if (lowerMessage.includes('what')) return ["Mission ongoing", "Operations normal", "All systems go"];
            if (lowerMessage.includes('sleep')) return ["Agent doesn't sleep!", "Always vigilant!", "Mission continues!"];
        } else {
            if (lowerMessage.includes('help')) return ["I can help!", "What do you need?", "Happy to assist!"];
            if (lowerMessage.includes('farm')) return ["I love farming!", "Crops are growing!", "Harvest time soon!"];
            if (lowerMessage.includes('food')) return ["I have bread!", "Hungry? Me too!", "Time for a snack!"];
            if (lowerMessage.includes('sleep')) return ["Good night!", "Time to rest!", "Sleep well!"];
        }
        
        const responses = ['Hello!', 'Hi there!', 'Nice to see you!', 'What\'s up?', 'How can I help?'];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    smartChat() {
        const context = this.assessEnvironment();
        let phrase;

        if (context.isNight) {
            phrase = this.config.username === 'AGENT' 
                ? "Night patrol active. All quiet." 
                : "Peaceful night for farming.";
        } else if (context.nearbyPlayers > 2) {
            phrase = this.config.username === 'AGENT'
                ? "Multiple contacts in area. Monitoring."
                : "Lots of friendly players around!";
        } else if (context.health < 10) {
            phrase = this.config.username === 'AGENT'
                ? "Agent requires sustenance."
                : "Feeling a bit hungry...";
        } else {
            phrase = this.chatPhrases[Math.floor(Math.random() * this.chatPhrases.length)];
        }

        console.log(`💬 ${this.config.username} chat: ${phrase}`);
        this.bot.chat(phrase);
    }

    performHumanBehavior() {
        const behaviors = [
            () => this.lookAround(),
            () => this.jumpRandomly(),
            () => this.switchItems(),
            () => this.sneakBriefly(),
            () => this.rotateView(),
            () => this.checkInventory()
        ];

        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        behavior();
    }

    async lookAround() {
        if (!this.bot.entity) return;
        
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        for (let i = 0; i < 3; i++) {
            const yaw = originalYaw + (Math.random() * 1.2 - 0.6);
            const pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, 
                originalPitch + (Math.random() * 0.6 - 0.3)));
            this.bot.look(yaw, pitch, false);
            await this.delay(400 + Math.random() * 800);
        }
    }

    async jumpRandomly() {
        const jumps = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < jumps; i++) {
            this.bot.setControlState('jump', true);
            await this.delay(150 + Math.random() * 250);
            this.bot.setControlState('jump', false);
            await this.delay(200 + Math.random() * 400);
        }
    }

    async switchItems() {
        const items = this.bot.inventory.items();
        if (items.length > 1) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            this.bot.equip(randomItem, 'hand').catch(() => {});
            await this.delay(800 + Math.random() * 1200);
        }
    }

    async sneakBriefly() {
        if (Math.random() < 0.3) {
            this.bot.setControlState('sneak', true);
            await this.delay(1200 + Math.random() * 1800);
            this.bot.setControlState('sneak', false);
        }
    }

    async rotateView() {
        this.bot.look(this.bot.entity.yaw + (Math.random() - 0.5), 
                     this.bot.entity.pitch + (Math.random() - 0.5), false);
    }

    async checkInventory() {
        // Simulate checking inventory
        this.bot.setControlState('sneak', true);
        await this.delay(500 + Math.random() * 1000);
        this.bot.setControlState('sneak', false);
    }

    assessEnvironment() {
        const time = this.bot.time ? this.bot.time.timeOfDay : 0;
        const isNight = time > 13000 && time < 23000;
        const nearbyPlayers = Object.keys(this.bot.players).length - 1;
        
        const enemiesNearby = this.bot.nearestEntity(entity => 
            entity.type === 'mob' && 
            entity.position.distanceTo(this.bot.entity.position) < 10
        ) !== null;

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

    handleTimeBasedActions() {
        const context = this.assessEnvironment();
        
        // Auto-sleep at night
        if (context.isNight && Math.random() < 0.2) {
            this.autoSleep();
        }
        
        // Wake up at day
        if (!context.isNight && this.bot.isSleeping) {
            this.bot.wake();
        }
    }

    handleHealthManagement() {
        if (this.bot.food < 15) {
            this.findFood();
        }
    }

    handleCombat() {
        if (this.bot.health < 8) {
            // Retreat when low health
            this.bot.setControlState('back', true);
            setTimeout(() => this.bot.setControlState('back', false), 2000);
        }
    }

    handleWeatherChange() {
        if (Math.random() < 0.5) {
            const comment = this.config.username === 'AGENT' 
                ? "Weather conditions changing." 
                : "Rain is good for crops!";
            this.bot.chat(comment);
        }
    }

    handleDeath() {
        const deathMessages = [
            "I'll be back!",
            "That was unfortunate...",
            "Time to respawn!",
            "Didn't see that coming!",
            "Well, that happened!"
        ];
        const message = deathMessages[Math.floor(Math.random() * deathMessages.length)];
        setTimeout(() => this.bot.chat(message), 3000);
    }

    manageInventory() {
        // Simple inventory management
        const items = this.bot.inventory.items();
        if (items.length > 0) {
            // Equip best tool if available
            const tool = items.find(item => 
                item.name.includes('pickaxe') || item.name.includes('sword') || item.name.includes('axe')
            );
            if (tool) {
                this.bot.equip(tool, 'hand').catch(() => {});
            }
        }
    }

    monitorEnvironment() {
        const context = this.assessEnvironment();
        
        // Log environment status occasionally
        if (Math.random() < 0.1) {
            console.log(`📊 ${this.config.username} environment: ${context.nearbyPlayers} players, night: ${context.isNight}, health: ${context.health}`);
        }
    }

    learnFromExperience(type, data) {
        const experience = `${type}:${data}`;
        if (!this.aiMemory.has(experience)) {
            this.aiMemory.set(experience, 1);
        } else {
            this.aiMemory.set(experience, this.aiMemory.get(experience) + 1);
        }
        
        // Limit memory size
        if (this.aiMemory.size > 50) {
            const firstKey = this.aiMemory.keys().next().value;
            this.aiMemory.delete(firstKey);
        }
    }

    learnFromCollection(item) {
        this.learnFromExperience('collected', item.name);
        console.log(`📦 ${this.config.username} collected: ${item.name}`);
    }

    recordConversation(input, output) {
        this.conversationHistory.push({
            input,
            output,
            timestamp: new Date().toISOString()
        });
        
        if (this.conversationHistory.length > 20) {
            this.conversationHistory.shift();
        }
    }

    handleDisconnection() {
        console.log(`🔄 ${this.config.username} scheduling restart...`);
        this.scheduleRestart();
    }

    scheduleRestart() {
        const delay = 8000 + Math.random() * 15000;
        setTimeout(() => {
            console.log(`🔄 Restarting ${this.config.username}...`);
            this.initialize();
        }, delay);
    }

    recordActivity(type) {
        this.activities.push({
            type,
            timestamp: new Date().toISOString(),
            position: this.bot.entity ? this.bot.entity.position : null
        });
        
        if (this.activities.length > 100) {
            this.activities.shift();
        }
        
        this.lastActivityTime = Date.now();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Bot Configuration
const botConfigs = [
    {
        username: 'AGENT',
        host: 'gameplanet.aternos.me',
        port: 51270,
        version: '1.21.10'
    },
    {
        username: 'CROPTON',
        host: 'gameplanet.aternos.me', 
        port: 51270,
        version: '1.21.10'
    }
];

// Start bots with delays
console.log('🎯 Starting ultimate bot system...');

botConfigs.forEach((config, index) => {
    setTimeout(() => {
        new UltimateBot(config);
    }, index * 10000); // 10 seconds between bots
});

// Keep the process alive
setInterval(() => {
    // Heartbeat to keep process alive
}, 60000);

process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down ultimate bots...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Ultimate system termination...');
    process.exit(0);
});
