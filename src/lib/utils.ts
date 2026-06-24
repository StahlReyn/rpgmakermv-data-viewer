import type { DropItem, Trait, RawEnemy, NormalizedEnemy } from '$lib/types';

const paramNames: string[] = ['hp', 'mp', 'atk', 'def', 'mat', 'mdf', 'agi', 'luk'];

const traitCodeNames: Record<number, string> = { 11: 'Element Rate', 12: 'Debuff Rate', 13: 'State Rate', 14: 'State Resist', 21: 'Parameter', 22: 'X-Parameter', 23: 'S-Parameter', 31: 'Attack Element', 32: 'Attack State', 33: 'Attack Speed', 34: 'Attack Times', 41: 'Skill Type Add', 42: 'Skill Type Seal', 43: 'Skill Add', 44: 'Skill Seal', 51: 'Equip Wtype', 52: 'Equip Atype', 53: 'Equip Lock', 54: 'Equip Seal', 55: 'Slot Type', 61: 'Action Plus', 62: 'Special Flag', 63: 'Collapse Type', 64: 'Party Ability' };
const xparamNames: Record<number, string> = { 0: 'Hit Rate', 1: 'Evasion Rate', 2: 'Critical Rate', 3: 'Critical Evasion Rate', 4: 'Magic Evasion Rate', 5: 'Magic Reflection Rate', 6: 'Counter Attack Rate', 7: 'HP Regeneration', 8: 'MP Regeneration', 9: 'TP Regeneration' };
const sparamNames: Record<number, string> = { 0: 'Target Rate', 1: 'Guard Effect', 2: 'Recovery Effect', 3: 'Pharmacology', 4: 'MP Cost Rate', 5: 'TP Charge', 6: 'Physical Damage', 7: 'Magical Damage', 8: 'Floor Damage', 9: 'Experience Rate' };
const specialFlagNames: Record<number, string> = { 0: 'Auto Battle', 1: 'Guard', 2: 'Substitute', 3: 'Preserve TP' };

function decimalToPercentage(value: number | undefined, pos: number = 0): string {
    if (typeof value !== 'number' || !isFinite(value)) return String(value);
    return (value > 0 ? '+' : '') + `${(value * 100).toFixed(pos)}%`;
}

function getDropItems(items?: DropItem[]): string[] {
    if (!Array.isArray(items) || items.length === 0) return [];
    return items.map(item => {
        if (item.kind === 0) return null;
        const kind = (item.kind === 1 ? 'Item' : item.kind === 2 ? 'Weapon' : item.kind === 3 ? 'Armor' : `Kind ${item.kind}`);
        const chance = Number.isFinite(item.denominator) && item.denominator > 0 ? `1/${item.denominator}` : '0%';
        return `${kind} ${item.dataId} (${chance})`;
    }).filter((item): item is string => item !== null);
}

function getTraitLabel(trait: Trait): string {
    const code = Number(trait.code);
    let label = traitCodeNames[code] || `Trait ${code}`;

    if (trait.dataId !== undefined && trait.dataId !== null) {
        const dataId = Number(trait.dataId);
        switch (code) {
            case 11: label += `: Element ${dataId}`; break;
            case 12: label += `: ${paramNames[dataId] || `Param ${dataId}`}`; break;
            case 13: case 14: label += `: State ${dataId}`; break;
            case 21: label += `: ${paramNames[dataId] || `Param ${dataId}`}`; break;
            case 22: label += `: ${xparamNames[dataId] || `XParam ${dataId}`}`; break;
            case 23: label += `: ${sparamNames[dataId] || `SParam ${dataId}`}`; break;
            case 31: label += `: Element ${dataId}`; break;
            case 32: label += `: State ${dataId}`; break;
            case 41: case 42: label += `: Skill Type ${dataId}`; break;
            case 43: case 44: label += `: Skill ${dataId}`; break;
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
        switch (code) {
            case 11: case 12: case 13: case 21: case 22: case 23:
                label += ` ${decimalToPercentage(value)}`; break;
            case 14: break;
            case 33: case 34: case 61:
                label += ` +${value}`; break;
            default: label += ` ${value.toString()}`; break;
        }
    }
    return label;
}

export function normalizeEnemy(item: RawEnemy): NormalizedEnemy {
    const params = Array.isArray(item.params) ? item.params : [];
    return {
        id: item.id ?? '-',
        name: item.name ?? '',
        exp: item.exp ?? 0,
        gold: item.gold ?? 0,
        dropItems: getDropItems(item.dropItems),
        traits: getTraits(item.traits),
        note: item.note ?? '',
        searchText: [item.id, item.name, item.battlerName, item.note, item.note?.replace(/\s+/g, ' ')]
            .filter(Boolean)
            .join(' ')
            .toLowerCase(),
        hp: params[0] ?? 0,
        mp: params[1] ?? 0,
        atk: params[2] ?? 0,
        def: params[3] ?? 0,
        mat: params[4] ?? 0,
        mdf: params[5] ?? 0,
        agi: params[6] ?? 0,
        luk: params[7] ?? 0,
    };
}

function getTraits(traits?: Trait[]): string[] {
    if (!Array.isArray(traits) || traits.length === 0) return [];
    return traits.map(getTraitLabel);
}