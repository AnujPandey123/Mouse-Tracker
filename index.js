// MouseFollower Class Implementation
class MouseFollower {
    constructor(options) {
        this.id = MouseFollower.instancesCount++;
        this.x = 0;
        this.y = 0;
        this.tx = 0;
        this.ty = 0;
        this.node = document.createElement('div');
        this.node.classList.add('follower');
        this.eyes = document.createElement('div');
        this.eyes.classList.add('eyes');
        this.node.appendChild(this.eyes);
        document.body.appendChild(this.node);
        this.setOptions(options);
        this.enabled = false;
    }

    tick() {
        if (this.enabled) {
            this.update();
            requestAnimationFrame(() => this.tick());
        }
    }

    update() {
        // Update position
        MouseFollower.followStrategies[this.options.followStrategy || 'basic'](this);
        const transforms = [];
        transforms.push(`translate(${this.x - this.options.offsetX}px, ${this.y - this.options.offsetY}px)`);
        if (this.options.xflip && (this.x > MouseFollower.mouse.x)) {
            transforms.push('scaleX(-1)');
        } else {
            transforms.push('scaleX(1)');
        }
        if (this.options.yflip && (this.y > MouseFollower.mouse.y)) {
            transforms.push('scaleY(-1)');
        } else {
            transforms.push('scaleY(1)');
        }
        this.node.style.transform = transforms.join(' ');

        if (this.options.eyes) {
            MouseFollower.followStrategies.eyes(this);
        }
    }

    setOptions(options) {
        options = options || {};
        const defaultOptions = {
            backgroundImage: './ghost_body.gif',
            followStrategy: 'basic',
            width: 50,
            height: 50,
            offsetX: 25,
            offsetY: 25,
            opacity: 0.8,
            spring: 8,
            inertia: 30,
            wobble: 50,
            xflip: false,
            yflip: false,
            eyes: {
                backgroundImage: './ghost_eyes.gif',
                followStrategy: 'eyes',
                width: 12,
                height: 16,
                radius: 5,
                offsetX: 19,
                offsetY: 16,
                opacity: 1
            }
        };
        this.options = {};
        for (const o in defaultOptions) {
            if (o === 'eyes') {
                if (options[o] === false) {
                    this.options[o] = false;
                } else {
                    options[o] = options[o] || {};
                    this.options[o] = {};
                    for (const e in defaultOptions[o]) {
                        this.options[o][e] = options[o].hasOwnProperty(e) ? options[o][e] : defaultOptions[o][e];
                    }
                }
            } else {
                this.options[o] = options.hasOwnProperty(o) ? options[o] : defaultOptions[o];
            }
        }

        this.node.style.backgroundImage = 'url("' + this.options.backgroundImage + '")';
        this.node.style.width = this.options.width + 'px';
        this.node.style.height = this.options.height + 'px';
        this.node.style.opacity = this.options.opacity;
        this.node.style.zIndex = this.options.zindex || MouseFollower.ZINDEX;

        if (this.options.eyes) {
            this.eyes.style.display = '';
            this.eyes.style.backgroundImage = 'url("' + this.options.eyes.backgroundImage + '")';
            this.eyes.style.width = this.options.eyes.width + 'px';
            this.eyes.style.height = this.options.eyes.height + 'px';
            this.eyes.style.opacity = this.options.eyes.opacity;
        } else {
            this.eyes.style.display = 'none';
        }
    }

    start() {
        this.enabled = true;
        this.tick();
    }

    stop() {
        this.enabled = false;
    }

    hide() {
        this.node.style.display = "none";
        this.stop();
    }

    show() {
        this.node.style.display = "";
        this.start();
    }
}

// Static properties and methods for MouseFollower
MouseFollower.ZINDEX = 1000;
MouseFollower.instancesCount = 0;
MouseFollower.mouse = { x: 0, y: 0 };

