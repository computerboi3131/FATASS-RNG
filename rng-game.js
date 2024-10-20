// Get the button and result elements
const rngButton = document.getElementById('rngButton');
const autoRollButton = document.getElementById('autoRollButton');
const result = document.getElementById('result');
const inventoryList = document.getElementById('inventory'); // Inventory list in HTML
const craftableItemsDiv = document.getElementById('craftableItems'); // Scrollable crafting area
const luckMultiplierDisplay = document.getElementById('luckMultiplier'); // Luck multiplier display
let autoRollActive = false;
let autoRollInterval;
let luckMultiplier = 1; // Default luck multiplier
let rollsSinceLastCraftingUpdate = 0; // Counter for rolls

// Initialize an empty inventory object to store item counts
const inventory = {};

// Define the items and their probabilities
const items = [
    { name: 'fatass', probability: 1 / 2 },
    { name: 'shiny fatass', probability: 1 / 10 },
    { name: 'shiny rainbow fatass', probability: 1 / 100 },
    { name: 'huge fatass', probability: 1 / 1000 },
    { name: 'shiny huge fatass', probability: 1 / 10000 },
    { name: 'titanic fatass', probability: 1 / 100000 },
    { name: 'shiny titanic fatass', probability: 1 / 1000000 },
    { name: 'shiny rainbow titanic fatass', probability: 1 / 10000000 },
    { name: 'divine fatass', probability: 1 / 37000000 },
    { name: 'shiny gold rainbow darkmatter huge titanic fatass', probability: 1 / 1000000000 }
];

// Define unique gradients for each fatass variant
const gradients = {
    'fatass': 'linear-gradient(to right, #ffcc00, #ff6699)',
    'shiny fatass': 'linear-gradient(to right, #ff6699, #ffcc00)',
    'shiny rainbow fatass': 'linear-gradient(to right, #ff33cc, #ffcc00)',
    'huge fatass': 'linear-gradient(to right, #00ccff, #0066ff)',
    'shiny huge fatass': 'linear-gradient(to right, #ff6699, #00ffcc)',
    'titanic fatass': 'linear-gradient(to right, #ff9900, #ccff00)',
    'shiny titanic fatass': 'linear-gradient(to right, #ccff00, #ff9900)',
    'shiny rainbow titanic fatass': 'linear-gradient(to right, #ff00ff, #ff33cc)',
    'divine fatass': 'linear-gradient(to right, #ffccff, #9933ff)',
    'shiny gold rainbow darkmatter huge titanic fatass': 'linear-gradient(to right, #ffff00, #ff3300)'
};

// Define crafting recipes with luck bonuses
const craftingRecipes = {
    'luck gear': { materials: { 'fatass': 2, 'shiny fatass': 1 }, luckBonus: 1, crafted: false },
    'enhanced luck gear': { materials: { 'shiny fatass': 3 }, luckBonus: 2, crafted: false },
    'mega luck gear': { materials: { 'huge fatass': 1, 'shiny huge fatass': 1 }, luckBonus: 3, crafted: false }
};

// Function to generate a random item based on probabilities
function generateItem() {
    const adjustedItems = items.map(item => ({
        ...item,
        adjustedProbability: item.probability * (1 / luckMultiplier) // Adjust probability by the inverse of luck multiplier
    }));

    const totalProbability = adjustedItems.reduce((sum, item) => sum + item.adjustedProbability, 0);
    const randomNumber = Math.random() * totalProbability; // Scale random number by total adjusted probability
    let cumulativeProbability = 0;

    // Loop through the adjusted items to find which one is generated
    for (let i = 0; i < adjustedItems.length; i++) {
        cumulativeProbability += adjustedItems[i].adjustedProbability; // Use adjusted probability

        if (randomNumber < cumulativeProbability) {
            return adjustedItems[i].name;
        }
    }

    // Fallback in case nothing is generated (should not happen)
    return 'nothing';
}

// Function to get the rarity description for an item
function getRarity(item) {
    const itemData = items.find(i => i.name === item);
    if (itemData) {
        const rarityValue = Math.round(1 / itemData.probability); // Calculate 1 in x
        return `(1 in ${rarityValue})`; // Format as 1 in x
    }
    return '';
}

