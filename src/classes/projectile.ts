import { isNil } from "lodash";
import anime from "animejs/lib/anime.es.js";
import { Point } from "../types";
import { distanceBetween, angleBetween } from "./utils";
import Player from "./player";

export default class ProjectileManager {
    static nextId = 1;
    static entityName = "Projectile Manager";
    static projectiles: Projectile[] = [];
    static projectileContainer = document.getElementById("projectile-container");

    static createProjectile(position: Point) {
        if (isNil(this.projectileContainer)) return;
        const newProjectile = new Projectile(position);
        this.projectileContainer!.appendChild(newProjectile.elements.projectile);
        this.projectiles.push(newProjectile);
    }

    static deleteProjectile(projectileId: number) {
        this.projectiles = this.projectiles.filter((projectile) => projectile.id !== projectileId);
    }

    static anim() {
        this.projectiles.forEach((projectile) => {
            projectile.update();
        });
    }
}

export class Projectile {
    id: number;
    entityName: string;
    position: Point;
    size: number;
    direction: number;
    elements: {
        projectile: HTMLDivElement;
    };
    stats: {
        moveSpeed: number;
        life: number;
    };

    createDiv() {
        const projectileDiv = document.createElement("div");
        projectileDiv.classList.add("projectile");
        projectileDiv.style.width = this.size + "px";
        projectileDiv.style.height = this.size + "px";
        return projectileDiv;
    }

    constructor(position: Point) {
        this.id = ProjectileManager.nextId++;
        this.entityName = `Projectile ${this.id}`;
        this.position = position;
        this.size = 10;
        this.direction = angleBetween(this.position, Player.position);
        this.elements = {
            projectile: this.createDiv(),
        };
        this.stats = {
            moveSpeed: 5,
            life: 512,
        };
    }

    die(reason: "life" | "hit_player") {
        ProjectileManager.deleteProjectile(this.id);
        switch (reason) {
            case "hit_player":
                anime({
                    targets: this.elements.projectile,
                    scale: [1, 2],
                    opacity: [1, 0],
                    easing: "spring(1, 80, 10, 0)",
                    duration: 500,
                    complete: () => ProjectileManager.projectileContainer!.removeChild(this.elements.projectile),
                });
                break;
            default:
                anime({
                    targets: this.elements.projectile,
                    scale: [1, 0],
                    ease: "easeOutExpo",
                    duration: 1000,
                    complete: () => ProjectileManager.projectileContainer!.removeChild(this.elements.projectile),
                });
                break;
        }
    }

    updatePosition() {
        this.elements.projectile.style.top = `${this.position.y}px`;
        this.elements.projectile.style.left = `${this.position.x}px`;
    }

    update() {
        this.stats.life -= 1;

        if (!this.stats.life) {
            this.die("life");
            return;
        }

        if (distanceBetween(this.position, Player.position) <= 35) {
            this.die("hit_player");
            Player.takeDamage(this.size);
            return;
        }

        const H = this.stats.moveSpeed * Math.cos(this.direction);
        const V = this.stats.moveSpeed * Math.sin(this.direction);

        this.position.x -= H;
        this.position.y -= V;

        this.updatePosition();
    }
}
