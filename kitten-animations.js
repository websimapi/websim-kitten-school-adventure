// Kitten movement and animation controls
export function setupKittenMovement(container) {
    const scene = container.parentElement;
    
    // Add click listener to scene for kitten movement
    scene.addEventListener('click', (e) => {
        // Don't trigger movement if clicking an interactable
        if (e.target.classList.contains('interactable')) return;
        
        const bounds = scene.getBoundingClientRect();
        const x = e.clientX - bounds.left;
        const y = e.clientY - bounds.top;
        
        moveKittenTo(container, x, y);
    });
}

function moveKittenTo(kittenContainer, targetX, targetY) {
    // Get current position
    const currentX = parseFloat(kittenContainer.style.left) || 0;
    const currentY = parseFloat(kittenContainer.style.top) || 0;
    
    // Calculate distance and direction
    const dx = targetX - currentX;
    const dy = targetY - currentY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Flip kitten image based on movement direction
    const kittenImg = kittenContainer.querySelector('img');
    if (dx < 0) {
        kittenImg.style.transform = 'scaleX(-1)';
    } else {
        kittenImg.style.transform = 'scaleX(1)';
    }
    
    // Add walking animation class
    kittenImg.classList.add('walking');
    
    // Animate movement
    const duration = distance * 5; // 5ms per pixel
    kittenContainer.style.transition = `left ${duration}ms linear, top ${duration}ms linear`;
    kittenContainer.style.left = `${targetX}px`;
    kittenContainer.style.top = `${targetY}px`;
    
    // Remove walking animation after movement completes
    setTimeout(() => {
        kittenImg.classList.remove('walking');
        kittenContainer.style.transition = '';
    }, duration);
}