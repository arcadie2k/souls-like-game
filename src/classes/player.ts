import EnemyManager from "./enemy";
import Keys from "./keys";
import Mouse from "./mouse";
import anime from "animejs/lib/anime.es.js";
import { toDegrees } from "./utils";

const Player = {
    id: 1,
    entityName: "Player Object",
    el: document.getElementById("player"),
    sword: document.getElementById("player-sword"),
    elements: {
        healthbar: document.getElementById("healthbar"),
        staminabar: document.getElementById("staminabar"),
    },

    // Player properties (hidden) that are used to do some logic
    data: {
        angle: 0,
        rollFramesLeft: 0,
        rollCooldown: 0,
        rollDirection: [0, 0],
        moveDirection: [0, 0],
        attackCooldown: 0,
        attackCombo: 0,
        staminaRegen: 0,
    },

    // Player properties that are modifieable within the game
    stats: {
        moveSpeed: 5,
        rollSpeed: 20,
        rollCooldownDuration: 60,
        health: 100,
        maxHealth: 100,
        stamina: 100,
        maxStamina: 100,
        staminaRegenTime: 30,
    },

    position: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
    },

    canRoll() {
        return (
            this.stats.stamina > 0 &&
            this.data.rollFramesLeft === 0 &&
            this.data.moveDirection.reduce((t, i) => t + (i !== 0 ? 1 : 0), 0) > 0
        );
    },

    roll() {
        if (!this.canRoll()) return;

        this.consumeStamina(20);
        this.data.rollDirection = [...this.data.moveDirection];
        this.data.rollFramesLeft = 10;
    },

    canAttack() {
        return this.stats.stamina > 0 && !this.data.attackCooldown;
    },

    attack() {
        if (!this.canAttack()) return;

        // If exceeds max combo, return to the first attack
        this.data.attackCombo += 1;
        if (this.data.attackCombo === 3) {
            this.data.attackCombo = 1;
        }

        this.data.attackCooldown = 1;

        const attack1 = () => {
            this.sword!.classList.remove("swing_2");
            this.sword!.classList.add("swing_1");
        };

        const attack2 = () => {
            this.sword!.classList.remove("swing_1");
            this.sword!.classList.add("swing_2");
        };

        const attackCombos = [attack1, attack2];

        attackCombos[this.data.attackCombo - 1]();
        this.consumeStamina(10);

        setTimeout(() => {
            EnemyManager.takeDamage();
        }, 75);

        setTimeout(() => {
            this.data.attackCooldown = 0;
        }, 150);
    },

    takeDamage(amount = 0) {
        this.stats.health = Math.max(0, this.stats.health - amount);
        // if (this.stats.health === 0) this.die();
        // else {
        // }
        anime({
            targets: "#player .scale-level",
            scale: [
                {
                    value: 0.8,
                    duration: 80,
                    easing: "linear",
                },
                {
                    value: 1,
                    duration: 80,
                    easing: "linear",
                },
            ],
        });
    },

    consumeStamina(amount = 0) {
        this.stats.stamina = Math.max(0, this.stats.stamina - amount);
        this.data.staminaRegen = this.stats.staminaRegenTime;
    },

    updateHealthbar() {
        this.elements.healthbar!.style.width = `${(this.stats.health / this.stats.maxHealth) * 100}%`;
    },

    updateStaminabar() {
        this.elements.staminabar!.style.width = `${(this.stats.stamina / this.stats.maxStamina) * 100}%`;
    },

    update() {
        if (!Keys.w && !Keys.s) this.data.moveDirection[1] = 0;
        if (!Keys.a && !Keys.d) this.data.moveDirection[0] = 0;

        if (this.data.staminaRegen === 0) {
            this.stats.stamina = Math.min(this.stats.maxStamina, this.stats.stamina + 0.5);
        } else {
            this.data.staminaRegen = Math.max(0, this.data.staminaRegen - 1);
        }

        // If not rolling
        if (this.data.rollFramesLeft === 0) {
            // Move
            this.position.x += this.stats.moveSpeed * this.data.moveDirection[0];
            this.position.y -= this.stats.moveSpeed * this.data.moveDirection[1];

            // Roll
            if (Keys[" "]) {
                this.roll();
            }
        } else {
            this.position.x += this.stats.rollSpeed * this.data.rollDirection[0];
            this.position.y -= this.stats.rollSpeed * this.data.rollDirection[1];
            this.data.rollFramesLeft = Math.max(0, this.data.rollFramesLeft - 1);

            if (this.data.rollFramesLeft === 0) {
                this.data.rollCooldown = this.stats.rollCooldownDuration;
            }
        }
    },

    lookToCursor() {
        const centerX = this.el!.offsetLeft + this.el!.offsetWidth / 2;
        const centerY = this.el!.offsetTop + this.el!.offsetHeight / 2;

        let desiredAngle = toDegrees(Math.atan2(Mouse.y - centerY, Mouse.x - centerX) + Math.PI / 2);
        this.data.angle = desiredAngle;
        this.el!.style.transform = `rotate(${this.data.angle}deg)`;
    },

    updatePosition() {
        this.el!.style.top = `${this.position.y}px`;
        this.el!.style.left = `${this.position.x}px`;
    },

    anim() {
        this.updateStaminabar();
        this.updateHealthbar();
        this.lookToCursor();
        this.update();
        this.updatePosition();
    },

    initListeners() {
        window.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase();
            Keys[key] = true;

            // Y
            if (key === "w") this.data.moveDirection[1] = 1;
            if (key === "s") this.data.moveDirection[1] = -1;

            // X
            if (key === "a") this.data.moveDirection[0] = -1;
            if (key === "d") this.data.moveDirection[0] = 1;
        });

        window.addEventListener("keyup", (e) => {
            const key = e.key.toLowerCase();
            Keys[key] = false;
        });

        window.addEventListener("mousemove", (e) => {
            Mouse.x = e.clientX;
            Mouse.y = e.clientY;
        });

        window.addEventListener("click", () => {
            this.attack();
        });
    },
};

Player.initListeners();

export default Player;
