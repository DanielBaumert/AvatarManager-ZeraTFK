import { InventoryItem, Item, ITEMS } from "./items";

const targt = '/api?a234dn=';

type Gender = "Male" | "Female";

export type Avatar = {
    title: string;
    skinColor: string;
    expPoints: number;
    gender: Gender;
    patreon: number | undefined;
    mainAvatar: string,
    gold: number,
    brMarken: number,
    avatarLevel: number,
} & Ausstattung

export type Ausstattung = {
    itemIDList: InventoryItem[],
    lWeapon: number;
    rWeapon: number;
    armor: number;
    headTop: number;
    headFront: number;
    headHair: number;
    shoes: number;
    back: number;
}

const EP_TABLE = [
    0, 50, 92, 170, 320, 585, 1080, 2000, 3710, 6860,
    12690, 19410, 29700, 45450, 69530, 106390, 157450, 233030, 344890, 475950,
    656810, 900500];


export const getAvatarLevel = (exp: number): number => {
    let level = 0;
    while (exp >= EP_TABLE[level]) {
        level++;
    }
    return level;
}

// "var_fld_1=facebamm_1&var_fld_2=&var_fld_3=White&var_fld_4=23679&var_fld_5=9517&var_fld_7=expPoints&var_fld_8=Male&var_fld_20=I88|1I132|1I46|1I12|1I119|1I118|2I105|2I130|1I70|3I112|1I125|2I11|1I


const parseAvatar = (data: string): Avatar => {
    const items = data.split('::');
    const exp = parseInt(items[2]) | 0;

    return {
        title: items[0],
        skinColor: items[1],
        expPoints: exp,
        gender: items[3] as Gender,
        lWeapon: parseInt(items[4]),
        rWeapon: parseInt(items[5]),
        armor: parseInt(items[6]),
        headTop: parseInt(items[7]),
        headFront: parseInt(items[8]),
        headHair: parseInt(items[9]),
        shoes: parseInt(items[10]),
        back: parseInt(items[11]),
        patreon: parseInt(items[12]) | 0,
        mainAvatar: items[13]?.replace(/|/g, '\\'),
        itemIDList: getInventoryItems(items[14]),
        gold: parseInt(items[15]) | 0,
        brMarken: parseInt(items[16]) | 0,
        avatarLevel: getAvatarLevel(exp),
    }
}

export const getItemIfNotZero = (id: number): Item | undefined =>
    isNaN(id) ? undefined : ITEMS[id];

type inventoryItemInfo = {
    itemId: number
    level: number,
}

const getInventoryItems = (items: string): InventoryItem[] => {

    const inventory = items?.split("I")
        .map(x => x.split('|'))
        .filter(x => x.length == 2)
        .map<inventoryItemInfo>(x => {
            return { itemId: parseInt(x[0]), level: parseInt(x[1]) }
        })
        .filter(x => !isNaN(x.itemId) && !isNaN(x.level))
        .map<InventoryItem>(x => ({ level: x.level, ...ITEMS[x.itemId] }));

    return inventory;
}


export const getItemValue = (item: inventoryItemInfo) =>
    item.level + Math.ceil(item.level * ((item.level - 1.0) * 0.12));



export const getAvatar = async (id: string | undefined): Promise<Avatar | undefined> => {
    if (id === undefined)
        return undefined;
    const response = await fetch(targt + id);
    const data = await response.text();
    return parseAvatar(data);
}