MouseFollower.followStrategies = {
    basic: function (follower) {
        // Basic follow strategy implementation
        const o = follower.options;
        const dx = MouseFollower.mouse.x - follower.x;
        const dy = MouseFollower.mouse.y - follower.y;

        follower.tx += dx / o.inertia;
        follower.ty += dy / o.inertia;

        follower.x += (follower.tx - follower.x) / o.spring;
        follower.y += (follower.ty - follower.y) / o.spring;
    },
    wobble: function (follower) {
        // Wobble follow strategy implementation
        const o = follower.options;

        follower.dx = follower.dx || 0;
        follower.dy = follower.dy || 0;

        const ox = (follower.tx - follower.x);
        const oy = (follower.ty - follower.y);
        const od = Math.sqrt(ox * ox + oy * oy) || 2;

        const dx = o.spring * (ox / od);
        const dy = o.spring * (oy / od);

        const ddx = (dx - follower.dx) / o.inertia;
        const ddy = (dy - follower.dy) / o.inertia;
        follower.dx += ddx;
        follower.dy += ddy;

        follower.x += follower.dx;
        follower.y += follower.dy;

        follower.tx = MouseFollower.mouse.x + (Math.random() - 0.5) * o.wobble;
        follower.ty = MouseFollower.mouse.y + (Math.random() - 0.5) * o.wobble;
    },
    eyes: function (follower) {
        // Eyes follow strategy implementation
        const e = follower.options.eyes;
        const dx = MouseFollower.mouse.x - follower.x;
        const dy = MouseFollower.mouse.y - follower.y;
        const d = dx * dx + dy * dy;
        let ex = (follower.options.width - e.width) / 2; // Adjust the eye position relative to the follower
        let ey = (follower.options.height - e.height) / 2; // Adjust the eye position relative to the follower
    
        if (d > e.radius * e.radius) {
            const ang = Math.atan2(dy, dx);
            ex += e.radius * Math.cos(ang);
            ey += e.radius * Math.sin(ang);
        }
        follower.eyes.style.transform = `translate(${ex}px, ${ey}px)`; // Apply the translated position to the eyes
    }
    
};


// Mousemove event listener to update mouse coordinates
document.addEventListener('mousemove', function (e) {
    MouseFollower.mouse.x = e.pageX;
    MouseFollower.mouse.y = e.pageY;
});

// Initialize followers based on the selected follower type
function initializeFollowers(followerType) {
    // Remove existing followers
    const container = document.getElementById('container');
    container.innerHTML = '';

    // Create and initialize MouseFollower instances based on the selected type
    const followerOptions = {
        basic: {
            backgroundImage: './ghost_body.gif',
            followStrategy: 'basic',
            width: 50,
            height: 50,
            offsetX: 25,
            offsetY: 25,
            opacity: 0.8,
            spring: 8,
            inertia: 30,
            wobble: 50,
            xflip: false,
            yflip: false,
            eyes: {
                backgroundImage: './ghost_eyes.gif',
                width: 12,
                height: 16,
                radius: 5,
                offsetX: 19,
                offsetY: 16,
                opacity: 1
            }
        },
        bat: {
            backgroundImage: './bat.gif', 
            followStrategy: 'basic', 
            width: 60, 
            height: 60, 
            offsetX: 30, 
            offsetY: 30, 
            opacity: 0.7, 
            spring: 12, 
            inertia: 40, 
            wobble: 80, 
            xflip: false, 
            yflip: false, 
            eyes: {
                backgroundImage: '', 
                width: 16,
                height: 12,
                radius: 8,
                offsetX: 20,
                offsetY: 20,
                opacity: 1
            }
        },
        
        ghost13: {
            backgroundImage: './ghost_body_13.gif',
            followStrategy: 'basic', 
            width: 70, 
            height: 70, 
            offsetX: 35, 
            offsetY: 35, 
            opacity: 0.8, 
            spring: 10, 
            inertia: 35, 
            wobble: 40,
            xflip: false, 
            yflip: false, 
            eyes: {
                backgroundImage: './ghost_eyes_white.gif',
                width: 14,
                height: 20,
                radius: 6,
                offsetX: 22,
                offsetY: 17,
                opacity: 1
            }
        },
        mcghost: {
            backgroundImage: './ghost_body_tartan.gif',
            followStrategy: 'basic', 
            width: 80, 
            height: 80, 
            offsetX: 40, 
            offsetY: 40, 
            opacity: 0.9, 
            spring: 15, 
            inertia: 25, 
            wobble: 60, 
            xflip: false, 
            yflip: false, 
            eyes: {
                backgroundImage: './ghost_eyes_white.gif',
                width: 18,
                height: 14,
                radius: 8,
                offsetX: 30,
                offsetY: 35,
                opacity: 1
            }
        },
        boo: {
            backgroundImage: './ghost.png',
            followStrategy: 'basic', 
            width: 60, 
            height: 60, 
            offsetX: 30, 
            offsetY: 30, 
            opacity: 0.7, 
            spring: 8, 
            inertia: 30, 
            wobble: 50, 
            xflip: false, 
            yflip: false, 
            eyes: {
                backgroundImage: './boo_eyes.gif',
                width: 14,
                height: 20,
                radius: 6,
                offsetX: 22,
                offsetY: 17,
                opacity: 1
            }
        }
        
    };

    const followersCount = 2; 
    for (let i = 0; i < followersCount; i++) {
        const follower = new MouseFollower(followerOptions[followerType]);
        container.appendChild(follower.node);
        follower.start();
    }
}

// Event listener for dropdown menu change
document.getElementById('followerType').addEventListener('change', function(event) {
    const selectedFollowerType = event.target.value;
    initializeFollowers(selectedFollowerType);
});

// Initialization when the DOM content is loaded (default to Basic follower)
document.addEventListener('DOMContentLoaded', function () {
    initializeFollowers('basic');
});