// Function to update the inventory display, sorted by rarity
function updateInventoryDisplay() {
    inventoryList.innerHTML = ''; // Clear the current inventory display

    // Sort the inventory keys by their associated probabilities
    const sortedItems = Object.keys(inventory).sort((a, b) => {
        const itemA = items.find(item => item.name === a);
        const itemB = items.find(item => item.name === b);

        // Check if both items are found, if not, return 0 (they're equal)
        if (!itemA || !itemB) return 0;

        return itemA.probability - itemB.probability; // Sort by probability
    });

    // Display each item and its count
    sortedItems.forEach(item => {
        const listItem = document.createElement('li');
        const rarity = getRarity(item); // Get the rarity description
        listItem.textContent = `${item}: ${inventory[item]} ${rarity}`; // Include rarity in display

        // Apply the unique gradient for each item
        const itemData = items.find(i => i.name === item);
        if (itemData) {
            listItem.style.background = gradients[item] || 'none'; // Use the gradient if defined
            listItem.style.color = 'white'; // Change text color for better contrast
        }

        inventoryList.appendChild(listItem);
    });
}

// Function to update the crafting list display
function updateCraftingDisplay() {
    craftableItemsDiv.innerHTML = ''; // Clear current crafting items

    // Create crafting options for each recipe
    for (const recipeName in craftingRecipes) {
        const recipe = craftingRecipes[recipeName];
        const listItem = document.createElement('div');
        listItem.className = 'craftable-item';
        listItem.textContent = recipeName + ` (Luck Bonus: +${recipe.luckBonus})`; // Show gear name and luck bonus

        // Create a paragraph for materials needed
        const materialsNeeded = document.createElement('p');
        materialsNeeded.style.margin = '5px 0 0 0'; // Add some margin
        materialsNeeded.textContent = 'Materials needed:';

        // List materials with counts needed
        for (const material in recipe.materials) {
            const neededCount = recipe.materials[material];
            materialsNeeded.appendChild(document.createElement('div')).textContent = `${material} (${neededCount})`;
        }

        const button = document.createElement('button');
        button.textContent = 'Craft';
        button.addEventListener('click', () => {
            craftItem(recipeName, recipe.materials);
        });

        listItem.appendChild(materialsNeeded); // Append materials list
        listItem.appendChild(button);
        craftableItemsDiv.appendChild(listItem);
    }
}

// Function to roll and update inventory
function rollAndUpdate() {
    const generatedItem = generateItem(); // Generate a random item

    // Display the generated item
    result.textContent = "You got a " + generatedItem + "!";

    // Add the item to the inventory or update its count
    if (inventory[generatedItem]) {
        inventory[generatedItem]++;
    } else {
        inventory[generatedItem] = 1;
    }

    // Update the inventory display
    updateInventoryDisplay();

    // Increment the rolls counter
    rollsSinceLastCraftingUpdate++;

    // Update the crafting display every 10 rolls
    if (rollsSinceLastCraftingUpdate >= 10) {
        rollsSinceLastCraftingUpdate = 0; // Reset the counter
        updateCraftingDisplay(); // Update the crafting display every 10 rolls
    }
}

// Function to craft items based on the defined recipes
function craftItem(recipeName, materials) {
    // Check if we have enough materials to craft and if the item has not been crafted before
    if (craftingRecipes[recipeName].crafted) {
        alert("You cannot craft this item more than once.");
        return;
    }

    let canCraft = true;
    for (const item in materials) {
        if (!inventory[item] || inventory[item] < materials[item]) {
            canCraft = false;
            break;
        }
    }

    if (canCraft) {
        // Deduct the materials from the inventory
        for (const item in materials) {
            inventory[item] -= materials[item];
        }

        // Display the crafted item
        result.textContent = "Crafted: " + recipeName;

        // Update the luck multiplier
        luckMultiplier += craftingRecipes[recipeName].luckBonus;

        // Mark the item as crafted
        craftingRecipes[recipeName].crafted = true;

        // Update the luck multiplier display (only when crafting)
        luckMultiplierDisplay.textContent = `Current Luck Multiplier: ${luckMultiplier}`;

        // Update the inventory and crafting displays
        updateInventoryDisplay();
    } else {
        alert("Not enough materials to craft " + recipeName);
    }
}

// Set event listeners for buttons
rngButton.addEventListener('click', rollAndUpdate);
autoRollButton.addEventListener('click', () => {
    autoRollActive = !autoRollActive; // Toggle auto roll
    if (autoRollActive) {
        autoRollButton.textContent = 'Stop Auto Roll';
        autoRollInterval = setInterval(rollAndUpdate, 1); // Auto roll every 1ms
    } else {
        autoRollButton.textContent = 'Start Auto Roll';
        clearInterval(autoRollInterval);
    }
});

// Initial inventory display update
updateInventoryDisplay();
luckMultiplierDisplay.textContent = `Current Luck Multiplier: ${luckMultiplier}`; // Initialize luck multiplier display
