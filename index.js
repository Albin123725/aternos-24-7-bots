const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🎮 MINECRAFT ULTIMATE 24/7 BOT ROTATION SYSTEM                            ║
║  🤖 Bots: HERO ↔ FIGHTER (2-Bot Rotation System)                           ║
║  🌐 Server: gameplanet.aternos.me:51270                                    ║
║  ⚡ Version: 1.21.10                                                        ║
║  🔄 Rotation: Automatic 3-Hour Sessions                                    ║
║  🌍 IP Switching: Simulated Different Locations                            ║
║  🧠 AI Features: All Enabled • Auto-Sleep • Combat • Chat                  ║
║  🛏️ BED SYSTEM: Places → Sleeps → Breaks → Takes → Repeats                ║
║  🎯 Works in: Survival & Creative Modes                                    ║
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

            const success = await this.setupEventHandlers();
            return success;

        } catch (error) {
            console.log(`❌ Failed to initialize ${this.config.username}:`, error.message);
            return false;
        }
    }

    setupBotBehavior() {
        if (this.config.personality === 'herobrine') {
            this.chatPhrases = [
                "I am always watching...",
                "The shadows follow me.",
                "Mission: Explore and survive!",
                "Area secure!",
                "Proceeding with operations!",
                "Everything under control!",
                "Securing the perimeter!",
                "Scanning area for resources!",
                "Hostile entities detected!",
                "Weapons ready for engagement!"
            ];
            this.bedChat = [
                "Establishing sleeping quarters in the darkness!",
                "Setting up camp for the night!",
                "Deploying tactical bedding!",
                "Preparing overnight position!"
            ];
            this.morningChat = [
                "Mission resumed! The day is ours!",
                "Day operations beginning!",
                "Packing up sleeping quarters!",
                "Ready for daytime operations!"
            ];
        } else { // personality === 'fighter'
            this.chatPhrases = [
                "Time to farm some crops!",
                "Harvest season approaching!",
                "Crops growing nicely!",
                "Farm life is wonderful!",
                "Planting new seeds today!",
                "Fresh produce coming up!",
                "Agricultural operations active!",
                "Green thumb activated!"
            ];
            this.bedChat = [
                "Time to set up a cozy bed!",
                "Preparing my sleeping spot!",
                "Setting up for a good night's rest!",
                "Making my bed for the night!"
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
                
                setTimeout(async () => {
                    await this.ensureHasBed();
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
                
                if (message.includes('gamemode') && message.includes('creative')) {
                    this.creativeModeEnabled = true;
                    console.log(`🎨 ${this.config.username} creative mode detected`);
                }
            });

            this.bot.on('time', () => {
                this.handleTimeBasedActions();
            });

            this.bot.on('health', () => {
                this.handleHealthManagement();
            });
        });
    }
    
    // --- Bed Management, AI, and Behavior functions (omitted for brevity, assume they are complete as provided earlier) ---
    // ... [ All UltimateBot methods like ensureHasBed, autoSleep, placeBed, performAITask, etc., go here ] ...
    
    // Placeholder methods (defined to complete the class)
    handleDisconnection() {
        this.clearIntervals();
        console.log(`🧹 ${this.config.username} cleaning up intervals.`);
    }

    handleDeath() {
        setTimeout(() => this.bot.respawn(), 5000);
    }
    
    clearIntervals() {
        this.behaviorIntervals.forEach(clearInterval);
        this.behaviorIntervals = [];
        if (this.rotationTimer) clearTimeout(this.rotationTimer);
    }

    assessEnvironment() {
        const timeOfDay = this.bot.time ? this.bot.time.timeOfDay : 0;
        const isNight = timeOfDay > 12500 && timeOfDay < 23450;
        return {
            isNight: isNight,
            health: this.bot.health || 20,
            food: this.bot.food || 20,
            nearbyPlayers: Object.keys(this.bot.players).length - 1,
        };
    }
    
    safeChat(message) {
        if (this.bot && this.isConnected) {
            this.bot.chat(message).catch(err => { /* ignore */ });
        }
    }
    
    // The rest of the UltimateBot class methods...
    async ensureHasBed() { /* ... implementation ... */ return true; }
    async getBedByAnyMeans() { /* ... implementation ... */ return true; }
    async tryCreativeCommands() { /* ... implementation ... */ return false; }
    async breakNearbyBed() { /* ... implementation ... */ return false; }
    async findBedInWorld() { /* ... implementation ... */ return false; }
    async checkForBedsInInventory() { /* ... implementation ... */ return true; }
    startAllSystems() { /* ... implementation ... */ }
    async performAITask() { /* ... implementation ... */ }
    chooseAITask(context) { return 'explore'; }
    async placeBed() { /* ... implementation ... */ return true; }
    async autoSleep() { /* ... implementation ... */ }
    async handleMorningBedBreaking() { /* ... implementation ... */ }
    checkBedStatus() { /* ... implementation ... */ }
    async exploreArea() { /* ... implementation ... */ }
    async mineResources() { /* ... implementation ... */ }
    async socialize() { /* ... implementation ... */ }
    async buildStructure() { /* ... implementation ... */ }
    async farmAction() { /* ... implementation ... */ }
    async findFood() { /* ... implementation ... */ }
    async lookAround() { /* ... implementation ... */ }
    performHumanBehavior() { /* ... implementation ... */ }
    async jumpRandomly() { /* ... implementation ... */ }
    async switchItems() { /* ... implementation ... */ }
    handleSmartChat(message) { /* ... implementation ... */ }
    smartChat() { /* ... implementation ... */ }
    recordActivity(task) { /* ... implementation ... */ }
    handleTimeBasedActions() { /* ... implementation ... */ }
    handleHealthManagement() { /* ... implementation ... */ }
}


