// Game state
let gameState = {
    currentNodeId: 'start',
    visitedNodes: new Set(['start']),
    playerPosition: { x: 50, y: 50 },
    choiceHistory: []
};

// DOM Elements
const narrativeElement = document.getElementById('narrative');
const choicesElement = document.getElementById('choices');
const navigationElement = document.getElementById('navigation');
const startButton = document.getElementById('start-button');
const playerElement = document.getElementById('player');
const labyrinthDisplay = document.getElementById('labyrinth-display');

// Direction buttons
const navUp = document.getElementById('nav-up');
const navLeft = document.getElementById('nav-left');
const navRight = document.getElementById('nav-right');
const navDown = document.getElementById('nav-down');

// Initialize the game
function initGame() {
    startButton.addEventListener('click', startGame);
    updatePlayerPosition();
}

// Start the game
function startGame() {
    choicesElement.innerHTML = '';
    navigationElement.classList.remove('hidden');
    
    // Set up navigation controls
    navUp.addEventListener('click', () => move('up'));
    navLeft.addEventListener('click', () => move('left'));
    navRight.addEventListener('click', () => move('right'));
    navDown.addEventListener('click', () => move('down'));
    
    // Navigate to the first story node
    navigateToNode('intro');
}

// Navigate to a specific story node
function navigateToNode(nodeId) {
    // Get the story node
    const node = storyNodes[nodeId];
    
    if (!node) {
        console.error(`Story node ${nodeId} not found!`);
        return;
    }

    // update progression bar
    if (progressionSystem) {
        progressionSystem.updateProgress(nodeId);
    }
    
    // Update game state
    gameState.currentNodeId = nodeId;
    gameState.visitedNodes.add(nodeId);
    
    // Update the narrative text with fade effect
    narrativeElement.classList.remove('fade-in');
    setTimeout(() => {
        // Display the node's content
        narrativeElement.innerHTML = `<h2>${node.title}</h2>${node.content}`;
        narrativeElement.classList.add('fade-in');
        
        // IMPROVED: Clear any existing interactions first
        clearAllInteractions();
        
        // Update player position on the labyrinth
        updateLabyrinthVisual(nodeId);
        
        // IMPROVED: Determine interaction type and show only one
        if (node.choices && node.choices.length > 0) {
            // This is a choice node - show choices, hide navigation
            showChoices(node.choices);
            hideNavigation();
            console.log(`Node ${nodeId}: Showing choices, hiding navigation`);
        } else if (node.exits && Object.keys(node.exits).length > 0) {
            // This is a navigation node - show navigation, hide choices  
            showNavigation(node.exits);
            hideChoices();
            console.log(`Node ${nodeId}: Showing navigation, hiding choices`);
        } else {
            // Dead end - hide both (shouldn't happen in a well-designed game)
            hideNavigation();
            hideChoices();
            console.log(`Node ${nodeId}: No interactions available (dead end)`);
        }
    }, 300);
}

// IMPROVED: Helper functions for managing UI interactions

// Clear all interactions
function clearAllInteractions() {
    hideChoices();
    hideNavigation();
}

// Show navigation controls
function showNavigation(exits = {}) {
    navigationElement.classList.remove('hidden');
    updateAvailableDirections(exits);
}

// Hide navigation controls  
function hideNavigation() {
    navigationElement.classList.add('hidden');
}

// Show choices (existing function, but now also hides navigation)
function showChoices(choices) {
    choicesElement.innerHTML = '';
    
    choices.forEach(choice => {
        const button = document.createElement('button');
        button.textContent = choice.text;
        button.addEventListener('click', () => {
            // Record the choice
            gameState.choiceHistory.push({
                fromNode: gameState.currentNodeId,
                choiceText: choice.text,
                toNode: choice.nextNode
            });
            
            // Navigate to the next node
            navigateToNode(choice.nextNode);
        });
        
        choicesElement.appendChild(button);
    });
}

