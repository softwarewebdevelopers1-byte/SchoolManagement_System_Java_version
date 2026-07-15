// Deterministic pseudo-random helpers so numbers stay stable between renders.
export function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const rng = mulberry32(1337);
export const pick = (arr) => arr[Math.floor(rng() * arr.length)];
export const int = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
export const initials = (name) => name.split(' ').map((n) => n[0]).join('').toUpperCase();
export const avatarUrl = (seed) => `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
export const paginate = (arr, page, perPage) => arr.slice((page - 1) * perPage, (page - 1) * perPage + perPage);

export const FIRST_NAMES = ['Faith','Brian','Grace','Kevin','Mercy','Dennis','Sharon','Peter','Ann','Collins','Joy','Victor','Lilian','Samuel','Diana','Felix','Purity','Eric','Winnie','Moses','Caroline','Kelvin','Esther','Dennis','Ruth','Alex','Sarah','John','Beatrice','Michael','Lucy','George','Nancy','Daniel','Agnes','Paul','Irene','Stephen','Mary','James'];
export const LAST_NAMES = ['Wanjiru','Otieno','Njoroge','Mwangi','Kamau','Achieng','Kiptoo','Wafula','Cherono','Odhiambo','Mutua','Wambui','Kimani','Chebet','Omondi','Njeri','Kariuki','Auma','Barasa','Nyambura','Rotich','Gitau','Wekesa','Adhiambo','Kilonzo'];
