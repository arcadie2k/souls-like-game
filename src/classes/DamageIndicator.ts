import { Point } from "../types";
import { isNil } from "lodash";
import anime from "animejs/lib/anime.es.js";
import { UPDATE_POSITION } from "./functions";

type DamageIndicatorType = {
    nextId: number;
    damages: Damage[];
    damageContainer: HTMLElement | null;
    createDamage: (position: Point, damage: number) => void;
    deleteDamage: (damageId: number) => void;
    anim: () => void;
};

const DamageIndicator: DamageIndicatorType = {
    nextId: 1,
    damages: [],
    damageContainer: document.getElementById("damage-container"),

    createDamage(position, damage) {
        if (isNil(this.damageContainer)) return;
        const newDamage = new Damage(position, damage);
        this.damageContainer!.appendChild(newDamage.elements.damage);
        this.damages.push(newDamage);
    },

    deleteDamage(damageId) {
        this.damages = this.damages.filter((damage) => damage.id !== damageId);
    },

    anim() {
        this.damages.forEach((damage) => {
            damage.update();
        });
    },
};

class Damage {
    id: number;
    position: Point;
    damage: number;
    critical: boolean;
    elements: {
        damage: HTMLElement;
    };
    framesLeft: number;

    createDiv() {
        const damageDiv = document.createElement("div");
        damageDiv.classList.add("damage");
        damageDiv.setAttribute("data-damage", String(this.damage));
        damageDiv.setAttribute("data-is-critical", String(this.critical));
        return damageDiv;
    }

    constructor(
        position: Point,
        damage: number = 0,
        critical: boolean = false
    ) {
        this.id = DamageIndicator.nextId++;
        this.position = { x: position.x, y: position.y - 20 };
        this.damage = damage;
        this.critical = critical;
        this.elements = {
            damage: this.createDiv(),
        };
        this.framesLeft = 60;
    }

    update() {
        this.position.y -= 1;
        UPDATE_POSITION(this, this.elements.damage);

        if (this.framesLeft > 0) this.framesLeft -= 1;
        else {
            DamageIndicator.deleteDamage(this.id);
            anime({
                targets: this.elements.damage,
                opacity: [1, 0],
                complete: () =>
                    DamageIndicator.damageContainer!.removeChild(
                        this.elements.damage
                    ),
            });
        }
    }
}

export default DamageIndicator;
