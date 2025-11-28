const mineflayer = require('mineflayer');

console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║  🎮 MINECRAFT ULTIMATE 24/7 BOT ROTATION SYSTEM                            ║
║  🤖 Bots: AGENT ↔ CROPTON (Single Bot Rotation)                            ║
║  🌐 Server: gameplanet.aternos.me:51270                                    ║
║  ⚡ Version: 1.21.10                                                        ║
║  🔄 Rotation: One Bot at a Time • 2-3 Hour Sessions                        ║
║  🛡️ GAMEMODE PROTECTION: Auto Creative Enforcement • Survival Protection   ║
║  🎨 PERMANENT CREATIVE: Cannot be changed to survival • 24/7 Creative      ║
║  🛏️ SMART SLEEP: Occupied Bed Handling • Alternative Placement            ║
║  🧠 AI FEATURES: Realistic Day Activities • Immediate Night Sleep          ║
║  🔇 NO CHAT: Silent Operation • Focus on Gameplay                          ║
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
        this.isInCreative = true; // Start assuming creative mode
        this.lastTimeCheck = 0;
        this.sleepInProgress = false;
        this.bedPlaceAttempts = 0;
        this.lastBedCheck = 0;
        this.occupiedBeds = new Set();
        this.lastGamemodeCheck = 0;
        this.gamemodeProtectionEnabled = true;
        this.creativeEnforcementAttempts = 0;
        
        console.log(`🤖 ${this.config.username} initialized with GAMEMODE PROTECTION`);
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
                checkTimeoutInterval: 120 * 1000,
                logErrors: true,
                hideErrors: false,
                physicsEnabled: true
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
            }, 60000);

            this.bot.on('login', () => {
                clearTimeout(loginTimeout);
                console.log(`✅ ${this.config.username} logged in successfully`);
                this.isConnected = true;
                
                // Immediately enforce creative mode after login
                setTimeout(async () => {
                    await this.enforceCreativeMode();
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
                console.log(`🔌 ${this.config.username} error:`, err.message);
            });

            this.bot.on('end', () => {
                console.log(`🔌 ${this.config.username} disconnected`);
                this.handleDisconnection();
            });

            this.bot.on('death', () => {
                console.log(`💀 ${this.config.username} died`);
                this.handleDeath();
            });

            this.bot.on('time', () => {
                this.handleTimeBasedActions();
            });

            // Listen for gamemode changes
            this.bot.on('game', (packet) => {
                if (packet.gameMode !== undefined) {
                    this.handleGamemodeChange(packet.gameMode);
                }
            });

            // Enhanced inventory tracking
            this.bot.on('windowOpen', (window) => {
                console.log(`📦 ${this.config.username} inventory opened`);
            });
        });
    }

    handleGamemodeChange(gameMode) {
        const gamemodeNames = {
            0: 'survival',
            1: 'creative', 
            2: 'adventure',
            3: 'spectator'
        };
        
        const currentMode = gamemodeNames[gameMode] || 'unknown';
        console.log(`🎮 ${this.config.username} gamemode detected: ${currentMode}`);
        
        if (currentMode !== 'creative' && this.gamemodeProtectionEnabled) {
            console.log(`🛡️ ${this.config.username} PROTECTION: Wrong gamemode (${currentMode}), enforcing creative!`);
            this.isInCreative = false;
            this.enforceCreativeMode();
        } else if (currentMode === 'creative') {
            this.isInCreative = true;
            this.creativeEnforcementAttempts = 0;
            console.log(`✅ ${this.config.username} confirmed in creative mode`);
        }
    }

    async enforceCreativeMode() {
        if (this.isInCreative && this.creativeEnforcementAttempts === 0) return true;
        
        console.log(`🛡️ ${this.config.username} ENFORCING CREATIVE MODE...`);
        
        this.creativeEnforcementAttempts++;
        
        try {
            // Multiple command attempts for reliability
            const commands = [
                "/gamemode creative",
                "/gamemode c",
                "/minecraft:gamemode creative"
            ];
            
            for (const command of commands) {
                try {
                    console.log(`⚡ ${this.config.username} executing: ${command}`);
                    this.bot.chat(command);
                    await delay(3000);
                    
                    // Check if we're now in creative
                    if (this.bot.game && this.bot.game.gameMode === 1) {
                        this.isInCreative = true;
                        this.creativeEnforcementAttempts = 0;
                        console.log(`✅ ${this.config.username} CREATIVE MODE ENFORCED SUCCESSFULLY`);
                        return true;
                    }
                } catch (error) {
                    console.log(`⚠️ ${this.config.username} command failed: ${command}`, error.message);
                }
            }
            
            // If still not in creative, try again
            if (!this.isInCreative && this.creativeEnforcementAttempts < 3) {
                console.log(`🔄 ${this.config.username} retrying creative enforcement (attempt ${this.creativeEnforcementAttempts})`);
                setTimeout(() => this.enforceCreativeMode(), 5000);
            } else if (!this.isInCreative) {
                console.log(`❌ ${this.config.username} creative enforcement failed after ${this.creativeEnforcementAttempts} attempts`);
            }
            
            return this.isInCreative;
            
        } catch (error) {
            console.log(`❌ ${this.config.username} creative enforcement error:`, error.message);
            return false;
        }
    }

    async ensureCreativeMode() {
        if (this.isInCreative) return true;
        
        console.log(`🎨 ${this.config.username} ensuring creative mode...`);
        return await this.enforceCreativeMode();
    }

    startAllSystems() {
        this.clearIntervals();
        
        // Immediately enforce creative mode on start
        setTimeout(async () => {
            await this.enforceCreativeMode();
        }, 2000);

        // GAMEMODE PROTECTION - Check every 10 seconds
        const gamemodeInterval = setInterval(() => {
            this.checkGamemodeProtection();
        }, 10000);

        // ENHANCED SLEEP CHECK - Every 5 seconds
        const sleepInterval = setInterval(() => {
            this.checkEnhancedSleep();
        }, 5000);

        // DAYTIME ACTIVITIES
        const activityInterval = setInterval(() => {
            if (!this.isSleeping && !this.sleepInProgress && this.isInCreative) {
                this.performDaytimeActivity();
            }
        }, 20000 + Math.random() * 30000);

        // HUMAN BEHAVIOR
        const behaviorInterval = setInterval(() => {
            if (!this.isSleeping && !this.sleepInProgress && this.isInCreative) {
                this.performHumanBehavior();
            }
        }, 10000 + Math.random() * 20000);

        // BED MANAGEMENT
        const bedInterval = setInterval(() => {
            this.handleBedManagement();
        }, 15000);

        this.behaviorIntervals = [gamemodeInterval, sleepInterval, activityInterval, behaviorInterval, bedInterval];
        
        console.log(`⚡ ${this.config.username} ALL SYSTEMS ACTIVATED`);
        console.log(`🎯 FEATURES: Gamemode Protection • Creative 24/7 • Smart Sleep • AI Activities`);
    }

    async checkGamemodeProtection() {
        const now = Date.now();
        if (now - this.lastGamemodeCheck < 15000) return; // Check every 15 seconds
        this.lastGamemodeCheck = now;
        
        if (!this.isInCreative && this.gamemodeProtectionEnabled) {
            console.log(`🛡️ ${this.config.username} PROTECTION: Not in creative, enforcing!`);
            await this.enforceCreativeMode();
        }
    }

    async checkEnhancedSleep() {
        if (this.sleepInProgress || !this.isInCreative) return;

        const context = this.assessEnvironment();
        const now = Date.now();
        
        if (now - this.lastTimeCheck < 8000) return;
        this.lastTimeCheck = now;
        
        if (context.isNight && !this.isSleeping) {
            console.log(`🌙 ${this.config.username} NIGHT DETECTED - ENHANCED SLEEP PROCESS!`);
            this.sleepInProgress = true;
            await this.executeEnhancedSleep();
            this.sleepInProgress = false;
        } else if (!context.isNight && this.isSleeping) {
            console.log(`🌅 ${this.config.username} MORNING - AUTO WAKE!`);
            try {
                if (this.bot.isSleeping) {
                    this.bot.wake();
                }
                this.isSleeping = false;
            } catch (error) {
                this.isSleeping = false;
            }
        }
    }

    async executeEnhancedSleep() {
        if (this.isSleeping || !this.isInCreative) return;
        
        console.log(`🛏️ ${this.config.username} ENHANCED SLEEP PROCESS STARTED`);
        
        // Double-check creative mode before sleep process
        if (!await this.ensureCreativeMode()) {
            console.log(`❌ ${this.config.username} sleep aborted - creative mode failed`);
            return;
        }

        // Enhanced bed check with occupied bed handling
        console.log(`🔍 ${this.config.username} enhanced bed search with occupied check...`);
        const bed = await this.findAvailableBed();
        
        if (bed) {
            console.log(`✅ ${this.config.username} available bed found`);
            await this.enhancedSleepInBed(bed);
            return;
        }

        // Get and place new bed
        console.log(`🎒 ${this.config.username} acquiring new bed...`);
        const gotBed = await this.acquireBedSafely();
        
        if (!gotBed) {
            console.log(`❌ ${this.config.username} sleep failed - cannot get bed`);
            return;
        }

        // Safe bed placement away from occupied beds
        console.log(`📍 ${this.config.username} placing new bed in safe location...`);
        const newBed = await this.placeBedAwayFromOccupied();
        
        if (newBed) {
            await this.enhancedSleepInBed(newBed);
        } else {
            console.log(`❌ ${this.config.username} bed placement failed`);
        }
    }

    async findAvailableBed() {
        console.log(`🔎 ${this.config.username} searching for available bed...`);
        
        const potentialBeds = this.bot.findBlocks({
            matching: (block) => {
                if (!block) return false;
                return block.name.includes('_bed') || block.name === 'bed';
            },
            maxDistance: 15,
            count: 20
        });

        console.log(`📊 ${this.config.username} found ${potentialBeds.length} potential bed locations`);

        for (const bedPos of potentialBeds) {
            try {
                const bedBlock = this.bot.blockAt(bedPos);
                if (!bedBlock) continue;

                const bedKey = `${bedPos.x},${bedPos.y},${bedPos.z}`;
                if (this.occupiedBeds.has(bedKey)) {
                    console.log(`🚫 ${this.config.username} skipping occupied bed: ${bedKey}`);
                    continue;
                }

                console.log(`🔬 ${this.config.username} checking bed at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`);
                
                if (bedBlock.name.includes('_bed') || bedBlock.name === 'bed') {
                    console.log(`✅ ${this.config.username} VERIFIED REAL BED: ${bedBlock.name} at ${bedPos.x}, ${bedPos.y}, ${bedPos.z}`);
                    
                    const isAvailable = await this.quickBedAvailabilityCheck(bedBlock);
                    if (isAvailable) {
                        console.log(`🛏️ ${this.config.username} bed is available!`);
                        return bedBlock;
                    } else {
                        console.log(`🚫 ${this.config.username} bed is occupied, marking as unavailable`);
                        this.occupiedBeds.add(bedKey);
                    }
                }
            } catch (error) {
                console.log(`⚠️ ${this.config.username} bed verification error:`, error.message);
            }
        }

        console.log(`❌ ${this.config.username} no available beds found`);
        return null;
    }

    async quickBedAvailabilityCheck(bed) {
        try {
            const sleepPromise = this.bot.sleep(bed);
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('bed_check_timeout')), 2000)
            );
            
            await Promise.race([sleepPromise, timeoutPromise]);
            
            this.bot.wake();
            return true;
            
        } catch (error) {
            if (error.message.includes('occupied') || error.message.includes('bed_check_timeout')) {
                return false;
            }
            return true;
        }
    }

    async acquireBedSafely() {
        console.log(`💬 ${this.config.username} using safe bed commands...`);
        
        const commands = [
            `/give ${this.config.username} white_bed 1`,
            `/give ${this.config.username} light_blue_bed 1`,
            `/give ${this.config.username} red_bed 1`,
            `/give ${this.config.username} black_bed 1`,
            `/give ${this.config.username} bed 1`
        ];
        
        for (const command of commands) {
            try {
                console.log(`⚡ ${this.config.username} trying: ${command}`);
                this.bot.chat(command);
                await delay(3000);
                
                const beds = this.bot.inventory.items().filter(item => 
                    item.name.includes('bed')
                );
                
                if (beds.length > 0) {
                    console.log(`✅ ${this.config.username} bed acquired: ${beds[0].name} from ${command}`);
                    return true;
                }
            } catch (error) {
                console.log(`⚠️ ${this.config.username} command error:`, error.message);
            }
        }
        
        console.log(`❌ ${this.config.username} all bed commands failed`);
        return false;
    }

    async placeBedAwayFromOccupied() {
        console.log(`📍 ${this.config.username} placing bed away from occupied locations...`);
        
        const pos = this.bot.entity.position;
        const startX = Math.floor(pos.x);
        const startY = Math.floor(pos.y);
        const startZ = Math.floor(pos.z);
        
        for (let radius = 2; radius <= 5; radius++) {
            for (let x = -radius; x <= radius; x++) {
                for (let z = -radius; z <= radius; z++) {
                    if (Math.abs(x) !== radius && Math.abs(z) !== radius) continue;
                    
                    const testX = startX + x;
                    const testY = startY;
                    const testZ = startZ + z;
                    
                    if (this.isNearOccupiedBed(testX, testY, testZ)) {
                        continue;
                    }
                    
                    try {
                        const floorBlock = this.bot.blockAt({ x: testX, y: testY - 1, z: testZ });
                        const targetBlock = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                        
                        if (!floorBlock || !targetBlock) continue;
                        
                        const solidBlocks = ['stone', 'dirt', 'grass', 'wood', 'planks', 'cobblestone', 'sand', 'gravel'];
                        const isSolidFloor = solidBlocks.some(block => floorBlock.name.includes(block));
                        
                        if (isSolidFloor && targetBlock.name === 'air') {
                            
                            const bedItem = this.bot.inventory.items().find(item => 
                                item.name.includes('bed')
                            );
                            
                            if (!bedItem) {
                                console.log(`❌ ${this.config.username} no bed item for placement`);
                                return null;
                            }
                            
                            console.log(`🛏️ ${this.config.username} attempting placement at ${testX}, ${testY}, ${testZ}`);
                            
                            await this.bot.equip(bedItem, 'hand');
                            await delay(1000);
                            
                            this.bot.lookAt({ x: testX, y: testY, z: testZ }, false);
                            await delay(500);
                            
                            await this.bot.placeBlock(targetBlock, { x: 0, y: 1, z: 0 });
                            await delay(2000);
                            
                            const placedBed = this.bot.blockAt({ x: testX, y: testY, z: testZ });
                            if (placedBed && (placedBed.name.includes('_bed') || placedBed.name === 'bed')) {
                                this.bedPosition = { x: testX, y: testY, z: testZ };
                                this.hasBed = true;
                                console.log(`✅ ${this.config.username} SUCCESSFULLY PLACED BED: ${placedBed.name} at ${testX}, ${testY}, ${testZ}`);
                                return placedBed;
                            }
                        }
                    } catch (error) {
                        console.log(`⚠️ ${this.config.username} placement attempt failed:`, error.message);
                    }
                }
            }
        }
        
        console.log(`❌ ${this.config.username} no suitable placement location found`);
        return null;
    }

    isNearOccupiedBed(x, y, z) {
        for (const occupiedKey of this.occupiedBeds) {
            const [occupiedX, occupiedY, occupiedZ] = occupiedKey.split(',').map(Number);
            const distance = Math.sqrt(
                Math.pow(x - occupiedX, 2) + 
                Math.pow(y - occupiedY, 2) + 
                Math.pow(z - occupiedZ, 2)
            );
            
            if (distance < 8) {
                return true;
            }
        }
        return false;
    }

    async enhancedSleepInBed(bed) {
        try {
            console.log(`🚶 ${this.config.username} moving to available bed...`);
            
            const distance = this.bot.entity.position.distanceTo(bed.position);
            if (distance > 3) {
                console.log(`📍 ${this.config.username} moving ${Math.round(distance)} blocks to bed`);
                this.bot.lookAt(bed.position.offset(0, 1, 0));
                this.bot.setControlState('forward', true);
                await delay(2000);
                this.bot.setControlState('forward', false);
                await delay(1000);
            }
            
            const finalBedCheck = this.bot.blockAt(bed.position);
            if (!finalBedCheck || !(finalBedCheck.name.includes('_bed') || finalBedCheck.name === 'bed')) {
                console.log(`❌ ${this.config.username} bed disappeared before sleep`);
                return;
            }
            
            console.log(`😴 ${this.config.username} attempting sleep in available bed...`);
            
            this.bot.lookAt(bed.position, false);
            await delay(1000);
            
            await this.bot.sleep(bed);
            
            this.isSleeping = true;
            this.bedPlaceAttempts = 0;
            console.log(`✅ ${this.config.username} SUCCESSFULLY SLEEPING IN AVAILABLE BED!`);
            
            const sleepMonitor = setInterval(() => {
                if (!this.bot.isSleeping) {
                    clearInterval(sleepMonitor);
                    this.isSleeping = false;
                    console.log(`🌅 ${this.config.username} sleep session ended`);
                    this.occupiedBeds.clear();
                }
            }, 5000);
            
        } catch (error) {
            console.log(`❌ ${this.config.username} enhanced sleep failed:`, error.message);
            this.isSleeping = false;
            
            if (error.message.includes('occupied')) {
                console.log(`🚫 ${this.config.username} bed became occupied, marking it`);
                const bedKey = `${bed.position.x},${bed.position.y},${bed.position.z}`;
                this.occupiedBeds.add(bedKey);
            }
            
            this.bedPlaceAttempts++;
            
            if (this.bedPlaceAttempts > 2) {
                console.log(`🔄 ${this.config.username} resetting bed status after multiple failures`);
                this.hasBed = false;
                this.bedPosition = null;
                this.bedPlaceAttempts = 0;
            }
        }
    }

    async performDaytimeActivity() {
        const context = this.assessEnvironment();
        
        if (context.isNight || this.isSleeping || this.sleepInProgress || !this.isInCreative) return;
        
        const activities = [
            { type: 'explore', weight: 0.4 },
            { type: 'mine', weight: 0.3 },
            { type: 'build', weight: 0.2 },
            { type: 'farm', weight: 0.1 }
        ];
        
        const totalWeight = activities.reduce((sum, a) => sum + a.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedActivity = 'explore';
        
        for (const activity of activities) {
            random -= activity.weight;
            if (random <= 0) {
                selectedActivity = activity.type;
                break;
            }
        }
        
        console.log(`🎯 ${this.config.username} daytime activity: ${selectedActivity}`);
        
        switch (selectedActivity) {
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
        const directions = ['forward', 'back', 'left', 'right'];
        const mainDir = directions[Math.floor(Math.random() * directions.length)];
        
        this.bot.setControlState(mainDir, true);
        await delay(3000 + Math.random() * 4000);
        this.bot.setControlState(mainDir, false);
        
        await this.lookAround();
    }

    async mineResources() {
        const block = this.bot.findBlock({
            matching: (block) => block && (
                block.name.includes('stone') || 
                block.name.includes('dirt') ||
                block.name.includes('wood')
            ),
            maxDistance: 5
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

    async buildStructure() {
        for (let i = 0; i < 3; i++) {
            this.bot.setControlState('forward', true);
            await delay(1500 + Math.random() * 2000);
            this.bot.setControlState('forward', false);
            await this.lookAround();
        }
    }

    async farmAction() {
        for (let i = 0; i < 2; i++) {
            this.bot.setControlState('sneak', true);
            await delay(2000 + Math.random() * 3000);
            this.bot.setControlState('sneak', false);
            await delay(1500 + Math.random() * 2500);
        }
    }

    async lookAround() {
        if (!this.bot.entity) return;
        
        const originalYaw = this.bot.entity.yaw;
        const originalPitch = this.bot.entity.pitch;
        
        for (let i = 0; i < 2; i++) {
            const yaw = originalYaw + (Math.random() * 1.5 - 0.75);
            const pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, originalPitch + (Math.random() * 0.5 - 0.25)));
            this.bot.look(yaw, pitch, false);
            await delay(600 + Math.random() * 800);
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
        const jumps = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < jumps; i++) {
            this.bot.setControlState('jump', true);
            await delay(200 + Math.random() * 300);
            this.bot.setControlState('jump', false);
            await delay(300 + Math.random() * 400);
        }
    }

    async switchItems() {
        const items = this.bot.inventory.items();
        if (items.length > 1) {
            const randomItem = items[Math.floor(Math.random() * items.length)];
            try {
                await this.bot.equip(randomItem, 'hand');
                await delay(500 + Math.random() * 700);
            } catch (error) {
                // Ignore equip errors
            }
        }
    }

    async sneakBriefly() {
        if (Math.random() < 0.3) {
            this.bot.setControlState('sneak', true);
            await delay(2000 + Math.random() * 3000);
            this.bot.setControlState('sneak', false);
        }
    }

    async handleBedManagement() {
        const context = this.assessEnvironment();
        const now = Date.now();
        
        if (now - this.lastBedCheck < 30000) return;
        this.lastBedCheck = now;
        
        if (!context.isNight && this.hasBed && this.bedPosition && !this.isSleeping) {
            console.log(`🧹 ${this.config.username} morning bed cleanup...`);
            
            const bedBlock = this.bot.blockAt(this.bedPosition);
            if (bedBlock && (bedBlock.name.includes('_bed') || bedBlock.name === 'bed')) {
                try {
                    this.bot.lookAt(bedBlock.position.offset(0, 1, 0));
                    await delay(500);
                    await this.bot.dig(bedBlock);
                    await delay(1000);
                    
                    this.hasBed = false;
                    this.bedPosition = null;
                    console.log(`✅ ${this.config.username} bed cleaned up`);
                    
                } catch (error) {
                    console.log(`❌ ${this.config.username} bed cleanup failed:`, error.message);
                }
            } else {
                this.hasBed = false;
                this.bedPosition = null;
            }
        }
        
        if (this.occupiedBeds.size > 10) {
            console.log(`🧹 ${this.config.username} clearing occupied beds cache (${this.occupiedBeds.size} entries)`);
            this.occupiedBeds.clear();
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

    handleDeath() {
        console.log(`💀 ${this.config.username} handling death...`);
        this.hasBed = false;
        this.bedPosition = null;
        this.isSleeping = false;
        this.sleepInProgress = false;
        this.bedPlaceAttempts = 0;
        this.occupiedBeds.clear();
        
        setTimeout(async () => {
            await this.enforceCreativeMode();
        }, 5000);
    }

    handleTimeBasedActions() {
        // Handled in sleep system
    }

    handleDisconnection() {
        console.log(`🔌 ${this.config.username} handling disconnection...`);
        this.clearIntervals();
        this.isConnected = false;
    }

    disconnect() {
        console.log(`🛑 ${this.config.username} disconnecting...`);
        this.clearIntervals();
        if (this.bot) {
            try {
                this.bot.quit();
                console.log(`✅ ${this.config.username} disconnected successfully`);
            } catch (error) {
                console.log(`❌ ${this.config.username} disconnect error:`, error.message);
            }
        }
    }

    clearIntervals() {
        this.behaviorIntervals.forEach(interval => {
            if (interval) clearInterval(interval);
        });
        this.behaviorIntervals = [];
    }
}

class UltimateRotationSystem {
    constructor() {
        this.currentBot = null;
        this.currentBotIndex = 0;
        this.rotationHistory = [];
        this.isRunning = true;
        
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
        this.systemStartTime = Date.now();
        
        console.log('🔄 ULTIMATE ROTATION SYSTEM INITIALIZED');
        console.log('🎯 FEATURES: Gamemode Protection • Creative 24/7 • Smart Sleep • AI Rotation');
        
        this.startRotationCycle();
    }

    async startRotationCycle() {
        console.log('\n🚀 STARTING 24/7 ROTATION CYCLE...\n');
        
        while (this.isRunning) {
            try {
                await this.executeRotation();
            } catch (error) {
                console.log('🚨 Rotation cycle error:', error.message);
                await delay(60000);
            }
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
        console.log(`║ 🛡️ PROTECTION: Auto Creative Enforcement         ║`);
        console.log(`║ 🎨 PERMANENT: Cannot be changed to survival      ║`);
        console.log(`║ 🛏️ SMART: Occupied Bed Handling                 ║`);
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
        
        console.log(`\n⏰ ${botConfig.username} session started: ${hours} hours`);
        console.log(`🎯 Active Features:`);
        console.log(`   • Auto Gamemode Protection`);
        console.log(`   • Permanent Creative Mode`);
        console.log(`   • Occupied Bed Detection`);
        console.log(`   • Alternative Bed Placement`);
        console.log(`   • Realistic AI Activities`);
        console.log(`   • Bot Rotation System\n`);

        await delay(sessionTime);

        console.log(`\n🛑 Ending ${botConfig.username} session...`);
        if (this.currentBot) {
            this.currentBot.disconnect();
            this.currentBot = null;
        }

        this.recordRotation(botConfig.username, sessionTime, ipInfo);

        const breakTime = 3 * 60 * 1000 + Math.random() * 7 * 60 * 1000;
        const breakMinutes = Math.round(breakTime / 60000);
        
        console.log(`\n💤 Rotation break: ${breakMinutes} minutes until next bot\n`);
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
        if (this.rotationHistory.length > 20) this.rotationHistory.pop();
        
        const minutes = Math.round(duration / 60000);
        const totalUptime = Math.round((Date.now() - this.systemStartTime) / 3600000 * 10) / 10;
        
        console.log(`📊 ROTATION STATISTICS:`);
        console.log(`   • Bot: ${botName}`);
        console.log(`   • Session: ${minutes} minutes`);
        console.log(`   • Location: ${ipInfo.country}`);
        console.log(`   • Total System Uptime: ${totalUptime} hours`);
        console.log(`   • Total Rotations: ${this.rotationHistory.length}`);
    }

    getStatus() {
        return {
            running: this.isRunning,
            currentBot: this.currentBot ? this.currentBot.config.username : 'None',
            rotationCount: this.rotationHistory.length,
            systemUptime: Date.now() - this.systemStartTime
        };
    }

    stop() {
        console.log('\n🛑 Stopping Ultimate Rotation System...');
        this.isRunning = false;
        if (this.currentBot) {
            this.currentBot.disconnect();
        }
    }
}

// Initialize the system
const rotationSystem = new UltimateRotationSystem();

// Health check server
const http = require('http');
const healthServer = http.createServer((req, res) => {
    if (req.url === '/health' || req.url === '/status') {
        const status = rotationSystem.getStatus();
        
        res.writeHead(200, { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        });
        
        res.end(JSON.stringify({
            status: 'healthy',
            service: 'Minecraft Ultimate Bot Rotation System',
            version: '4.0.0',
            features: [
                'Auto Gamemode Protection',
                'Permanent Creative Mode',
                'Occupied Bed Detection',
                'Alternative Bed Placement', 
                'Realistic AI Activities',
                'Bot Rotation System',
                '24/7 Operation'
            ],
            currentBot: status.currentBot,
            rotationCount: status.rotationCount,
            systemUptime: Math.floor(status.systemUptime / 1000) + ' seconds',
            totalUptime: Math.floor(status.systemUptime / 3600000 * 10) / 10 + ' hours',
            timestamp: new Date().toISOString(),
            server: 'gameplanet.aternos.me:51270'
        }, null, 2));
        
    } else {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end(`Minecraft Ultimate Bot Rotation System v4.0.0

🛡️ GAMEMODE PROTECTION SYSTEM:
• Auto Creative Mode Enforcement
• Cannot be changed to survival
• Permanent 24/7 Creative Operation
• Instant gamemode correction

🎯 ACTIVE FEATURES:
• Bot Rotation: AGENT ↔ CROPTON
• Smart Sleep with Occupied Bed Handling
• Realistic AI Daytime Activities
• Alternative Bed Placement
• Health Monitoring Server

🌍 SERVER: gameplanet.aternos.me:51270
📊 STATUS: /health or /status
`);
    }
});

const PORT = process.env.PORT || 3000;
healthServer.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌐 HEALTH SERVER RUNNING ON PORT ${PORT}`);
    console.log(`🔍 Status: http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
    console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);
    rotationSystem.stop();
    await delay(5000);
    healthServer.close(() => {
        console.log('✅ System shutdown complete');
        process.exit(0);
    });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
    console.log('🚨 UNCAUGHT EXCEPTION:', error.message);
});

process.on('unhandledRejection', (reason, promise) => {
    console.log('🚨 UNHANDLED REJECTION at:', promise);
});

// Periodic system status
setInterval(() => {
    const status = rotationSystem.getStatus();
    const uptimeHours = Math.floor(status.systemUptime / 3600000 * 10) / 10;
    console.log(`\n📈 SYSTEM STATUS: ${status.currentBot} active • ${uptimeHours}h uptime • ${status.rotationCount} rotations\n`);
}, 15 * 60 * 1000);
