import { snakeToCamel } from '@/utils/caseConversion';

const raw = await fetch(...);
const json = await raw.json();
const game = snakeToCamel(json) as Game;

export function snakeToCamel<T>(obj: any): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(snakeToCamel) as any;
    }

    const camelObj: any = {};
    Object.keys(obj).forEach(key => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        camelObj[camelKey] = snakeToCamel(obj[key]);
    });

    return camelObj as T;
}

export function camelToSnake<T>(obj: any): T {
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(camelToSnake) as any;
    }

    const snakeObj: any = {};
    Object.keys(obj).forEach(key => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        snakeObj[snakeKey] = camelToSnake(obj[key]);
    });

    return snakeObj as T;
}