// Hide choices
function hideChoices() {
    choicesElement.innerHTML = '';
}

// Move in a direction
function move(direction) {
    const currentNode = storyNodes[gameState.currentNodeId];
    const exits = currentNode.exits || {};
    
    if (exits[direction]) {
        // Update player visual position before navigating
        animatePlayerMovement(direction, () => {
            navigateToNode(exits[direction]);
        });
    }
}

// Update which direction buttons are enabled based on available exits
function updateAvailableDirections(exits = {}) {
    navUp.disabled = !exits.up;
    navLeft.disabled = !exits.left;
    navRight.disabled = !exits.right;
    navDown.disabled = !exits.down;
}

// Update the visual representation of the labyrinth
function updateLabyrinthVisual(nodeId) {
    // This is a simplified visualization
    // You could enhance this with a more detailed representation
    
    // For now, just set a different background color based on the node type
    const node = storyNodes[nodeId];
    
    // Use different colors for different types of locations
    let bgColor = '#f9f9f9';
    
    if (node.type === 'library') {
        bgColor = '#f0e6d2'; // Parchment color for library
    } else if (node.type === 'garden') {
        bgColor = '#e0f2e0'; // Light green for garden
    } else if (node.type === 'tower') {
        bgColor = '#e0e0e0'; // Stone gray for tower
    } else if (node.type === 'mirror') {
        bgColor = '#e0f0ff'; // Light blue for mirror rooms
    }
    
    labyrinthDisplay.style.backgroundColor = bgColor;
    
    // Additional visual effects based on the node properties
    if (node.timeDistortion) {
        labyrinthDisplay.style.boxShadow = 'inset 0 0 20px rgba(255, 0, 0, 0.2)';
    } else {
        labyrinthDisplay.style.boxShadow = 'none';
    }

    const colors = getColorsFromCSS(node.type);
    playerElement.style.backgroundColor = colors.player;
    playerElement.style.borderColor = colors.player;
}

// Set initial player position
function updatePlayerPosition() {
    playerElement.style.left = `${gameState.playerPosition.x}%`;
    playerElement.style.top = `${gameState.playerPosition.y}%`;
}

// Animate player movement
function animatePlayerMovement(direction, callback) {
    // Define movement amount
    const moveAmount = 10;

    const fromX = gameState.playerPosition.x;
    const fromY = gameState.playerPosition.y;
    
    // Calculate new position based on direction
    switch (direction) {
        case 'up':
            gameState.playerPosition.y = Math.max(0, gameState.playerPosition.y - moveAmount);
            break;
        case 'down':
            gameState.playerPosition.y = Math.min(80, gameState.playerPosition.y + moveAmount);
            break;
        case 'left':
            gameState.playerPosition.x = Math.max(0, gameState.playerPosition.x - moveAmount);
            break;
        case 'right':
            gameState.playerPosition.x = Math.min(80, gameState.playerPosition.x + moveAmount);
            break;
    }

    // drawPathLine(fromX, fromY, gameState.playerPosition.x, gameState.playerPosition.y);

    // Leave a breadcrumb at the OLD position before moving
    // leaveBreadcrumb(fromX, fromY);
    
    // Update player position
    playerElement.style.left = `${gameState.playerPosition.x}%`;
    playerElement.style.top = `${gameState.playerPosition.y}%`;
    
    // Wait for animation to complete before executing callback
    setTimeout(callback, 350);
}



// Function to leave a breadcrumb dot at the current position
// function leaveBreadcrumb(x, y) {
//     const container = document.getElementById('path-container'); // Same container as the path lines
//     const currentNode = storyNodes[gameState.currentNodeId];
    
//     // Create a new dot element
//     const breadcrumb = document.createElement('div');
//     breadcrumb.classList.add('breadcrumb-dot');

//     const colors = getColorsFromCSS(currentNode.type);
//     breadcrumb.style.backgroundColor = colors.breadcrumb;
//     breadcrumb.style.borderColor = colors.breadcrumb;
    
