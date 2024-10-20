// Get the button and result elements
const rngButton = document.getElementById('rngButton');
const autoRollButton = document.getElementById('autoRollButton');
const result = document.getElementById('result');
const inventoryList = document.getElementById('inventory'); // Inventory list in HTML
let autoRollActive = false;
let autoRollInterval;

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

// Function to generate a random item based on probabilities
function generateItem() {
    const randomNumber = Math.random(); // Get a random number between 0 and 1
    let cumulativeProbability = 0;

    // Loop through the items to find which one is generated
    for (let i = 0; i < items.length; i++) {
        cumulativeProbability += items[i].probability;

        if (randomNumber < cumulativeProbability) {
            return items[i].name;
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
}

// Add an event listener to the button for manual rolling
rngButton.addEventListener('click', function() {
    rollAndUpdate();
});

// Add a toggleable auto-roll button
autoRollButton.addEventListener('click', function() {
    autoRollActive = !autoRollActive;

    if (autoRollActive) {
        // Start auto-rolling every 1ms
        autoRollButton.textContent = "Stop Auto Roll";
        autoRollInterval = setInterval(rollAndUpdate, 1);
    } else {
        // Stop auto-rolling
        autoRollButton.textContent = "Start Auto Roll";
        clearInterval(autoRollInterval);
    }
});
