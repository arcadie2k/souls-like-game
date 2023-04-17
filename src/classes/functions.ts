import { isNil } from "lodash";
import { Point, Velocity } from "../types";

function PUSH(obj: { velocity: Velocity}, angle: number = 0, force: number = 1) {
    const vx1 = obj.velocity.force * Math.sin(obj.velocity.angle);
    const vy1 = - obj.velocity.force * Math.cos(obj.velocity.angle);
    const vx2 = force * Math.sin(angle);
    const vy2 = - force * Math.cos(angle);

    const vxSum = vx1 + vx2;
    const vySum = vy1 + vy2;

    const forceSum = Math.sqrt(vxSum**2 + vySum**2);
    const angleSum = Math.atan2(vxSum, - vySum);

    obj.velocity = { angle: angleSum, force: forceSum };
}

function UPDATE_HEALTHBAR(obj: { elements: { healthbar: HTMLElement | null }, stats: { health: number, maxHealth: number } }) {
    if(isNil(obj.elements.healthbar)) return;
    obj.elements.healthbar.style.width = `${(obj.stats.health / obj.stats.maxHealth) * 100}%`;
}

function UPDATE_STAMINABAR(obj: { elements: { staminabar: HTMLElement | null }, stats: { stamina: number, maxStamina: number } }) {
    if(isNil(obj.elements.staminabar)) return;
    obj.elements.staminabar.style.width = `${(obj.stats.stamina / obj.stats.maxStamina) * 100}%`;
}

function UPDATE_POSITION(obj: { position: Point }, element: HTMLElement | null) {
    if(isNil(element)) return;
    element.style.top = `${obj.position.y}px`;
    element.style.left = `${obj.position.x}px`;
}

function UPDATE_VELOCITY(obj: {position: Point, velocity: Velocity}) {
        const vx = obj.velocity.force * Math.sin(obj.velocity.angle);
        const vy = - obj.velocity.force * Math.cos(obj.velocity.angle);
        
        const acc= .2
        
        obj.position.x += vx
        obj.position.y += vy


        if(Math.abs(obj.velocity.force) < acc) obj.velocity.force = 0;
        if(obj.velocity.force > 0) obj.velocity.force -= acc
        if(obj.velocity.force < 0) obj.velocity.force += acc

        if(!obj.velocity.force) obj.velocity.angle = 0
}

export { PUSH, UPDATE_HEALTHBAR, UPDATE_STAMINABAR, UPDATE_POSITION, UPDATE_VELOCITY }     