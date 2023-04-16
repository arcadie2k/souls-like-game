import ProjectileManager from "./projectile";
import EnemyManager from "./enemy";
import Player from "./player";

const anim = () => {
    Player.anim();
    EnemyManager.anim();
    ProjectileManager.anim();
    requestAnimationFrame(anim);
};

EnemyManager.createEnemy({ x: 500, y: 500 });
EnemyManager.createEnemy({ x: 500, y: 500 });
EnemyManager.createEnemy({ x: 500, y: 500 });

anim();
