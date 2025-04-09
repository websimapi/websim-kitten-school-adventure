// Game state
let gameState = {
    currentScreen: 'welcome',
    kitten: {
        image: null,
        name: '',
        personality: '',
        happiness: 50,
        energy: 50,
        knowledge: 20
    },
    generatedKittens: [],
    selectedKittenIndex: -1,
    kittenPosition: { x: 50, y: 50 },
    sceneAssets: {
        home: null,
        school: null,
        interactables: {}
    }
};

import { setupInteractables } from './interactions.js';

// Make interaction functions available globally for the interactions module
window.interactWithKitten = interactWithKitten;
window.doSchoolActivity = doSchoolActivity;

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    adoption: document.getElementById('adoption-screen'),
    home: document.getElementById('home-screen'),
    school: document.getElementById('school-screen')
};

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
    generateSceneAssets();
    
    // Button event listeners
    document.getElementById('start-button').addEventListener('click', startGame);
    document.getElementById('adopt-button').addEventListener('click', adoptKitten);
    document.getElementById('feed-button').addEventListener('click', () => interactWithKitten('feed'));
    document.getElementById('play-button').addEventListener('click', () => interactWithKitten('play'));
    document.getElementById('pet-button').addEventListener('click', () => interactWithKitten('pet'));
    document.getElementById('school-button').addEventListener('click', goToSchool);
    document.getElementById('go-home-button').addEventListener('click', goHome);
    document.getElementById('message-close').addEventListener('click', closeMessage);
    
    // School activity buttons
    document.getElementById('math-button').addEventListener('click', () => doSchoolActivity('math'));
    document.getElementById('reading-button').addEventListener('click', () => doSchoolActivity('reading'));
    document.getElementById('art-button').addEventListener('click', () => doSchoolActivity('art'));
    document.getElementById('recess-button').addEventListener('click', () => doSchoolActivity('recess'));
    
    // Kitten name input
    document.getElementById('kitten-name').addEventListener('input', validateAdoptButton);
    document.getElementById('kitten-personality').addEventListener('change', validateAdoptButton);
});

// Start the game and go to adoption screen
function startGame() {
    changeScreen('adoption');
    generateKittens();
}

// Generate kitten images using AI
async function generateKittens() {
    const numKittens = 4;
    const kittenPrompts = [
        "A cute cartoon tabby kitten with white background, simple style",
        "A fluffy white kitten with blue eyes on white background, cartoon style",
        "A small black kitten with green eyes on white background, cartoon style",
        "A ginger kitten with white paws on white background, cartoon style"
    ];
    
    document.getElementById('loading-kittens').style.display = 'block';
    document.getElementById('kittens-container').innerHTML = '';
    gameState.generatedKittens = [];
    
    try {
        for (let i = 0; i < numKittens; i++) {
            const result = await websim.imageGen({
                prompt: kittenPrompts[i],
                aspect_ratio: "1:1",
            });
            
            // Add to our kittens array
            gameState.generatedKittens.push({
                url: result.url,
                processedUrl: null // Will store the transparent version
            });
            
            // Process the image to remove background
            const transparentUrl = await removeBackground(result.url);
            gameState.generatedKittens[i].processedUrl = transparentUrl;
            
            // Add to the UI
            addKittenOption(transparentUrl, i);
        }
        
        document.getElementById('loading-kittens').style.display = 'none';
    } catch (error) {
        console.error('Error generating kittens:', error);
        showMessage('Sorry, had trouble creating kittens. Please try again!');
        document.getElementById('loading-kittens').style.display = 'none';
    }
}

// Add a kitten option to the adoption screen
function addKittenOption(imageUrl, index) {
    const kittensContainer = document.getElementById('kittens-container');
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Adoptable Kitten';
    img.className = 'kitten-option';
    img.dataset.index = index;
    
    img.addEventListener('click', () => selectKitten(index));
    kittensContainer.appendChild(img);
}

