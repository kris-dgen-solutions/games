class VirtualJoystick {
    constructor(container, options = {}) {
        this.container = container;
        this.thumb = container.querySelector('.joystick-thumb');

        this.radius = options.radius || 60;
        this.deadzone = options.deadzone || 0.1;
        this.autoReturn = options.autoReturn ?? true;

        this.active = false;
        this.value = { x: 0, y: 0 };

        this._bindEvents();
    }

    _bindEvents() {
        const start = (e) => {
            // console.log("joystick.js start");
            toggleShipEngines(true);
            this.active = true;
        };

        const move = (e) => {
            if (!this.active) return;
            // console.log("joystick.js move");

            const rect = this.container.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            /// Check if the pointer is inside the joystick
            if (
                e.clientX < centerX - this.radius ||
                e.clientX > centerX + this.radius ||
                e.clientY < centerY - this.radius ||
                e.clientY > centerY + this.radius
            ) {
                /// The pointer is outside the joystick
                /// Apply movement based on player and joystick position
                const value = {
                    x: (ship.x - centerX) / this.radius,
                    y: (e.clientY - centerY) / this.radius,
                };
                ship.turnToCoordinates(ship.x+value.x, ship.y+value.y);
                return;
            }

            const touch = e.touches ? e.touches[0] : e;
            let dx = touch.clientX - centerX;
            let dy = touch.clientY - centerY;

            const distance = Math.hypot(dx, dy);
            const clamped = Math.min(distance, this.radius);

            const angle = Math.atan2(dy, dx);
            const limitedX = Math.cos(angle) * clamped;
            const limitedY = Math.sin(angle) * clamped;

            this.thumb.style.transform =
                `translate(calc(-50% + ${limitedX}px), calc(-50% + ${limitedY}px))`;

            let normalizedX = limitedX / this.radius;
            let normalizedY = limitedY / this.radius;

            const magnitude = Math.hypot(normalizedX, normalizedY);

            if (magnitude < this.deadzone) {
                normalizedX = 0;
                normalizedY = 0;
            }

            this.value.x = normalizedX;
            this.value.y = normalizedY;

            this.onMove?.(this.value);
        };

        const end = () => {
            // console.log("joystick.js end");
            this.active = false;

            toggleShipEngines(false);

            if (this.autoReturn) {
                this.thumb.style.transform = 'translate(-50%, -50%)';
                this.value = { x: 0, y: 0 };
                this.onMove?.(this.value);
            }
        };

        // this.container.addEventListener('touchstart', start);
        // window.addEventListener('touchmove', move);
        // window.addEventListener('touchend', end);

        window.addEventListener('pointerdown', start);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', end);
    }
}

// Initialize
const joystickElement = document.querySelector('.joystick-container');
const debug = document.querySelector('.debug');

const joystick = new VirtualJoystick(joystickElement, {
    radius: 60,
    deadzone: 0.15,
    autoReturn: true
});

// Hook into movement
joystick.onMove = (value) => {
    // debug.textContent =
    //     `X: ${value.x.toFixed(2)} | Y: ${value.y.toFixed(2)}`;

    ship.turnToCoordinates(ship.x+value.x, ship.y+value.y);
    // Example: apply movement to player
    // player.x += value.x * speed;
    // player.y += value.y * speed;
};