//     // Position the breadcrumb at the specified coordinates
//     breadcrumb.style.left = `${x}%`;
//     breadcrumb.style.top = `${y}%`;
    
//     // Add it to the container
//     container.appendChild(breadcrumb);
// }


function getColorsFromCSS(nodeType) {
    console.log('Getting colors for node type:', nodeType);
    
    const root = document.documentElement;
    // const computedStyle = getComputedStyle(root);
    
    // Get the base color for this node type
    let baseColor;
    let cssVarName;
    
    // switch(nodeType) {
    //     case 'intro':
    //         cssVarName = '--intro-color';
    //         baseColor = computedStyle.getPropertyValue('--intro-color').trim();
    //         break;
    //     case 'library':
    //         cssVarName = '--library-color';
    //         baseColor = computedStyle.getPropertyValue('--library-color').trim();
    //         break;
    //     case 'garden':
    //         cssVarName = '--garden-color';
    //         baseColor = computedStyle.getPropertyValue('--garden-color').trim();
    //         break;
    //     case 'forest':
    //         cssVarName = '--forest-color';
    //         baseColor = computedStyle.getPropertyValue('--forest-color').trim();
    //         break;
    //     case 'village':
    //         cssVarName = '--village-color';
    //         baseColor = computedStyle.getPropertyValue('--village-color').trim();
    //         break;
    //     case 'tower':
    //         cssVarName = '--tower-color';
    //         baseColor = computedStyle.getPropertyValue('--tower-color').trim();
    //         break;
    //     case 'mirror':
    //         cssVarName = '--mirror-color';
    //         baseColor = computedStyle.getPropertyValue('--mirror-color').trim();
    //         break;
    //     case 'station':
    //         cssVarName = '--station-color';
    //         baseColor = computedStyle.getPropertyValue('--station-color').trim();
    //         break;
    //     default:
    //         cssVarName = '--default-color';
    //         baseColor = computedStyle.getPropertyValue('--default-color').trim();
    //         break;
    // }
    
    console.log(`CSS variable ${cssVarName} = "${baseColor}"`);
    
    // If no color found or empty, use fallback
    if (!baseColor) {
        baseColor = '#FF6B6B'; // fallback red
        console.log('No color found, using fallback:', baseColor);
    }
    
    const result = {
        player: baseColor,
        breadcrumb: baseColor
    };
    
    console.log('Returning colors:', result);
    return result;
}


class ProgressionSystem {
    constructor() {
        this.targetNode = 'the_point';
        
        // ADD: Define nodes where percentage text should be hidden
        this.hidePercentageNodes = [
            'alternate_ending', 'refuse_ending', 'original_ending',
            'epilogue_original', 'epilogue_refuse', 'epilogue_alternate'
        ];
        
        console.log('Initializing ProgressionSystem, target:', this.targetNode);
        
        this.distances = this.calculateDistances();
        const validDistances = Object.entries(this.distances)
            .filter(([nodeId, distance]) => nodeId !== 'start' && distance !== 999)
            .map(([_, distance]) => distance);

        this.maxDistance = validDistances.length > 0 ? Math.max(...validDistances) : 1;
        
        console.log('All calculated distances:', this.distances);
        console.log('Max distance found:', this.maxDistance);
        
        this.createProgressBar();
    }

