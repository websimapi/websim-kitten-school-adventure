// Interactable handlers and related code
export function setupInteractables() {
    // Home scene interactables
    document.getElementById('food-bowl')?.addEventListener('click', () => handleInteraction('feed'));
    document.getElementById('toy-ball')?.addEventListener('click', () => handleInteraction('play'));
    document.getElementById('cat-bed')?.addEventListener('click', () => handleInteraction('rest'));
    
    // School scene interactables
    document.getElementById('desk')?.addEventListener('click', () => handleSchoolInteraction('math'));
    document.getElementById('blackboard')?.addEventListener('click', () => handleSchoolInteraction('reading'));
    document.getElementById('playground')?.addEventListener('click', () => handleSchoolInteraction('recess'));
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