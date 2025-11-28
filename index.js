const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const autoeat = require('mineflayer-auto-eat');
const Vec3 = require('vec3').Vec3;

console.log(`
🎮 MINECRAFT BOT SYSTEM STARTING...
🤖 Bots: AGENT and CROPTON
🌐 Server: gameplanet.aternos.me:51270
⚡ Version: 1.21.10
🕒 24/7 Mode: Activated
`);

class AdvancedBot {
    constructor(config) {
        this.config = config;
        this.bot = null;
        this.isConnected = false;
        this.activities = [];
        this.startTime = Date.now();
        
        this.initialize();
    }

    initialize() {
        try {
            console.log(`🚀 Initializing ${this.config.username}...`);
            
            this.bot = mineflayer.createBot({
                host: this.config.host,
                port: this.config.port,
                username: this.config.username,
                password: this.config.password,
                version: this.config.version,
                auth: this.config.password ? 'microsoft' : 'offline',
                checkTimeoutInterval: 60 * 1000,
                logErrors: true
            });

            this.setupPlugins();
            this.setupEventHandlers();
            this.setupBotBehavior();

        } catch (error) {
            console.log(`❌ Failed to initialize ${this.config.username}:`, error.message);
            this.scheduleRestart();
        }
    }

    setupPlugins() {
        // Load essential plugins
        this.bot.loadPlugin(pathfinder);
        this.bot.loadPlugin(autoeat);

        // Configure pathfinder
        const movements = new Movements(this.bot);
        movements.allowParkour = false;
        movements.allow1by1towers = false;
        movements.canDig = true;
        movements.scafoldingBlocks = [];
        this.bot.pathfinder.setMovements(movements);

        // Configure auto-eat
        this.bot.autoEat.options = {
            priority: 'foodPoints',
            startAt: 16,
            bannedFood: [],
            eatingTimeout: 3
        };
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
            this.recordActivity('death');
        });

        this.bot.on('message', (jsonMsg) => {
            const message = jsonMsg.toString();
            this.handleChat(message);
        });

        this.bot.on('time', () => {
            this.handleTimeBasedActions();
        });

        this.bot.on('health', () => {
            this.handleHealthCheck();
        });
    }

    setupBotBehavior() {
        // Personality-based behaviors
        if (this.config.username === 'AGENT') {
            this.chatPhrases = [
                "Agent reporting for duty!",
                "Mission: Explore and survive!",
                "Area secure!",
                "Proceeding with operations!",
                "Everything under control!",
                "Agent on duty!",
                "Securing the perimeter!",
                "All systems operational!"
            ];
            this.activityWeights = { explore: 0.4, mine: 0.3, build: 0.2, social: 0.1 };
        } else {
            this.chatPhrases = [
                "Time to farm some crops!",
                "Harvest season!",
                "Crops growing nicely!",
                "Farm life is good!",
                "Planting some seeds!",
                "Fresh produce coming up!",
                "Agricultural operations!",
                "Green thumb activated!"
            ];
            this.activityWeights = { explore: 0.3, mine: 0.2, farm: 0.4, social: 0.1 };
        }
    }

    startBehaviorCycle() {
        // Main activity loop
        setInterval(() => {
            this.performRandomActivity();
        }, 60000 + Math.random() * 120000); // 1-3 minutes

        // Random chatting
        setInterval(() => {
            if (Math.random() < 0.4) {
                this.chatRandom();
            }
        }, 120000 + Math.random() * 180000); // 2-5 minutes

        // Human-like looking around
        setInterval(() => {
            this.lookAround();
        }, 30000 + Math.random() * 60000); // 30-90 seconds

        console.log(`🎯 ${this.config.username} behavior cycle started`);
    }

    async performRandomActivity() {
        const activities = [
            { type: 'explore', weight: this.activityWeights.explore },
            { type: 'mine', weight: this.activityWeights.mine },
            { type: 'farm', weight: this.activityWeights.farm || 0 },
            { type: 'build', weight: this.activityWeights.build || 0 },
            { type: 'social', weight: this.activityWeights.social }
        ];

        const selected = this.weightedRandom(activities);
        console.log(`🎯 ${this.config.username} starting activity: ${selected.type}`);

        try {
            switch (selected.type) {
                case 'explore':
                    await this.explore();
                    break;
                case 'mine':
                    await this.mine();
                    break;
                case 'farm':
                    await this.farm();
                    break;
                case 'build':
                    await this.build();
                    break;
                case 'social':
                    await this.socialize();
                    break;
            }
            this.recordActivity(selected.type);
        } catch (error) {
            console.log(`❌ ${this.config.username} activity failed:`, error.message);
        }
    }

    async explore() {
        const direction = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 35;
        
        const targetX = this.bot.entity.position.x + Math.cos(direction) * distance;
        const targetZ = this.bot.entity.position.z + Math.sin(direction) * distance;
        
        const goal = new goals.GoalBlock(targetX, this.bot.entity.position.y, targetZ);
        
        try {
            await this.bot.pathfinder.goto(goal);
            await this.delay(2000 + Math.random() * 4000);
        } catch (error) {
            console.log(`🧭 ${this.config.username} exploration failed:`, error.message);
        }
    }

    async mine() {
        const nearbyBlock = this.bot.findBlock({
            matching: block => 
                block.name.includes('stone') || 
                block.name.includes('coal_ore') ||
                block.name.includes('dirt') ||
                block.name.includes('wood'),
            maxDistance: 4
        });
        
        if (nearbyBlock) {
            try {
                console.log(`⛏️ ${this.config.username} mining ${nearbyBlock.name}`);
                await this.bot.dig(nearbyBlock);
                await this.delay(3000 + Math.random() * 4000);
            } catch (error) {
                // Silent fail - common in mining
            }
        }
    }

    async farm() {
        // Simulate farming behavior by moving around
        const direction = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 10;
        
        const targetX = this.bot.entity.position.x + Math.cos(direction) * distance;
        const targetZ = this.bot.entity.position.z + Math.sin(direction) * distance;
        
        try {
            await this.bot.pathfinder.goto(new goals.GoalNear(targetX, this.bot.entity.position.y, targetZ, 1));
            await this.delay(5000 + Math.random() * 8000);
        } catch (error) {
            // Silent fail
        }
    }

    async build() {
        // Simulate building by moving in patterns
        for (let i = 0; i < 3; i++) {
            const direction = Math.random() * Math.PI * 2;
            const distance = 2 + Math.random() * 5;
            
            const targetX = this.bot.entity.position.x + Math.cos(direction) * distance;
            const targetZ = this.bot.entity.position.z + Math.sin(direction) * distance;
            
            try {
                await this.bot.pathfinder.goto(new goals.GoalNear(targetX, this.bot.entity.position.y, targetZ, 1));
                await this.delay(2000 + Math.random() * 3000);
            } catch (error) {
                // Silent fail
            }
        }
    }

    async socialize() {
        // Look for nearby players and possibly chat
        const nearbyPlayers = Object.keys(this.bot.players).filter(name => 
            name !== this.bot.username
        );
        
        if (nearbyPlayers.length > 0 && Math.random() < 0.6) {
            this.chatRandom();
        }
        
        await this.delay(30000 + Math.random() * 60000);
    }

    chatRandom() {
        const phrase = this.chatPhrases[Math.floor(Math.random() * this.chatPhrases.length)];
        console.log(`💬 ${this.config.username}: ${phrase}`);
        this.bot.chat(phrase);
    }

    async lookAround() {
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        // Smooth looking motion
        for (let i = 0; i < 2; i++) {
            const yaw = originalYaw + (Math.random() * 0.8 - 0.4);
            const pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, 
                originalPitch + (Math.random() * 0.4 - 0.2)));
            this.bot.look(yaw, pitch, false);
            await this.delay(300 + Math.random() * 600);
        }
        
        // Return to original look direction
        this.bot.look(originalYaw, originalPitch, false);
    }

    handleChat(message) {
        // Respond to mentions
        if (message.toLowerCase().includes(this.config.username.toLowerCase())) {
            setTimeout(() => {
                const responses = ['Hello!', 'Hi there!', 'Hey!', 'Yes?', 'What\'s up?'];
                const response = responses[Math.floor(Math.random() * responses.length)];
                this.bot.chat(response);
            }, 1000 + Math.random() * 2000);
        }

        // Respond to greetings
        if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi ')) {
            if (Math.random() < 0.3) {
                setTimeout(() => {
                    this.bot.chat('Hello!');
                }, 2000 + Math.random() * 3000);
            }
        }
    }

    handleTimeBasedActions() {
        const time = this.bot.time.timeOfDay;
        
        // Sleep at night if bed is available
        if (time > 13000 && time < 23000) {
            this.trySleep();
        }
    }

    async trySleep() {
        const bed = this.bot.findBlock({
            matching: block => block.name.includes('bed'),
            maxDistance: 10
        });
        
        if (bed) {
            try {
                await this.bot.sleep(bed);
                console.log(`😴 ${this.config.username} is sleeping`);
            } catch (error) {
                // Bed might be occupied or obstructed
            }
        }
    }

    handleHealthCheck() {
        if (this.bot.food < 15) {
            this.bot.autoEat.eat().catch(() => {});
        }
    }

    handleDisconnection() {
        console.log(`🔄 ${this.config.username} scheduling restart...`);
        this.scheduleRestart();
    }

    scheduleRestart() {
        const delay = 10000 + Math.random() * 20000; // 10-30 seconds
        setTimeout(() => {
            console.log(`🔄 Restarting ${this.config.username}...`);
            this.initialize();
        }, delay);
    }

    weightedRandom(options) {
        const totalWeight = options.reduce((sum, option) => sum + option.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const option of options) {
            random -= option.weight;
            if (random <= 0) {
                return option;
            }
        }
        return options[0];
    }

    recordActivity(type) {
        this.activities.push({
            type,
            timestamp: new Date().toISOString(),
            position: this.bot.entity ? this.bot.entity.position : null
        });
        
        // Keep only last 50 activities
        if (this.activities.length > 50) {
            this.activities.shift();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Bot Configuration
const botConfigs = [
    {
        username: 'AGENT',
        password: 'Albin4242',
        host: 'gameplanet.aternos.me',
        port: 51270,
        version: '1.21.10'
    },
    {
        username: 'CROPTON', 
        password: 'Albin4242',
        host: 'gameplanet.aternos.me',
        port: 51270,
        version: '1.21.10'
    }
];

// Start both bots with delays
console.log('🎯 Starting bot system...');

botConfigs.forEach((config, index) => {
    setTimeout(() => {
        new AdvancedBot(config);
    }, index * 15000); // 15 seconds between bot starts
});

// Handle process exit
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down bots gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received termination signal...');
    process.exit(0);
});
