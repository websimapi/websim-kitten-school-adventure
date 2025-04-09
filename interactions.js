// Interactable handlers and related code
export function setupInteractables() {
    const foodBowl = document.getElementById('food-bowl');
    const toyBall = document.getElementById('toy-ball');
    const catBed = document.getElementById('cat-bed');
    const desk = document.getElementById('desk');
    const blackboard = document.getElementById('blackboard');
    const playground = document.getElementById('playground');

    // Position interactables using percentages
    if (foodBowl) {
        foodBowl.style.left = '10%';
        foodBowl.style.bottom = '10%';
    }
    if (toyBall) {
        toyBall.style.left = '50%';
        toyBall.style.bottom = '20%';
        toyBall.style.transform = 'translateX(-50%)';
    }
    if (catBed) {
        catBed.style.right = '10%';
        catBed.style.bottom = '10%';
    }
    if (desk) {
        desk.style.left = '30%';
        desk.style.bottom = '15%';
    }
    if (blackboard) {
        blackboard.style.left = '50%';
        blackboard.style.top = '10%';
        blackboard.style.transform = 'translateX(-50%)';
    }
    if (playground) {
        playground.style.right = '30%';
        playground.style.bottom = '10%';
    }

    // Add click handlers
    foodBowl?.addEventListener('click', () => handleInteraction('feed'));
    toyBall?.addEventListener('click', () => handleInteraction('play'));
    catBed?.addEventListener('click', () => handleInteraction('rest'));
    desk?.addEventListener('click', () => handleSchoolInteraction('math'));
    blackboard?.addEventListener('click', () => handleSchoolInteraction('reading'));
    playground?.addEventListener('click', () => handleSchoolInteraction('recess'));
}

function handleInteraction(type) {
    // Get reference to the interactWithKitten function from the window object
    // This is set up in script.js
    if (typeof window.interactWithKitten === 'function') {
        window.interactWithKitten(type);
    }
}

function handleSchoolInteraction(type) {
    // Get reference to the doSchoolActivity function from the window object
    // This is set up in script.js
    if (typeof window.doSchoolActivity === 'function') {
        window.doSchoolActivity(type);
    }
}