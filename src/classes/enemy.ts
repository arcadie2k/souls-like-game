import { gt, isNil } from "lodash";
import anime from "animejs/lib/anime.es.js";
import { Point, Velocity } from "../types";
import ProjectileManager from "./projectile";
import { angleBetween, distanceBetween } from "./utils";
import Player from "./player";
import {
    PUSH,
    UPDATE_HEALTHBAR,
    UPDATE_POSITION,
    UPDATE_VELOCITY,
} from "./functions";
import DamageIndicator from "./DamageIndicator";

type RankType = "common" | "uncommon" | "rare" | "epic";
type CombatType = "closed" | "ranged";

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
            if (D <= 185) {
                enemy.takeDamage(damage);
                DamageIndicator.createDamage(enemy.position, damage);
                PUSH(enemy, enemy.data.direction, 2);
            }
        });
    }

    static anim() {
        if (this.enemyCooldown === 0) {
            this.createEnemy({ x: 0, y: 0 });
            this.enemyCooldown = 120;
        } else this.enemyCooldown -= 1;

        this.enemies.forEach((enemy) => {
            enemy.update();
        });
    }
}

export class Enemy {
    id: number;
    entityName: string;
    position: Point;
    velocity: Velocity;
    elements: {
        enemy: HTMLElement;
        rotationLevel: HTMLElement;
        scaleLevel: HTMLElement;
        main: HTMLElement;
        healthbarContainer: HTMLElement;
        healthbar: HTMLElement;
    };
    stats: {
        dead: boolean;
        level: number;
        moveSpeed: number;
        health: number;
        maxHealth: number;
        rankType: RankType;
        combatType: CombatType;
    };
    data: {
        direction: number;
        attackCooldown: number;
    };

    createDiv() {
        const enemyDiv = document.createElement("div");
        enemyDiv.classList.add("enemy");
        enemyDiv.setAttribute("data-enemy-id", String(this.id));

        const rotationLevel = document.createElement("div");
        rotationLevel.classList.add("rotation-level");

        const scaleLevel = document.createElement("div.scale-level");
        scaleLevel.classList.add("scale-level");

        const main = document.createElement("main");

        const healthbarContainer = document.createElement("div");
        healthbarContainer.classList.add("healthbar-container");
        healthbarContainer.setAttribute(
            "data-enemy-level",
            String(this.stats.level)
        );

        const healthbar = document.createElement("div");
        healthbar.classList.add("healthbar");

        healthbarContainer.appendChild(healthbar);
        rotationLevel.appendChild(main);
        scaleLevel.appendChild(healthbarContainer);
        scaleLevel.appendChild(rotationLevel);
        enemyDiv.appendChild(scaleLevel);

        return [
            enemyDiv,
            rotationLevel,
            scaleLevel,
            main,
            healthbarContainer,
            healthbar,
        ];
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
        this.velocity = {
            angle: 0,
            force: 0,
        };
        this.stats = {
            dead: false,
            level: 2,
            rankType: "common",
            combatType: "ranged",
            moveSpeed: 2.5,
            health: 100,
            maxHealth: 100,
        };
        this.data = {
            direction: 0,
            attackCooldown: this.getAttackCooldown(),
        };
        const [
            enemy,
            rotationLevel,
            scaleLevel,
            main,
            healthbarContainer,
            healthbar,
        ] = this.createDiv();
        this.elements = {
            enemy,
            rotationLevel,
            scaleLevel,
            main,
            healthbarContainer,
            healthbar,
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
            },
        });
    }

    die() {
        this.stats.dead = true;
        EnemyManager.deleteEnemy(this.id);
        this.elements.healthbarContainer.style.display = "none";
        anime({
            targets: this.elements.scaleLevel,
            scale: [1, 0],
            complete: () =>
                EnemyManager.enemyContainer!.removeChild(this.elements.enemy),
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
        this.data.direction =
            angleBetween(this.position, Player.position) + Math.PI / 2;
        this.elements.rotationLevel.style.transform = `rotate(${this.data.direction}rad)`;
    }

    update() {
        // If can attack, ATTACK!
        if (!this.data.attackCooldown) this.attack();
        else {
            // Wait until can attack again
            this.data.attackCooldown = Math.max(
                0,
                this.data.attackCooldown - 1
            );

            // Walk away from player if close
            // if(distanceBetween(this.position, Player.position) < 300) {
            //     PUSH(this, this.data.direction, 1)
            // }
        }

        UPDATE_HEALTHBAR(this);
        UPDATE_POSITION(this, this.elements.enemy);
        UPDATE_VELOCITY(this);

        this.lookToPlayer();
    }
}
