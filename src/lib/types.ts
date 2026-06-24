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

export interface RawEnemy {
    id?: number;
    name?: string;
    battlerName?: string;
    exp?: number;
    gold?: number;
    dropItems?: DropItem[];
    traits?: Trait[];
    note?: string;
    params?: number[];
}

export interface NormalizedEnemy {
    id: number | string;
    name: string;
    exp: number;
    gold: number;
    dropItems: string[];
    traits: string[];
    note: string;
    searchText: string;
    hp: number;
    mp: number;
    atk: number;
    def: number;
    mat: number;
    mdf: number;
    agi: number;
    luk: number;
    [key: string]: string | number | string[];
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