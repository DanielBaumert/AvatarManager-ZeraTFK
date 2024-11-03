export function* range(n: number, m: number) {
    for (let i = n; i <= m; i++) {
        yield i;
    }
}

export function chunk<T>(src: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < src.length; i += chunkSize) {
        chunks.push(src.slice(i, i + chunkSize));
    }

    return chunks;
}


export const toDiconary = <T, E>(src: T[], filter: (arg: T) => E): Map<E, T[]> => {
    const dirc = new Map<E, T[]>();

    for (const element of src) {
        const e: E = filter(element);
        if (dirc.has(e)) {
            dirc.get(e)!.push(element);
            continue;
        }

        dirc.set(e, [element]);
    }

    return dirc;
}
