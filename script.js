// Import confetti for celebrations
import confetti from 'confetti-js';

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
    selectedKittenIndex: -1
};

// DOM Elements
const screens = {
    welcome: document.getElementById('welcome-screen'),
    adoption: document.getElementById('adoption-screen'),
    home: document.getElementById('home-screen'),
    school: document.getElementById('school-screen')
};

// Initialize the game
document.addEventListener('DOMContentLoaded', function() {
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
    try {
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: [[255, 107, 136], [107, 136, 255], [141, 202, 100]]
        });
    } catch (error) {
        console.error('Confetti error:', error);
    }
    
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
    
    // Display kitten image
    const kittenContainer = document.getElementById('home-kitten-container');
    kittenContainer.innerHTML = '';
    const img = document.createElement('img');
    img.src = gameState.kitten.image;
    img.alt = gameState.kitten.name;
    kittenContainer.appendChild(img);
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