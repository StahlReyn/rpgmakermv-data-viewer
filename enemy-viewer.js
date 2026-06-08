const DATA_PATH = './data/Enemies.json';
const SEARCH = document.getElementById('search');
const SORT_KEY = document.getElementById('sortKey');
const SORT_DIR = document.getElementById('sortDir');
const ROW_MODE = document.getElementById('rowMode');
const MIN_ID = document.getElementById('minId');
const MAX_ID = document.getElementById('maxId');
const HIDE_NO_NAME = document.getElementById('hideNoName');
const HIDE_NOTES = document.getElementById('hideNotes');
const HIDE_MAG = document.getElementById('hideMag');
const THEME_MODE = document.getElementById('themeMode');
const TABLE = document.querySelector('table');
const TABLE_BODY = document.getElementById('table-body');
const STATUS = document.getElementById('status');
const DROP_ZONE = document.getElementById('dropZone');
const THEME_STORAGE_KEY = 'enemyViewerThemeMode';
let droppedData = null;

let enemies = [];

const paramNames = ['hp', 'mp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];

const traitCodeNames = {
    11: 'Element Rate',
    12: 'Debuff Rate',
    13: 'State Rate',
    14: 'State Resist',
    21: 'Parameter',
    22: 'X-Parameter',
    23: 'S-Parameter',
    31: 'Attack Element',
    32: 'Attack State',
    33: 'Attack Speed',
    34: 'Attack Times',
    41: 'Skill Type Add',
    42: 'Skill Type Seal',
    43: 'Skill Add',
    44: 'Skill Seal',
    51: 'Equip Wtype',
    52: 'Equip Atype',
    53: 'Equip Lock',
    54: 'Equip Seal',
    55: 'Slot Type',
    61: 'Action Plus',
    62: 'Special Flag',
    63: 'Collapse Type',
    64: 'Party Ability',
};

const xparamNames = {
    0: 'Hit Rate',
    1: 'Evasion Rate',
    2: 'Critical Rate',
    3: 'Critical Evasion Rate',
    4: 'Magic Evasion Rate',
    5: 'Magic Reflection Rate',
    6: 'Counter Attack Rate',
    7: 'HP Regeneration',
    8: 'MP Regeneration',
    9: 'TP Regeneration',
};

const sparamNames = {
    0: 'Target Rate',
    1: 'Guard Effect',
    2: 'Recovery Effect',
    3: 'Pharmacology',
    4: 'MP Cost Rate',
    5: 'TP Charge',
    6: 'Physical Damage',
    7: 'Magical Damage',
    8: 'Floor Damage',
    9: 'Experience Rate',
};

const specialFlagNames = {
    0: 'Auto Battle',
    1: 'Guard',
    2: 'Substitute',
    3: 'Preserve TP',
};

function decimalToPercentage(value, pos = 0) {
    if (typeof value !== 'number' || !isFinite(value)) return String(value);
    return (value > 0 ? '+' : '') + `${(value * 100).toFixed(pos)}%`;
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDropItems(items) {
    if (!Array.isArray(items) || items.length === 0) return '-';
    const rows = items.map(item => {
        if (item.kind === 0) {
            return ``;
        }
        const kind = (
            item.kind === 1 ? 'Item' : 
            item.kind === 2 ? 'Weapon' : 
            item.kind === 3 ? 'Armor' : 
            `Kind ${item.kind}`
        );
        const chance = Number.isFinite(item.denominator) && item.denominator > 0
            ? `1/${item.denominator}`
            : '0%';
        return `<li>${escapeHtml(kind)} ${escapeHtml(item.dataId)} (${escapeHtml(chance)})</li>`;
    });
    return `<ul class="drop-list">${rows.join('')}</ul>`;
}

function formatTraitLabel(trait) {
    const code = Number(trait.code);
    const codeName = traitCodeNames[code] || `Trait ${code}`;
    let label = codeName;

    if (trait.dataId !== undefined && trait.dataId !== null) {
        const dataId = Number(trait.dataId);
        switch (code) {
            case 11: label += `: Element ${dataId}`; break;
            case 12: label += `: ${paramNames[dataId] || `Param ${dataId}`}`; break;
            case 13:
            case 14: label += `: State ${dataId}`; break;
            case 21: label += `: ${paramNames[dataId] || `Param ${dataId}`}`; break;
            case 22: label += `: ${xparamNames[dataId] || `XParam ${dataId}`}`; break;
            case 23: label += `: ${sparamNames[dataId] || `SParam ${dataId}`}`; break;
            case 31: label += `: Element ${dataId}`; break;
            case 32: label += `: State ${dataId}`; break;
            case 41:
            case 42: label += `: Skill Type ${dataId}`; break;
            case 43:
            case 44: label += `: Skill ${dataId}`; break;
            case 51: label += `: Weapon Type ${dataId}`; break;
            case 52: label += `: Armor Type ${dataId}`; break;
            case 53: label += `: Equip Lock ${dataId}`; break;
            case 54: label += `: Equip Seal ${dataId}`; break;
            case 55: label += `: Slot Type ${dataId}`; break;
            case 61: label += `: Action ${dataId}`; break;
            case 62: label += `: ${specialFlagNames[dataId] || `Flag ${dataId}`}`; break;
            case 63: label += `: Collapse ${dataId}`; break;
            case 64: label += `: Party Ability ${dataId}`; break;
            default: label += `: ${dataId}`; break;
        }
    }

    if (trait.value !== undefined && trait.value !== null) {
        const value = Number(trait.value);
        let valueDisplay = '';
        // Refer to rpg_objects.js for trait value code
        switch (code) {
            case 11:
            case 12:
            case 13: // Rates are percentage-based, so convert to percentage display
                valueDisplay = decimalToPercentage(value);
                break;
            case 14: // Resist no value display since it's just 0 or 1
                break;
            case 21:
            case 22:
            case 23: // Rates are percentage-based, so convert to percentage display
                valueDisplay = decimalToPercentage(value);
                break;
            case 33:
            case 34:
            case 61:
                valueDisplay = `+${value}`;
                break;
            default:
                valueDisplay = value.toString();
                break;
        }
        label += ` ${valueDisplay}`;
    }

    return label;
}

function formatTraits(traits) {
    if (!Array.isArray(traits) || traits.length === 0) return '-';
    const rows = traits.map(trait => `<li>${escapeHtml(formatTraitLabel(trait))}</li>`);
    return `<ul class="trait-list">${rows.join('')}</ul>`;
}

function normalizeEnemy(item) {
    const params = Array.isArray(item.params) ? item.params : [];
    const normalized = {
        id: item.id ?? '-',
        name: item.name ?? '',
        exp: item.exp ?? 0,
        gold: item.gold ?? 0,
        dropItems: formatDropItems(item.dropItems),
        traits: formatTraits(item.traits),
        note: item.note ?? '',
        searchText: [item.id, item.name, item.battlerName, item.note, item.note?.replace(/\s+/g, ' ')].filter(Boolean).join(' ').toLowerCase(),
    };

    paramNames.forEach((key, index) => {
        normalized[key] = params[index] ?? 0;
    });

    return normalized;
}

function renderNote(note, singleLine) {
    if (!note) return '-';
    const escaped = escapeHtml(note);
    return singleLine ? escaped.replace(/\s+/g, ' ') : escaped.replace(/\n/g, '<br>');
}

function applyTheme(mode) {
    document.body.classList.remove('theme-light', 'theme-dark');
    if (mode === 'light') {
        document.body.classList.add('theme-light');
    } else if (mode === 'dark') {
        document.body.classList.add('theme-dark');
    }
}

function loadThemePreference() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const mode = stored === 'light' || stored === 'dark' || stored === 'browser' ? stored : 'browser';
    THEME_MODE.value = mode;
    if (mode === 'browser') {
        document.body.classList.remove('theme-light', 'theme-dark');
    } else {
        applyTheme(mode);
    }
}

function setThemePreference(event) {
    const mode = event?.target?.value || THEME_MODE.value;
    if (mode === 'browser') {
        localStorage.removeItem(THEME_STORAGE_KEY);
        document.body.classList.remove('theme-light', 'theme-dark');
    } else {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
        applyTheme(mode);
    }
}

function renderTable(rows) {
    TABLE_BODY.innerHTML = '';
    if (rows.length === 0) {
        TABLE_BODY.innerHTML = '<tr><td colspan="15">No matching enemies found.</td></tr>';
        return;
    }

    const singleLine = ROW_MODE.value === 'singleline';
    const fragment = document.createDocumentFragment();
    rows.forEach(enemy => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${escapeHtml(enemy.id)}</td>
            <td>${escapeHtml(enemy.name || '-')}</td>
            <td>${escapeHtml(enemy.hp)}</td>
            <td>${escapeHtml(enemy.mp)}</td>
            <td>${escapeHtml(enemy.atk)}</td>
            <td>${escapeHtml(enemy.def)}</td>
            <td class="param-mag">${escapeHtml(enemy.mat)}</td>
            <td class="param-mag">${escapeHtml(enemy.mdf)}</td>
            <td>${escapeHtml(enemy.agi)}</td>
            <td>${escapeHtml(enemy.luk)}</td>
            <td>${escapeHtml(enemy.exp)}</td>
            <td>${escapeHtml(enemy.gold)}</td>
            <td class="drop-item-cell cell">${enemy.dropItems}</td>
            <td class="trait-cell cell">${enemy.traits}</td>
            <td class="note-cell">${renderNote(enemy.note, singleLine)}</td>
        `;
        fragment.appendChild(tr);
    });
    TABLE_BODY.appendChild(fragment);
}

function filterAndSort() {
    const query = SEARCH.value.trim().toLowerCase();
    const sortKey = SORT_KEY.value;
    const sortDir = SORT_DIR.value;

    let filtered = enemies;
    if (query) {
        filtered = enemies.filter(enemy => enemy.searchText.includes(query));
    }

    filtered.sort((a, b) => {
        const aValue = a[sortKey] ?? '';
        const bValue = b[sortKey] ?? '';
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortDir === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return sortDir === 'asc'
            ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true })
            : String(bValue).localeCompare(String(aValue), undefined, { numeric: true });
    });

    const minId = Number.parseInt(MIN_ID.value, 10);
    const maxId = Number.parseInt(MAX_ID.value, 10);

    filtered = filtered.filter(enemy => {
        const id = Number(enemy.id) || 0;
        const inRange = (!Number.isFinite(minId) || id >= minId) && (!Number.isFinite(maxId) || id <= maxId);
        const hasName = !HIDE_NO_NAME.checked || (enemy.name && enemy.name.trim() !== '');
        return inRange && hasName;
    });

    TABLE.classList.toggle('single-line', ROW_MODE.value === 'singleline');
    TABLE.classList.toggle('hide-mag', HIDE_MAG.checked);
    TABLE.classList.toggle('hide-notes', HIDE_NOTES.checked);
    renderTable(filtered);
    STATUS.textContent = `Showing ${filtered.length} of ${enemies.length} enemies (ID ${minId || 0}-${maxId || '∞'}${HIDE_NO_NAME.checked ? ', hiding blank names' : ''}${HIDE_NOTES.checked ? ', hiding notes' : ''}${HIDE_MAG.checked ? ', hiding MAT/MDF' : ''}).`;
}

async function loadEnemies(data = null) {
    try {
        let json;
        if (data) {
            json = data;
        } else {
            const response = await fetch(DATA_PATH, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            json = await response.json();
        }
        enemies = Array.isArray(json)
            ? json.filter(item => item && item.id !== undefined).map(normalizeEnemy)
            : [];
        filterAndSort();
    } catch (error) {
        STATUS.innerHTML = `<span class="error">Unable to load enemy data: ${error.message}</span>`;
    }
}

function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    DROP_ZONE.classList.add('drag-active');
    document.body.classList.add('drag-active-global');
}

DROP_ZONE.addEventListener('dragover', handleDragOver);
DROP_ZONE.addEventListener('dragleave', handleDragLeave);
DROP_ZONE.addEventListener('drop', handleDrop);

function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!event.relatedTarget || event.relatedTarget.nodeName === 'HTML') {
        DROP_ZONE.classList.remove('drag-active');
        document.body.classList.remove('drag-active-global');
    }
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    document.body.classList.remove('drag-active-global');
    DROP_ZONE.classList.remove('drag-active');

    const files = event.dataTransfer.files;
    if (files.length === 0) return;

    const file = files[0];
    if (!file.name.endsWith('.json')) {
        STATUS.innerHTML = `<span class="error">Please drop a JSON file.</span>`;
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            droppedData = JSON.parse(e.target.result);
            loadEnemies(droppedData);
        } catch (error) {
            STATUS.innerHTML = `<span class="error">Failed to parse JSON: ${error.message}</span>`;
        }
    };
    reader.onerror = () => {
        STATUS.innerHTML = `<span class="error">Failed to read file.</span>`;
    };
    reader.readAsText(file);
}

SEARCH.addEventListener('input', filterAndSort);
SORT_KEY.addEventListener('change', filterAndSort);
SORT_DIR.addEventListener('change', filterAndSort);
ROW_MODE.addEventListener('change', filterAndSort);
MIN_ID.addEventListener('input', filterAndSort);
MAX_ID.addEventListener('input', filterAndSort);
HIDE_NO_NAME.addEventListener('change', filterAndSort);
HIDE_NOTES.addEventListener('change', filterAndSort);
HIDE_MAG.addEventListener('change', filterAndSort);
THEME_MODE.addEventListener('change', setThemePreference);
document.addEventListener('dragover', handleDragOver);
document.addEventListener('dragleave', handleDragLeave);
document.addEventListener('drop', handleDrop);


loadThemePreference();
loadEnemies();