// Select a kitten from the options
function selectKitten(index) {
    // Clear previous selection
    document.querySelectorAll('.kitten-option').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Mark new selection
    document.querySelector(`.kitten-option[data-index="${index}"]`).classList.add('selected');
    gameState.selectedKittenIndex = index;
    
    // Show selected kitten in the details area
    const selectedKittenDiv = document.getElementById('selected-kitten');
    selectedKittenDiv.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = gameState.generatedKittens[index].processedUrl;
    img.alt = 'Selected Kitten';
    selectedKittenDiv.appendChild(img);
    
    validateAdoptButton();
}

// Validate if the adopt button should be enabled
function validateAdoptButton() {
    const nameInput = document.getElementById('kitten-name');
    const adoptButton = document.getElementById('adopt-button');
    
    if (nameInput.value.trim() !== '' && gameState.selectedKittenIndex !== -1) {
        adoptButton.disabled = false;
    } else {
        adoptButton.disabled = true;
    }
}

// Adopt the selected kitten
function adoptKitten() {
    if (gameState.selectedKittenIndex === -1) return;
    
    const name = document.getElementById('kitten-name').value.trim();
    const personality = document.getElementById('kitten-personality').value;
    
    gameState.kitten = {
        image: gameState.generatedKittens[gameState.selectedKittenIndex].processedUrl,
        name: name,
        personality: personality,
        happiness: 50,
        energy: 50,
        knowledge: 20
    };
    
    // Run confetti to celebrate the adoption!
    confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
        colors: [[255, 107, 136], [107, 136, 255], [141, 202, 100]]
    });
    
    // Show celebration message
    showMessage(`Congratulations! You've adopted ${name}! Take good care of your new friend.`);
    
    // Clean up confetti after message is closed
    document.getElementById('message-close').addEventListener('click', () => {
        goHome();
    }, { once: true });
}

// Go to home screen
function goHome() {
    changeScreen('home');
    updateHomeScreen();
}

// Go to school screen
function goToSchool() {
    if (gameState.kitten.energy < 20) {
        showMessage(`${gameState.kitten.name} is too tired for school! Try feeding them or letting them rest.`);
        return;
    }
    
    changeScreen('school');
    updateSchoolScreen();
}

// Update the home screen with current kitten state
function updateHomeScreen() {
    // Set kitten name
    document.getElementById('kitten-name-display').textContent = gameState.kitten.name;
    
    // Update status bars
    document.getElementById('happiness-bar').style.width = `${gameState.kitten.happiness}%`;
    document.getElementById('energy-bar').style.width = `${gameState.kitten.energy}%`;
    document.getElementById('knowledge-bar').style.width = `${gameState.kitten.knowledge}%`;
    
    if (!gameState.sceneAssets.home) {
        generateSceneAssets();
    }
    
    const kittenContainer = document.getElementById('home-kitten-container');
    kittenContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = gameState.kitten.image;
    img.alt = gameState.kitten.name;
    kittenContainer.appendChild(img);
    kittenContainer.style.left = `${gameState.kittenPosition.x}%`;
    kittenContainer.style.top = `${gameState.kittenPosition.y}%`;
}

// Update the school screen
function updateSchoolScreen() {
    const kittenContainer = document.getElementById('school-kitten-container');
    kittenContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = gameState.kitten.image;
    img.alt = gameState.kitten.name;
    kittenContainer.appendChild(img);
    
    document.getElementById('teacher-message').textContent = `What would ${gameState.kitten.name} like to learn today?`;
}

