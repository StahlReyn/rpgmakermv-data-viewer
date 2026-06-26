export const paramNames: string[] = ['hp', 'mp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];

export const traitCodeNames: Record<number, string> = {
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
	64: 'Party Ability'
};

export const xparamNames: Record<number, string> = {
	0: 'Hit Rate',
	1: 'Evasion Rate',
	2: 'Critical Rate',
	3: 'Critical Evasion Rate',
	4: 'Magic Evasion Rate',
	5: 'Magic Reflection Rate',
	6: 'Counter Attack Rate',
	7: 'HP Regeneration',
	8: 'MP Regeneration',
	9: 'TP Regeneration'
};

export const sparamNames: Record<number, string> = {
	0: 'Target Rate',
	1: 'Guard Effect',
	2: 'Recovery Effect',
	3: 'Pharmacology',
	4: 'MP Cost Rate',
	5: 'TP Charge',
	6: 'Physical Damage',
	7: 'Magical Damage',
	8: 'Floor Damage',
	9: 'Experience Rate'
};

export const specialFlagNames: Record<number, string> = {
	0: 'Auto Battle',
	1: 'Guard',
	2: 'Substitute',
	3: 'Preserve TP'
};

export interface DropItem {
    kind: number;
    dataId: number;
    denominator: number;
}

export interface Trait {
    code: number;
    dataId?: number;
    value?: number;
}

export interface Enemy {
    id?: number;
    name?: string;
    battlerName?: string;
    exp?: number;
    gold?: number;
    dropItems?: DropItem[];
    traits?: Trait[];
    note?: string;
    params: number[];
}

export interface AppFilters {
    searchQuery: string;
    sortKey: string;
    sortDir: string;
    minId: number | null;
    maxId: number | null;
    hideNoName: boolean;
    hideNotes: boolean;
    hideMag: boolean;
    themeMode: string;
    viewMode: 'list' | 'grid';
}

export interface TraitStyle {
	bg: string;
	color: string;
	symbol: string;
}

// Function to resolve specific theme styling dictated by the first digit of the code
export function getTraitStyle(code: number): TraitStyle {
	const category = Math.floor(code / 10);
	
	switch (category) {
		case 1: // Rates / Resistances
			return { bg: '#2b4c7e', color: '#e2f1ff', symbol: '🛡️' };
		case 2: // Parameters
			return { bg: '#2e6f40', color: '#e6f4ea', symbol: '📊' };
		case 3: // Attack settings
			return { bg: '#8c2d19', color: '#fce8e6', symbol: '⚔️' };
		case 4: // Skill interactions
			return { bg: '#62208a', color: '#f3e8f9', symbol: '🔮' };
		case 5: // Equipment restrictions
			return { bg: '#735118', color: '#fef7e0', symbol: '🛡️' };
		case 6: // Action & Party abilities
			return { bg: '#166863', color: '#e4f7f6', symbol: '✨' };
		default: // Fallback
			return { bg: '#4a5568', color: '#ffffff', symbol: '🔹' };
	}
}


export interface DropStyle {
	bg: string;
	color: string;
	symbol: string;
}

// Maps kinds to names, styling parameters, and icons
export const dropKindConfig: Record<number, { name: string; symbol: string; bg: string; color: string }> = {
	1: { name: 'Item', symbol: '🧪', bg: '#2b5c8f', color: '#e6f0fa' },
	2: { name: 'Weapon', symbol: '⚔️', bg: '#8f2b2b', color: '#fae6e6' },
	3: { name: 'Armor', symbol: '🛡️', bg: '#735118', color: '#fef7e0' }
};

// Returns style rules based on the drop kind attribute
export function getDropStyle(kind: number): DropStyle {
	const config = dropKindConfig[kind];
	if (!config) {
		return { bg: '#4a5568', color: '#ffffff', symbol: '📦' }; // Fallback
	}
	return { bg: config.bg, color: config.color, symbol: config.symbol };
}

// Helper to calculate human-readable probability text
export function formatProbability(denominator: number): string {
	if (denominator <= 1) return '100%';
	const percent = (100 / denominator).toFixed(1).replace('.0', '');
	return `1/${denominator} (${percent}%)`;
}