export function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
    }
    return hash;
}

export function intToRGB(hash: number): string {
    const r = (hash >> 16) & 0xFF;
    const g = (hash >> 8) & 0xFF;
    const b = hash & 0xFF;
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function generateColorFromEmail(email: string | null): string {
    if (email) {
        const hash = hashString(email);
        return intToRGB(hash);
    } else {
        const hash = hashString('user@example');
        return intToRGB(hash);
    }

}
