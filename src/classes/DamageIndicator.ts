import { Point } from "../types";
import { isNil } from "lodash";
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

    createDiv() {
        const damageDiv = document.createElement("div");
        damageDiv.classList.add(".damage");
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
        this.position = { ...position };
        this.damage = damage;
        this.critical = critical;
        this.elements = {
            damage: this.createDiv(),
        };
    }

    update() {
        this.position.y -= 0.1;
        UPDATE_POSITION(this, this.elements.damage);
    }
}

export default DamageIndicator;