    // Calculate shortest path distances from each node to 'the_point'
    calculateDistances() {
        const distances = {};
        
        // Build a graph of all connections first
        const graph = {};
        for (const nodeId in storyNodes) {
            graph[nodeId] = [];
        }
        
        // Add forward connections from exits
        for (const nodeId in storyNodes) {
            const node = storyNodes[nodeId];
            if (node.exits) {
                for (const direction in node.exits) {
                    const targetNode = node.exits[direction];
                    if (targetNode && graph[nodeId]) {
                        graph[nodeId].push(targetNode);
                        
                        // DEBUG: Log each connection
                        console.log(`Exit connection: ${nodeId} -> ${targetNode} (${direction})`);
                        
                        // ADD BIDIRECTIONAL CONNECTIONS (if you want reverse paths)
                        if (graph[targetNode]) {
                            graph[targetNode].push(nodeId);
                            console.log(`Reverse connection: ${targetNode} -> ${nodeId}`);
                        }
                    }
                }
            }
            
            // Add forward connections from choices
            if (node.choices) {
                for (const choice of node.choices) {
                    if (choice.nextNode && graph[nodeId]) {
                        graph[nodeId].push(choice.nextNode);
                        console.log(`Choice connection: ${nodeId} -> ${choice.nextNode}`);
                        
                        // Note: Usually choices don't have reverse connections
                        // because story choices are typically one-way
                    }
                }
            }
        }
        
        // DEBUG: Print the complete graph
        console.log('Complete graph structure:');
        for (const nodeId in graph) {
            if (graph[nodeId].length > 0) {
                console.log(`${nodeId}: [${graph[nodeId].join(', ')}]`);
            }
        }
        
        // Now use BFS from each node to find distance to target
        for (const startNode in storyNodes) {
            distances[startNode] = this.bfsDistance(startNode, this.targetNode, graph);
        }
        
        return distances;
    }

    // Also debug your BFS function:
    bfsDistance(start, target, graph) {
        if (start === target) return 0;
        
        const queue = [start];
        const visited = new Set([start]);
        const distances = { [start]: 0 };
        
        console.log(`\nBFS from ${start} to ${target}:`);
        
        while (queue.length > 0) {
            const current = queue.shift();
            const currentDistance = distances[current];
            
            console.log(`  Visiting ${current} (distance: ${currentDistance})`);
            
            // Check all neighbors of current node
            if (graph[current]) {
                console.log(`    Neighbors: [${graph[current].join(', ')}]`);
                
                for (const neighbor of graph[current]) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        distances[neighbor] = currentDistance + 1;
                        queue.push(neighbor);
                        
                        console.log(`    -> Added ${neighbor} with distance ${distances[neighbor]}`);
                        
                        // If we found the target, return the distance
                        if (neighbor === target) {
                            console.log(`    Found target! Distance: ${distances[neighbor]}`);
                            return distances[neighbor];
                        }
                    }
                }
            } else {
                console.log(`    No neighbors for ${current}`);
            }
        }
        
        console.log(`  Target ${target} unreachable from ${start}`);
        return 999;
    }

    
    createProgressBar() {
        // Make sure the progress container exists
        const progressContainer = document.getElementById('progress-container');
        if (!progressContainer) {
            console.error('Progress container not found in HTML.');
            return;
        }
    }
    
    updateProgress(currentNodeId) {
        console.log(`Updating progress for node: ${currentNodeId}`);
        
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (!progressFill || !progressText) {
            console.error('Progress elements not found');
            return;
        }
        
        // FIXED: Handle start and intro nodes specially - set to 0%
        if (currentNodeId === 'start' || currentNodeId === 'intro') {
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            progressText.style.color = '';
            progressText.style.fontWeight = '';
            progressText.style.visibility = 'visible';
            console.log(`Set progress to 0% for ${currentNodeId}`);
            return;
        }
        
        // FIXED: Handle the_point specially - set to 100%
        if (currentNodeId === this.targetNode) {
            progressFill.style.width = '100%';
            progressText.textContent = '100% - You have reached The Point!';
            progressText.style.color = '#27ae60';
            progressText.style.fontWeight = 'bold';
            progressText.style.visibility = 'visible'; // Always show at target
            console.log('Set progress to 100% for the_point');
            return;
        }
        
        // NEW: Handle hidden percentage nodes - set bar to 100% but hide text
        if (this.hidePercentageNodes.includes(currentNodeId)) {
            progressFill.style.width = '100%';
            progressText.textContent = '100%'; // Set content but will be hidden
            progressText.style.color = '';
            progressText.style.fontWeight = '';
            progressText.style.visibility = 'hidden';
            console.log(`Hidden node ${currentNodeId}: bar at 100%, text hidden`);
            return;
        }
        
        // For all other nodes, calculate based on distance
        if (!this.distances[currentNodeId]) {
            console.log(`No distance data for ${currentNodeId}`);
            return;
        }
        
        const currentDistance = this.distances[currentNodeId];
        
        // If unreachable, set to 0%
        if (currentDistance === 999) {
            progressFill.style.width = '0%';
            progressText.textContent = '0%';
            progressText.style.visibility = 'visible';
            console.log(`Node ${currentNodeId} unreachable, set to 0%`);
        } else {
            // Calculate progress (closer = higher percentage)
            const progressPercentage = Math.max(0, Math.round(((this.maxDistance - currentDistance) / this.maxDistance) * 100));
            
            progressFill.style.width = progressPercentage + '%';
            progressText.textContent = progressPercentage + '%';
            progressText.style.color = '';
            progressText.style.fontWeight = '';
            progressText.style.visibility = 'visible';
            
            console.log(`Node: ${currentNodeId}, Distance: ${currentDistance}, Progress: ${progressPercentage}%`);
        }
    }
    
    // ADDED: Method to add nodes where percentage should be hidden
    addHidePercentageNode(nodeId) {
        if (!this.hidePercentageNodes.includes(nodeId)) {
            this.hidePercentageNodes.push(nodeId);
            console.log(`Added ${nodeId} to hide percentage list`);
        }
    }
    
    // ADDED: Method to remove nodes from hide percentage list
    removeHidePercentageNode(nodeId) {
        const index = this.hidePercentageNodes.indexOf(nodeId);
        if (index > -1) {
            this.hidePercentageNodes.splice(index, 1);
            console.log(`Removed ${nodeId} from hide percentage list`);
        }
    }
    
    // Get a hint about the direction to progress
    getProgressHint(currentNodeId) {
        if (!this.distances[currentNodeId]) return null;
        
        const currentDistance = this.distances[currentNodeId];
        if (currentDistance === 0) return "You have reached your destination!";
        if (currentDistance === 1) return "You are very close to The Point!";
        if (currentDistance <= 3) return "You are getting closer to The Point.";
        if (currentDistance <= 5) return "You are making progress toward The Point.";
        return "The Point feels distant, but every step matters.";
    }
}