// Handle interactions with the kitten
async function interactWithKitten(action) {
    let message = '';
    let personalityResponse = '';
    
    // Get personalized response based on personality
    try {
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a ${gameState.kitten.personality} kitten named ${gameState.kitten.name}. Respond with a short, cute reaction to the action in a single sentence. Be very cat-like.`
                },
                {
                    role: "user",
                    content: `How do you react when your owner ${action}s you?`
                }
            ]
        });
        personalityResponse = completion.content;
    } catch (error) {
        console.error('Error getting personality response:', error);
        personalityResponse = `*${gameState.kitten.name} seems to enjoy that!*`;
    }
    
    switch (action) {
        case 'feed':
            gameState.kitten.energy = Math.min(100, gameState.kitten.energy + 20);
            gameState.kitten.happiness = Math.min(100, gameState.kitten.happiness + 10);
            message = `You fed ${gameState.kitten.name}. Energy increased!`;
            break;
        case 'play':
            if (gameState.kitten.energy < 20) {
                message = `${gameState.kitten.name} is too tired to play right now.`;
            } else {
                gameState.kitten.happiness = Math.min(100, gameState.kitten.happiness + 20);
                gameState.kitten.energy = Math.max(0, gameState.kitten.energy - 15);
                message = `You played with ${gameState.kitten.name}. Happiness increased!`;
            }
            break;
        case 'pet':
            gameState.kitten.happiness = Math.min(100, gameState.kitten.happiness + 15);
            message = `You petted ${gameState.kitten.name}. They're purring!`;
            break;
        case 'rest':
            gameState.kitten.energy = Math.min(100, gameState.kitten.energy + 10);
            gameState.kitten.happiness = Math.min(100, gameState.kitten.happiness + 5);
            message = `You gave ${gameState.kitten.name} a rest. Energy increased!`;
            break;
    }
    
    showMessage(`${message}\n\n"${personalityResponse}"`);
    updateHomeScreen();
}

// Handle school activities
async function doSchoolActivity(activity) {
    let message = '';
    let knowledgeGain = 0;
    let energyLoss = 0;
    let happinessChange = 0;
    
    // Get learning outcome from LLM
    try {
        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a teacher at kitten school. Create a short, cute description of what a ${gameState.kitten.personality} kitten named ${gameState.kitten.name} learned during ${activity} class. Keep it to 2 sentences maximum.`
                },
                {
                    role: "user",
                    content: `What did ${gameState.kitten.name} learn in ${activity} class today?`
                }
            ]
        });
        message = completion.content;
    } catch (error) {
        console.error('Error getting learning outcome:', error);
        message = `${gameState.kitten.name} attended ${activity} class and learned something new!`;
    }
    
    switch (activity) {
        case 'math':
            knowledgeGain = 15;
            energyLoss = 15;
            happinessChange = gameState.kitten.personality === 'curious' ? 5 : -5;
            break;
        case 'reading':
            knowledgeGain = 12;
            energyLoss = 10;
            happinessChange = gameState.kitten.personality === 'shy' ? 5 : 0;
            break;
        case 'art':
            knowledgeGain = 8;
            energyLoss = 5;
            happinessChange = 10;
            break;
        case 'recess':
            knowledgeGain = 3;
            energyLoss = 10;
            happinessChange = 15;
            break;
    }
    
    // Update kitten stats
    gameState.kitten.knowledge = Math.min(100, gameState.kitten.knowledge + knowledgeGain);
    gameState.kitten.energy = Math.max(0, gameState.kitten.energy - energyLoss);
    gameState.kitten.happiness = Math.max(0, Math.min(100, gameState.kitten.happiness + happinessChange));
    
    showMessage(message);
    
    // If energy is too low, suggest going home
    if (gameState.kitten.energy < 20) {
        setTimeout(() => {
            showMessage(`${gameState.kitten.name} is getting tired. Maybe it's time to go home?`);
        }, 3000);
    }
    
    updateSchoolScreen();
}

// Show message in the message box
function showMessage(text) {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    
    messageText.textContent = text;
    messageBox.classList.remove('hidden');
}

// Close the message box
function closeMessage() {
    document.getElementById('message-box').classList.add('hidden');
}

// Change the current screen
function changeScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show the requested screen
    screens[screenName].classList.add('active');
    gameState.currentScreen = screenName;
}

