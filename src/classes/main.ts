import ProjectileManager from "./projectile";
import EnemyManager from "./enemy";
import Player from "./player";
import DamageIndicator from "./DamageIndicator";

const anim = () => {
    Player.anim();
    EnemyManager.anim();
    ProjectileManager.anim();
    DamageIndicator.anim();
    requestAnimationFrame(anim);
};

anim();
