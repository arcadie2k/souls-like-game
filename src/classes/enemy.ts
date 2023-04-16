import { gt, isNil } from "lodash";
import anime from "animejs/lib/anime.es.js";
import { Point } from "../types";
import ProjectileManager from "./projectile";
import { angleBetween, distanceBetween, toDegrees } from "./utils";
import Player from "./player";

export default class EnemyManager {
    static nextId = 1;
    static entityName = "Enemy Manager";
    static enemies: Enemy[] = [];
    static enemyContainer = document.getElementById("enemy-container");
    static enemyCooldown = 120;

    static createEnemy(position: Point) {
        if (isNil(this.enemyContainer)) return;
        const newEnemy = new Enemy(position);
        this.enemyContainer!.appendChild(newEnemy.elements.enemy);
        this.enemies.push(newEnemy);
    }

    static deleteEnemy(enemyId: number) {
        this.enemies = this.enemies.filter((enemy) => enemy.id !== enemyId);
    }

    static takeDamage(damage: number) {
        this.enemies.forEach((enemy) => {
            const D = distanceBetween(enemy.position, Player.position);
            if (D <= 185) enemy.takeDamage(damage);
        });
    }

    static anim() {
        if(this.enemyCooldown === 0) {
            this.createEnemy({x: 0, y: 0})
            this.enemyCooldown = 120
        }
        else 
            this.enemyCooldown -= 1;

        this.enemies.forEach((enemy) => {
            enemy.update();
        });
    }
}

export class Enemy {
    id: number;
    entityName: string;
    position: Point;
    elements: {
        enemy: HTMLElement;
        rotationLevel: HTMLElement;
        scaleLevel: HTMLElement;
        main: HTMLElement;
        healthbar: HTMLElement;
    };
    stats: {
        level: number;
        health: number;
        maxHealth: number;
        dead: boolean;
    };
    data: {
        direction: number;
        attackCooldown: number;
    };

    createDiv() {
        const enemyDiv = document.createElement("div");
        enemyDiv.classList.add("enemy");
        enemyDiv.setAttribute("data-enemy-id", String(this.id));

        const rotationLevel = document.createElement("div")
        rotationLevel.classList.add("rotation-level")

        const scaleLevel = document.createElement("div.scale-level")
        scaleLevel.classList.add("scale-level")

        const main = document.createElement("main");

        const healthbarContainer = document.createElement("div");
        healthbarContainer.classList.add("healthbar-container");

        const healthbar = document.createElement("div");
        healthbar.classList.add("healthbar");

        healthbarContainer.appendChild(healthbar);
        rotationLevel.appendChild(main);
        scaleLevel.appendChild(healthbarContainer);
        scaleLevel.appendChild(rotationLevel)
        enemyDiv.appendChild(scaleLevel)

        return [enemyDiv, rotationLevel, scaleLevel, main, healthbar];
    }

    getAttackCooldown() {
        return Math.floor(Math.random() * 512) + 128;
    }

    constructor(position: Point) {
        this.id = EnemyManager.nextId++;
        this.entityName = `Enemy ${this.id}`;
        this.position = {
            x: window.innerWidth / 2 + Math.random() * 1000 - 500,
            y: window.innerHeight / 2 + Math.random() * 1000 - 500,
        };
        const [enemy, rotationLevel, scaleLevel, main, healthbar] = this.createDiv();
        this.elements = {
            enemy,
            rotationLevel,
            scaleLevel,
            main,
            healthbar,
        };

        this.stats = {
            level: 1,
            health: 100,
            maxHealth: 100,
            dead: false,
        };
        this.data = {
            direction: 0,
            attackCooldown: this.getAttackCooldown(),
        };

        anime({
            targets: this.elements.scaleLevel,
            scale: [0, 1],
        });
    }

    // Actions
    attack() {
        if (gt(this.data.attackCooldown, 0)) return;
        this.data.attackCooldown = this.getAttackCooldown();
        let shot = false;
        anime({
            targets: this.elements.scaleLevel,
            keyframes: [
                { scale: 1.25, duration: 1000, easing: "spring(1, 80, 10, 0)" },
                { scale: 1.25, duration: 250 },
                { scale: 1 },
            ],
            update: (anim) => {
                if (!this.stats.dead && !shot && anim.progress > 75) {
                    ProjectileManager.createProjectile({ ...this.position });
                    shot = true;
                }
                // if(anim.progress)
            },
        });
    }

    die() {
        this.stats.dead = true;
        EnemyManager.deleteEnemy(this.id);
        anime({
            targets: this.elements.scaleLevel,
            scale: [1, 0],
            complete: () => EnemyManager.enemyContainer!.removeChild(this.elements.enemy),
        });
    }

    takeDamage(amount = 0) {
        this.stats.health = Math.max(0, this.stats.health - amount);
        if (this.stats.health === 0) this.die();
        else {
            anime({
                targets: this.elements.main,
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
        }
    }

    lookToPlayer() {
        this.data.direction = angleBetween(this.position, Player.position);
        this.elements.rotationLevel.style.transform = `rotate(${this.data.direction}rad)`;
    }

    updateHealthbar() {
        this.elements.healthbar.style.width = `${(this.stats.health / this.stats.maxHealth) * 100}%`;
    }

    updatePosition() {
        this.elements.enemy.style.top = `${this.position.y}px`;
        this.elements.enemy.style.left = `${this.position.x}px`;
    }

    update() {
        if (!this.data.attackCooldown) this.attack();
        else {
            this.data.attackCooldown = Math.max(0, this.data.attackCooldown - 1);
        }
        this.lookToPlayer();
        this.updateHealthbar();
        this.updatePosition();
    }
}