// Initialize the progression system when the game loads
let progressionSystem;

function initProgressionSystem() {
    if (typeof storyNodes !== 'undefined') {
        console.log('Story nodes available:', Object.keys(storyNodes));
        console.log('Looking for target node "the_point":', storyNodes['the_point'] ? 'FOUND' : 'NOT FOUND');
        
        progressionSystem = new ProgressionSystem();
        
        // EXAMPLE: Add specific nodes where you want to hide the percentage
        // Uncomment and modify these lines with your actual node IDs:
        // progressionSystem.addHidePercentageNode('secret_chamber');
        // progressionSystem.addHidePercentageNode('hidden_library');
        // progressionSystem.addHidePercentageNode('mysterious_door');
        
        // Debug: Check distances for key nodes
        console.log('Distances calculated:');
        console.log('- start:', progressionSystem.distances['start']);
        console.log('- intro:', progressionSystem.distances['intro']);
        console.log('- the_point:', progressionSystem.distances['the_point']);
        console.log('Max distance:', progressionSystem.maxDistance);
        
        // FIXED: Set initial progress for intro node properly
        progressionSystem.updateProgress('intro');
    } else {
        console.log('Story nodes not loaded yet, retrying...');
        setTimeout(initProgressionSystem, 100);
    }
}


function updateNodeProgress(nodeId) {
    if (progressionSystem) {
        progressionSystem.updateProgress(nodeId);
    }
}



// Initialize the game when the page loads
window.addEventListener('load', function() {
    initGame();
    initProgressionSystem();
});