// Remove background from image to make it transparent
async function removeBackground(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = function() {
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            
            // Draw the image
            ctx.drawImage(img, 0, 0);
            
            // Get the image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Algorithm to detect white/light background and make it transparent
            // Iterate through pixels
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Check if the pixel is white or very light (background)
                if (r > 230 && g > 230 && b > 230) {
                    // Make it transparent
                    data[i + 3] = 0;
                }
            }
            
            // Put the modified pixels back
            ctx.putImageData(imageData, 0, 0);
            
            // Return the transparent image
            resolve(canvas.toDataURL());
        };
        
        img.onerror = function() {
            console.error('Error loading image for background removal');
            reject(new Error('Failed to load image'));
        };
        
        img.src = imageUrl;
    });
}

// Generate scene assets
async function generateSceneAssets() {
    try {
        // Generate home background
        const homeResult = await websim.imageGen({
            prompt: "A cozy cartoon living room with pastel colors, cat furniture, and large windows, simple style, white walls",
            aspect_ratio: "16:9"
        });
        gameState.sceneAssets.home = homeResult.url;

        // Generate school background
        const schoolResult = await websim.imageGen({
            prompt: "A cute cartoon classroom with colorful decorations, chalkboard, and small desks, simple style",
            aspect_ratio: "16:9"
        });
        gameState.sceneAssets.school = schoolResult.url;

        // Generate interactable items
        const interactables = {
            'food-bowl': "A colorful cat food bowl with cute paw prints, simple cartoon style, white background",
            'toy-ball': "A bright yarn ball toy for cats, simple cartoon style, white background",
            'cat-bed': "A cozy round cat bed with soft cushion, simple cartoon style, white background",
            'desk': "A small student desk with books, simple cartoon style, white background",
            'blackboard': "A green chalkboard with cute doodles, simple cartoon style, white background",
            'playground': "A small cat playground with scratching post, simple cartoon style, white background"
        };

        for (const [key, prompt] of Object.entries(interactables)) {
            const result = await websim.imageGen({
                prompt: prompt,
                aspect_ratio: "1:1"
            });
            const transparentUrl = await removeBackground(result.url);
            gameState.sceneAssets.interactables[key] = transparentUrl;
        }

        initializeScenes();
    } catch (error) {
        console.error('Error generating scene assets:', error);
        showMessage('Had trouble creating the environment. Please refresh the page.');
    }
}

// Initialize scenes
function initializeScenes() {
    // Set backgrounds
    document.getElementById('home-scene').style.backgroundImage = `url(${gameState.sceneAssets.home})`;
    document.getElementById('school-scene').style.backgroundImage = `url(${gameState.sceneAssets.school})`;

    // Set interactable images
    for (const [key, url] of Object.entries(gameState.sceneAssets.interactables)) {
        const element = document.getElementById(key);
        if (element) {
            element.style.backgroundImage = `url(${url})`;
        }
    }

    // Add click handlers for interactables
    setupInteractables();
}

// Start dragging
function startDragging(e) {
    e.preventDefault();
    const container = e.currentTarget;
    const scene = container.parentElement;
    
    const moveKitten = (moveEvent) => {
        const bounds = scene.getBoundingClientRect();
        const x = (moveEvent.clientX || moveEvent.touches[0].clientX) - bounds.left;
        const y = (moveEvent.clientY || moveEvent.touches[0].clientY) - bounds.top;
        
        // Keep kitten within bounds
        const kittenWidth = container.offsetWidth;
        const kittenHeight = container.offsetHeight;
        
        container.style.left = `${Math.max(0, Math.min(x - kittenWidth/2, bounds.width - kittenWidth))}px`;
        container.style.top = `${Math.max(0, Math.min(y - kittenHeight/2, bounds.height - kittenHeight))}px`;
    };
    
    const stopDragging = () => {
        document.removeEventListener('mousemove', moveKitten);
        document.removeEventListener('mouseup', stopDragging);
        document.removeEventListener('touchmove', moveKitten);
        document.removeEventListener('touchend', stopDragging);
    };
    
    document.addEventListener('mousemove', moveKitten);
    document.addEventListener('mouseup', stopDragging);
    document.addEventListener('touchmove', moveKitten);
    document.addEventListener('touchend', stopDragging);
}