// Mobile touch controls for 3D movement
class MobileControls {
    constructor() {
        this.joystick = null;
        this.joystickArea = null;
        this.joystickBaseX = 0;
        this.joystickBaseY = 0;
        this.maxDistance = 50;
        this.activeTouch = null;
        this.moveVector = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        this.createControls();
        this.setupEventListeners();
    }

    createControls() {
        // Joystick
        this.joystickArea = document.getElementById('joystick');
        if (!this.joystickArea) {
            this.joystickArea = document.createElement('div');
            this.joystickArea.className = 'joystick-area';
            this.joystickArea.innerHTML = '<div class="joystick" id="joystick"></div>';
            document.querySelector('.mobile-controls').prepend(this.joystickArea);
        }
        
        this.joystick = document.getElementById('joystick');
        
        // Get base position
        const rect = this.joystick.getBoundingClientRect();
        this.joystickBaseX = rect.left + rect.width / 2;
        this.joystickBaseY = rect.top + rect.height / 2;
    }

    setupEventListeners() {
        // Joystick touch
        this.joystick.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.activeTouch = e.touches[0];
        });

        document.addEventListener('touchmove', (e) => {
            if (!this.activeTouch) return;
            
            e.preventDefault();
            const touch = Array.from(e.touches).find(t => t.identifier === this.activeTouch.identifier);
            if (!touch) return;

            const deltaX = touch.clientX - this.joystickBaseX;
            const deltaY = touch.clientY - this.joystickBaseY;
            
            // Calculate distance
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX);
            
            // Limit joystick movement
            const limitedDistance = Math.min(distance, this.maxDistance);
            
            // Update joystick position
            this.joystick.style.transform = `translate(${Math.cos(angle) * limitedDistance}px, ${Math.sin(angle) * limitedDistance}px)`;
            
            // Calculate move vector (normalized)
            this.moveVector = {
                x: Math.cos(angle) * (limitedDistance / this.maxDistance),
                y: Math.sin(angle) * (limitedDistance / this.maxDistance)
            };
            
            // Dispatch move event
            this.dispatchMoveEvent();
        });

        document.addEventListener('touchend', (e) => {
            if (!this.activeTouch) return;
            
            // Reset joystick
            this.joystick.style.transform = 'translate(0, 0)';
            this.moveVector = { x: 0, y: 0 };
            this.activeTouch = null;
            
            // Dispatch stop event
            this.dispatchMoveEvent();
        });

        // Button controls
        const buttons = ['jumpBtn', 'interactBtn', 'flashlightBtn', 'pauseBtn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.handleButtonPress(btnId);
                    btn.style.transform = 'scale(0.9)';
                    btn.style.background = 'rgba(255, 0, 0, 0.8)';
                });

                btn.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    btn.style.transform = 'scale(1)';
                    btn.style.background = 'rgba(139, 0, 0, 0.7)';
                });
            }
        });
    }

    dispatchMoveEvent() {
        const event = new CustomEvent('playerMove', {
            detail: this.moveVector
        });
        window.dispatchEvent(event);
    }

    handleButtonPress(buttonId) {
        switch(buttonId) {
            case 'jumpBtn':
                window.dispatchEvent(new Event('playerJump'));
                break;
            case 'interactBtn':
                window.dispatchEvent(new Event('playerInteract'));
                break;
            case 'flashlightBtn':
                window.dispatchEvent(new Event('toggleFlashlight'));
                break;
            case 'pauseBtn':
                window.dispatchEvent(new Event('togglePause'));
                break;
        }
    }

    getMoveVector() {
        return this.moveVector;
    }
}

// Initialize mobile controls
function setupMobileControls() {
    window.mobileControls = new MobileControls();
    
    // Listen for control events
    window.addEventListener('playerMove', (e) => {
        // This will be handled by player-controls.js
        console.log('Move:', e.detail);
    });
    
    window.addEventListener('playerJump', () => {
        console.log('Jump!');
    });
    
    window.addEventListener('playerInteract', () => {
        console.log('Interact!');
        // Show interaction hint
        showInteractionHint('Nothing to interact with');
    });
    
    window.addEventListener('toggleFlashlight', () => {
        console.log('Toggle flashlight');
        toggleFlashlight();
    });
    
    window.addEventListener('togglePause', () => {
        togglePause();
    });
}

function toggleFlashlight() {
    const battery = document.getElementById('batteryLevel');
    let currentBattery = parseInt(battery.style.width) || 100;
    
    if (currentBattery > 0) {
        currentBattery -= 5;
        updateBattery(currentBattery);
        
        // Visual effect
        document.body.style.filter = 'brightness(1.5)';
        setTimeout(() => {
            document.body.style.filter = '';
        }, 100);
    }
}

// Make functions global
window.setupMobileControls = setupMobileControls;
window.toggleFlashlight = toggleFlashlight;
