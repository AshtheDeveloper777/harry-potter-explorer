// API endpoint - Harry Potter API (no API key required)
const API_BASE = 'https://hp-api.onrender.com/api';

// Current active tab
let currentTab = 'characters';

// DOM elements
const tabButtons = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');

// Event listeners
tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
    });
});

searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchData(query);
    } else {
        loadData();
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
            searchData(query);
        } else {
            loadData();
        }
    }
});

// Switch between tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Update active tab button
    tabButtons.forEach(btn => {
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Clear search and load data
    searchInput.value = '';
    loadData();
}

// Load data based on current tab
async function loadData() {
    hideAll();
    showLoading();
    
    try {
        let data;
        let endpoint;
        
        switch(currentTab) {
            case 'characters':
                endpoint = '/characters';
                break;
            case 'spells':
                endpoint = '/spells';
                break;
            case 'houses':
                // Houses API might not exist, so we'll get houses from characters
                endpoint = '/characters';
                break;
            default:
                endpoint = '/characters';
        }
        
        const response = await fetch(`${API_BASE}${endpoint}`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        
        data = await response.json();
        
        if (currentTab === 'houses') {
            // Extract unique houses from characters
            const houses = extractHouses(data);
            displayHouses(houses);
        } else {
            displayData(data);
        }
        
    } catch (err) {
        showError(err.message);
    } finally {
        hideLoading();
    }
}

// Search data
function searchData(query) {
    hideAll();
    showLoading();
    
    // For simplicity, we'll filter client-side after loading
    loadData().then(() => {
        const cards = results.querySelectorAll('.card');
        const queryLower = query.toLowerCase();
        
        cards.forEach(card => {
            const text = card.textContent.toLowerCase();
            if (text.includes(queryLower)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
        
        hideLoading();
    });
}

// Display data based on current tab
function displayData(data) {
    if (!data || data.length === 0) {
        showError('No data found');
        return;
    }
    
    results.innerHTML = '';
    
    if (currentTab === 'characters') {
        displayCharacters(data);
    } else if (currentTab === 'spells') {
        displaySpells(data);
    }
}

// Display characters
function displayCharacters(characters) {
    characters.forEach(character => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const house = character.house || 'Unknown';
        const houseClass = house.toLowerCase().replace(/\s+/g, '-');
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${character.name || 'Unknown'}</h3>
                ${character.alternate_names && character.alternate_names.length > 0 
                    ? `<p class="card-subtitle">Also known as: ${character.alternate_names.join(', ')}</p>` 
                    : ''}
            </div>
            <div class="card-content">
                ${character.species ? `<div class="card-info"><span class="card-label">Species:</span><span class="card-value">${character.species}</span></div>` : ''}
                ${character.gender ? `<div class="card-info"><span class="card-label">Gender:</span><span class="card-value">${character.gender}</span></div>` : ''}
                ${character.dateOfBirth ? `<div class="card-info"><span class="card-label">Date of Birth:</span><span class="card-value">${character.dateOfBirth}</span></div>` : ''}
                ${character.ancestry ? `<div class="card-info"><span class="card-label">Ancestry:</span><span class="card-value">${character.ancestry}</span></div>` : ''}
                ${character.eyeColour ? `<div class="card-info"><span class="card-label">Eye Colour:</span><span class="card-value">${character.eyeColour}</span></div>` : ''}
                ${character.hairColour ? `<div class="card-info"><span class="card-label">Hair Colour:</span><span class="card-value">${character.hairColour}</span></div>` : ''}
                ${character.wand && character.wand.wood ? `<div class="card-info"><span class="card-label">Wand:</span><span class="card-value">${character.wand.wood} wood, ${character.wand.core || 'unknown core'}</span></div>` : ''}
                ${character.patronus ? `<div class="card-info"><span class="card-label">Patronus:</span><span class="card-value">${character.patronus}</span></div>` : ''}
                ${house !== 'Unknown' ? `<div class="house-badge house-${houseClass}">${house}</div>` : ''}
            </div>
        `;
        
        results.appendChild(card);
    });
}

// Display spells
function displaySpells(spells) {
    spells.forEach(spell => {
        const card = document.createElement('div');
        card.className = 'card';
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${spell.name || 'Unknown Spell'}</h3>
            </div>
            <div class="card-content">
                ${spell.description ? `<p class="card-value">${spell.description}</p>` : ''}
                ${spell.type ? `<div class="spell-type">Type: ${spell.type}</div>` : ''}
            </div>
        `;
        
        results.appendChild(card);
    });
}

// Extract unique houses from characters
function extractHouses(characters) {
    const housesMap = {};
    
    characters.forEach(char => {
        const house = char.house;
        if (house && house !== '') {
            if (!housesMap[house]) {
                housesMap[house] = {
                    name: house,
                    members: []
                };
            }
            housesMap[house].members.push(char.name);
        }
    });
    
    return Object.values(housesMap);
}

// Display houses
function displayHouses(houses) {
    if (houses.length === 0) {
        showError('No houses found');
        return;
    }
    
    results.innerHTML = '';
    
    houses.forEach(house => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const houseClass = house.name.toLowerCase().replace(/\s+/g, '-');
        
        card.innerHTML = `
            <div class="card-header">
                <h3 class="card-title">${house.name}</h3>
                <div class="house-badge house-${houseClass}">${house.name}</div>
            </div>
            <div class="card-content">
                <div class="card-info">
                    <span class="card-label">Members:</span>
                    <span class="card-value">${house.members.length}</span>
                </div>
                <div class="card-info" style="margin-top: 15px;">
                    <span class="card-label">Notable Members:</span>
                    <div class="card-value" style="margin-top: 8px;">
                        ${house.members.slice(0, 5).map(member => `<div>• ${member}</div>`).join('')}
                        ${house.members.length > 5 ? `<div style="opacity: 0.7;">... and ${house.members.length - 5} more</div>` : ''}
                    </div>
                </div>
            </div>
        `;
        
        results.appendChild(card);
    });
}

// Show/hide functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
}

function hideAll() {
    error.classList.add('hidden');
    results.innerHTML = '';
}

// Load initial data
loadData();

