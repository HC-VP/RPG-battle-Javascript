let playerHp = 100;
let monsterHp = 100;

let playerEndurance = 100;
let monsterEndurance = 100;

let playerSpeed = 100;
let monsterSpeed = 100;

let playerAttack = 15;
let monsterAttack = 15;

let playerDefense = 10;
let monsterDefense = 10;

let battleTurn = 1;

const actions = {
    Attack: { dmg: 15, endu: -10, speed: 10, crit: 0.1 },
    Power: { dmg: 25, endu: -20, speed: 5, crit: 0.05 },
    Speed: { dmg: 10, endu: -5, speed: 20, crit: 0.1 },
    Defense: { dmg: -5, endu: 20, speed: 100, crit: 0 }
};

function clamp(val, min = 0, max = 100) {
    return Math.max(min, Math.min(max, val));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function battle(playerChoice) {
    queueText(`Tour ${battleTurn} - Le joueur a choisi : ${playerChoice}`);

    let monsterChoices = ["Attack", "Power", "Speed"];
    if (battleTurn > 1 && (monsterHp < 50 || monsterEndurance < 60)) {
        monsterChoices.push("Defense");
    }

    const monsterChoice = monsterChoices[Math.floor(Math.random() * monsterChoices.length)];
    queueText("Le monstre a choisi : " + monsterChoice);

    const playerAction = actions[playerChoice];
    const monsterAction = actions[monsterChoice];

    const playerEffectiveSpeed = playerSpeed + playerAction.speed;
    const monsterEffectiveSpeed = monsterSpeed + monsterAction.speed;

    document.getElementById('attack-actions').classList.add('hidden');
    document.getElementById('btn-back').classList.add('hidden');

    if (playerEffectiveSpeed > monsterEffectiveSpeed ||
        (playerEffectiveSpeed === monsterEffectiveSpeed && playerEndurance >= monsterEndurance)) {
        queueText("Le joueur est plus rapide !");
        await resolveTurn("player", playerAction, "monster", monsterAction);
        await delay(800);
        if (monsterHp > 0) {
            await resolveTurn("monster", monsterAction, "player", playerAction);
        }
    } else {
        queueText("Le monstre est plus rapide !");
        await resolveTurn("monster", monsterAction, "player", playerAction);
        await delay(800);
        if (playerHp > 0) {
            await resolveTurn("player", playerAction, "monster", monsterAction);
        }
    }

    queueText(`PV joueur : ${playerHp}`);
    queueText(`Endurance joueur : ${playerEndurance}`);
    queueText(`PV monstre : ${monsterHp}`);
    queueText(`Endurance monstre : ${monsterEndurance}`);

    updateStatusBars();
    document.getElementById("Battle-turn").textContent = `Tour ${battleTurn}`;
    battleTurn++;

    if (playerHp > 0 && monsterHp > 0) {
        document.getElementById('main-actions').classList.remove('hidden');
    }
}

async function resolveTurn(attackerName, attackerAction, defenderName, defenderAction) {
    const defenderElement = document.getElementById(
        defenderName === "player" ? "player-frame" : "monster-frame"
    );

    let attackerDefense = attackerName === "player" ? playerDefense : monsterDefense;
    let defenderDefense = defenderName === "player" ? playerDefense : monsterDefense;

    if (defenderAction === actions.Defense) {
        defenderDefense *= 2;
        queueText(`${defenderName} utilise Défense et augmente sa défense !`);
    }

    let damage = attackerAction.dmg - defenderDefense;
    if (damage < 0) damage = 0;

    queueText(`${attackerName} inflige ${damage} points de dégâts à ${defenderName}.`);

    if (defenderName === "player") {
        playerHp = clamp(playerHp - damage, 0);
    } else {
        monsterHp = clamp(monsterHp - damage, 0);
    }

    if (attackerName === "player") {
        playerEndurance = clamp(playerEndurance + attackerAction.endu);
    } else {
        monsterEndurance = clamp(monsterEndurance + attackerAction.endu);
    }

    await delay(600);
    animateBar("playerHpBar", playerHp);
    animateBar("monsterHpBar", monsterHp);
    animateBar("playerEndBar", playerEndurance);
    animateBar("monsterEndBar", monsterEndurance);

    // Petit effet visuel
    defenderElement?.classList.add("hit");
    await delay(300);
    defenderElement?.classList.remove("hit");

    if (playerHp <= 0) {
        queueText("Le joueur est mort. Le monstre gagne !");
    } else if (monsterHp <= 0) {
        queueText("Le monstre est vaincu. Victoire du joueur !");
    }
}

function animateBar(barId, targetValue) {
    const bar = document.getElementById(barId);
    const currentWidth = parseFloat(bar.style.width) || 0;
    const targetWidth = Math.max(0, targetValue);
    const duration = 400;
    const frameRate = 30;
    const steps = duration / (1000 / frameRate);
    const stepSize = (targetWidth - currentWidth) / steps;
    let currentStep = 0;

    function animate() {
        currentStep++;
        const newWidth = currentWidth + stepSize * currentStep;
        bar.style.width = `${Math.max(0, Math.min(100, newWidth))}%`;
        if (currentStep < steps) {
            requestAnimationFrame(animate);
        }
    }

    animate();
}

function updateStatusBars() {
    animateBar("playerHpBar", playerHp);
    animateBar("monsterHpBar", monsterHp);
    animateBar("playerEndBar", playerEndurance);
    animateBar("monsterEndBar", monsterEndurance);
}

function showAttackMenu() {
    document.getElementById('main-actions').classList.add('hidden');
    document.getElementById('attack-actions').classList.remove('hidden');
    document.getElementById('btn-back').classList.remove('hidden');
}

function showMagicMenu() {
    document.getElementById('menu-text').textContent = "Pas encore implémenté : magie.";
}

function showObjectMenu() {
    document.getElementById('menu-text').textContent = "Pas encore implémenté : objets.";
}

function showMainMenu() {
    document.getElementById('attack-actions').classList.add('hidden');
    document.getElementById('main-actions').classList.remove('hidden');
    document.getElementById('btn-back').classList.add('hidden');
}

let messageQueue = [];
let isShowingMessage = false;

function queueText(message) {
    messageQueue.push(message);
    if (!isShowingMessage) {
        showNextMessage();
    }
}

function showNextMessage() {
    if (messageQueue.length === 0) {
        isShowingMessage = false;
        return;
    }

    isShowingMessage = true;
    const nextMessage = messageQueue.shift();

    const textBox = document.getElementById('menu-text');
    textBox.textContent = nextMessage;

    setTimeout(showNextMessage, 1000);
}
