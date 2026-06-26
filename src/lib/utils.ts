import { type DropItem, type Trait, traitCodeNames, paramNames, xparamNames, sparamNames, specialFlagNames } from '$lib/types';

function decimalToPercentage(value: number | undefined, pos: number = 0): string {
	if (typeof value !== 'number' || !isFinite(value)) return String(value);
	return (value > 0 ? '+' : '') + `${(value * 100).toFixed(pos)}%`;
}

function getDropItems(items?: DropItem[]): string[] {
	if (!Array.isArray(items) || items.length === 0) return [];
	return items
		.map((item) => {
			if (item.kind === 0) return null;
			const kind =
				item.kind === 1
					? 'Item'
					: item.kind === 2
						? 'Weapon'
						: item.kind === 3
							? 'Armor'
							: `Kind ${item.kind}`;
			const chance =
				Number.isFinite(item.denominator) && item.denominator > 0 ? `1/${item.denominator}` : '0%';
			return `${kind} ${item.dataId} (${chance})`;
		})
		.filter((item): item is string => item !== null);
}

function getTraitLabel(trait: Trait): string {
	const code = Number(trait.code);
	let label = traitCodeNames[code] || `Trait ${code}`;

	if (trait.dataId !== undefined && trait.dataId !== null) {
		const dataId = Number(trait.dataId);
		switch (code) {
			case 11:
				label += `: Element ${dataId}`;
				break;
			case 12:
				label += `: ${paramNames[dataId] || `Param ${dataId}`}`;
				break;
			case 13:
			case 14:
				label += `: State ${dataId}`;
				break;
			case 21:
				label += `: ${paramNames[dataId] || `Param ${dataId}`}`;
				break;
			case 22:
				label += `: ${xparamNames[dataId] || `XParam ${dataId}`}`;
				break;
			case 23:
				label += `: ${sparamNames[dataId] || `SParam ${dataId}`}`;
				break;
			case 31:
				label += `: Element ${dataId}`;
				break;
			case 32:
				label += `: State ${dataId}`;
				break;
			case 41:
			case 42:
				label += `: Skill Type ${dataId}`;
				break;
			case 43:
			case 44:
				label += `: Skill ${dataId}`;
				break;
			case 51:
				label += `: Weapon Type ${dataId}`;
				break;
			case 52:
				label += `: Armor Type ${dataId}`;
				break;
			case 53:
				label += `: Equip Lock ${dataId}`;
				break;
			case 54:
				label += `: Equip Seal ${dataId}`;
				break;
			case 55:
				label += `: Slot Type ${dataId}`;
				break;
			case 61:
				label += `: Action ${dataId}`;
				break;
			case 62:
				label += `: ${specialFlagNames[dataId] || `Flag ${dataId}`}`;
				break;
			case 63:
				label += `: Collapse ${dataId}`;
				break;
			case 64:
				label += `: Party Ability ${dataId}`;
				break;
			default:
				label += `: ${dataId}`;
				break;
		}
	}

	if (trait.value !== undefined && trait.value !== null) {
		const value = Number(trait.value);
		switch (code) {
			case 11:
			case 12:
			case 13:
			case 21:
			case 22:
			case 23:
				label += ` ${decimalToPercentage(value)}`;
				break;
			case 14:
				break;
			case 33:
			case 34:
			case 61:
				label += ` +${value}`;
				break;
			default:
				label += ` ${value.toString()}`;
				break;
		}
	}
	return label;
}
