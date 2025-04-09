// Kitten movement and animation controls
export function setupKittenMovement(container) {
    const scene = container.parentElement;
    
    scene.addEventListener('click', (e) => {
        if (e.target.classList.contains('interactable')) return;
        
        const bounds = scene.getBoundingClientRect();
        const xPercent = ((e.clientX - bounds.left) / bounds.width) * 100;
        const yPercent = ((e.clientY - bounds.top) / bounds.height) * 100;
        
        // Constrain movement within scene bounds
        const constrainedX = Math.min(Math.max(xPercent, 5), 95);
        const constrainedY = Math.min(Math.max(yPercent, 5), 95);
        
        moveKittenTo(container, constrainedX, constrainedY);
    });
}

function moveKittenTo(kittenContainer, targetXPercent, targetYPercent) {
    const currentXPercent = parseFloat(kittenContainer.style.left) || 50;
    const currentYPercent = parseFloat(kittenContainer.style.top) || 50;
    
    const dx = targetXPercent - currentXPercent;
    const dy = targetYPercent - currentYPercent;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    const kittenImg = kittenContainer.querySelector('img');
    if (dx < 0) {
        kittenImg.style.transform = 'scaleX(-1)';
    } else {
        kittenImg.style.transform = 'scaleX(1)';
    }
    
    kittenImg.classList.add('walking');
    
    // Adjust speed based on percentage distance
    const duration = distance * 50; // Adjust timing for percentage-based movement
    kittenContainer.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
    kittenContainer.style.left = `${targetXPercent}%`;
    kittenContainer.style.top = `${targetYPercent}%`;
    
    setTimeout(() => {
        kittenImg.classList.remove('walking');
        kittenContainer.style.transition = '';
    }, duration);
}