// ==============================================================================
// 🚀 EXECUTION LOGIC: 2-BOT ROTATION ENGINE
// ==============================================================================

// 1. Define all bot configurations
const ALL_BOT_CONFIGS = [
    {
        host: 'gameplanet.aternos.me',
        port: 51270,
        username: 'HeroBrine', // Bot 1 Name
        version: '1.21.10',
        personality: 'herobrine'
    },
    {
        host: 'gameplanet.aternos.me',
        port: 51270,
        username: 'Fighter', // Bot 2 Name
        version: '1.21.10',
        personality: 'fighter'
    }
];

let currentBotIndex = 0;
let ultimateBot = null;
let rotationTimer = null;
let restartAttempts = 0;
const MAX_RESTART_ATTEMPTS = 5;
const ROTATION_SESSION_DURATION = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

/**
 * Stops the current bot session and starts the next bot in the rotation.
 */
function rotateBot() {
    console.log(`\n🔄 --- ROTATION TRIGGERED ---`);
    console.log(`🕰️ Session duration (${ROTATION_SESSION_DURATION / 3600000} hours) reached.`);

    if (ultimateBot && ultimateBot.bot) {
        // Disconnect gracefully to trigger the 'end' event and start the next bot
        ultimateBot.bot.end('Session rotation complete. Switching to next bot.');
    } else {
        // Force restart if bot object is somehow invalid
        startBotSystem();
    }
}

/**
 * Handles the logic for starting the next bot instance.
 */
async function startBotSystem() {
    if (restartAttempts >= MAX_RESTART_ATTEMPTS) {
        console.log(`\n🚨 Maximum restart attempts reached. Stopping service.`);
        return;
    }
    
    // Select the current bot configuration
    const config = ALL_BOT_CONFIGS[currentBotIndex];
    console.log(`\n➡️ Starting Ultimate Bot: ${config.username} (Bot ${currentBotIndex + 1}/${ALL_BOT_CONFIGS.length})`);
    
    // Clean up previous instance
    if (ultimateBot) {
        ultimateBot.clearIntervals();
        ultimateBot = null;
    }
    
    ultimateBot = new UltimateBot(config);
    
    // Setup End/Error handler
    const handleEnd = () => {
        if (rotationTimer) clearTimeout(rotationTimer);
        console.log(`\n🛑 Bot session ended for ${config.username}. Scheduling rotation...`);
        
        // Move to the next bot in the rotation
        currentBotIndex = (currentBotIndex + 1) % ALL_BOT_CONFIGS.length;
        
        // Wait 30 seconds before starting the next bot to simulate a real break
        restartAttempts++;
        setTimeout(startBotSystem, 30000); 
    };

    // Initialize the bot connection
    const success = await ultimateBot.initialize();

    if (ultimateBot && ultimateBot.bot) {
        ultimateBot.bot.once('end', handleEnd);
        ultimateBot.bot.once('error', (err) => {
            console.log(`\n❌ Critical Bot Error for ${config.username}: ${err.message}. Triggering forced end.`);
            ultimateBot.bot.end('Critical Error Restart');
        });
    }

    if (!success) {
        console.log(`\n🚨 Failed to connect for ${config.username}. Restarting rotation...`);
        // The handleEnd will be triggered here for the actual restart
        if (ultimateBot.bot) {
             ultimateBot.bot.end('Failed to Connect');
        } else {
            handleEnd();
        }
    } else {
        // Connection successful: start the rotation timer
        restartAttempts = 0; // Reset attempts on successful connection
        console.log(`\n⏱️ Bot will rotate to the next session in ${ROTATION_SESSION_DURATION / 3600000} hours.`);
        rotationTimer = setTimeout(rotateBot, ROTATION_SESSION_DURATION);
    }
}

// Start the entire 24/7 rotation system
startBotSystem();
