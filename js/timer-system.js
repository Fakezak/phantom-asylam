// Real-time game clock system
class GameTimer {
    constructor() {
        this.gameTime = 7.0; // Start at 7:00 AM
        this.realTimeRatio = 60; // 1 game minute = 1 real second
        this.timeMultiplier = 1;
        this.isPaused = false;
        this.isFrozen = false;
        this.interval = null;
        this.events = {
            12: () => this.startCreepyEvents(), // 12 PM
            15: () => this.freezeTime(),        // 3 AM
            18: () => this.spawnDemon(),        // 6 PM
            22: () => this.maxHorror()          // 10 PM
        };
    }

    start() {
        this.interval = setInterval(() => {
            if (!this.isPaused && !this.isFrozen) {
                this.updateTime();
            }
        }, 1000 / this.realTimeRatio);
    }

    updateTime() {
        // Increment game time by 1 minute
        this.gameTime += (1/60) * this.timeMultiplier;
        
        // Wrap around 24 hours
        if (this.gameTime >= 24) {
            this.gameTime -= 24;
        }
        
        // Check for scheduled events
        this.checkEvents();
        
        // Update display
        this.updateDisplay();
        
        // Update game state
        window.gameState.time = this.gameTime;
    }

    updateDisplay() {
        const timeElement = document.getElementById('gameTime');
        if (timeElement) {
            const hours = Math.floor(this.gameTime);
            const minutes = Math.floor((this.gameTime % 1) * 60);
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12;
            
            timeElement.textContent = 
                `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            
            // Visual effects based on time
            this.applyTimeEffects(hours);
        }
    }

    applyTimeEffects(hours) {
        // Darken screen as night approaches
        const darkness = Math.min(0.8, (hours - 18) * 0.1);
        if (darkness > 0) {
            document.body.style.filter = `brightness(${1 - darkness})`;
        }
        
        // Red tint during demon hours
        if (hours >= 22 || hours < 6) {
            document.body.style.filter += ' hue-rotate(-30deg)';
        }
    }

    checkEvents() {
        const currentHour = Math.floor(this.gameTime);
        if (this.events[currentHour]) {
            this.events[currentHour]();
            delete this.events[currentHour];
        }
    }

    startCreepyEvents() {
        console.log('Creepy events starting...');
        window.gameState.creepyEventsStarted = true;
        
        // Play creepy sound
        this.playSound('assets/sounds/creepy_start.wav');
        
        // Update objective
        const objective = document.getElementById('objective');
        if (objective) {
            objective.textContent = 'Objective: Find the stick QUICKLY!';
            objective.style.color = '#ff0000';
            objective.style.animation = 'flicker 0.5s infinite';
        }
        
        // Begin random events
        this.startRandomEvents();
    }

    freezeTime() {
        if (!window.gameState.gameComplete) {
            this.isFrozen = true;
            console.log('Time frozen at 3 AM - Complete the ritual!');
            
            // Play frozen time sound
            this.playSound('assets/sounds/time_freeze.wav');
            
            // Visual effect
            document.body.style.filter = 'grayscale(50%)';
        }
    }

    startRandomEvents() {
        // Random door slams, whispers, etc.
        setInterval(() => {
            if (Math.random() < 0.1 && window.gameState.creepyEventsStarted) {
                this.triggerRandomEvent();
            }
        }, 10000);
    }

    triggerRandomEvent() {
        const events = [
            () => this.doorSlam(),
            () => this.whisper(),
            () => this.lightFlicker(),
            () => this.shadowFigure()
        ];
        
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        randomEvent();
    }

    doorSlam() {
        console.log('DOOR SLAM!');
        this.playSound('assets/sounds/door_slam.wav');
        
        // Screen shake
        document.body.style.animation = 'shake 0.5s';
        setTimeout(() => {
            document.body.style.animation = '';
        }, 500);
    }

    whisper() {
        console.log('Whisper heard...');
        this.playSound('assets/sounds/whisper.wav');
        
        // Show subtitle
        this.showSubtitle('...find the stick...');
    }

    showSubtitle(text) {
        const subtitle = document.createElement('div');
        subtitle.textContent = text;
        subtitle.style.position = 'fixed';
        subtitle.style.bottom = '100px';
        subtitle.style.left = '50%';
        subtitle.style.transform = 'translateX(-50%)';
        subtitle.style.color = '#ff0000';
        subtitle.style.fontSize = '1.2rem';
        subtitle.style.background = 'rgba(0,0,0,0.7)';
        subtitle.style.padding = '10px 20px';
        subtitle.style.borderRadius = '10px';
        subtitle.style.zIndex = '1000';
        
        document.body.appendChild(subtitle);
        
        setTimeout(() => {
            subtitle.remove();
        }, 3000);
    }

    playSound(src) {
        const audio = new Audio(src);
        audio.volume = 0.7;
        audio.play().catch(console.error);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    setTime(hours) {
        this.gameTime = hours;
        this.updateDisplay();
    }

    getFormattedTime() {
        const hours = Math.floor(this.gameTime);
        const minutes = Math.floor((this.gameTime % 1) * 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }
}

// Initialize global timer
window.gameTimer = new GameTimer();

// Start timer when game starts
function startGameTimer() {
    window.gameTimer.start();
}

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);
