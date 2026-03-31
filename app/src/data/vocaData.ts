import vocaDBCore from './vocaDB_core.json';
import locJa from './vocaDB_ja.json';
import locZh from './vocaDB_zh.json';
import locVi from './vocaDB_vi.json';
import locTw from './vocaDB_tw.json';

let vocaDBJson: any[] = [];

try {
    // Map shortened keys back to original structure for compatibility
    vocaDBJson = (vocaDBCore as any[]).map(group => ({
        level: group.level,
        words: group.words.map((w: any) => ({
            id: w.id,
            level: group.level,
            word: w.word,
            meaning: w.meaning,
            answer_index: w.answer_index,
            options: w.options,
            options_loc: {
                ko: w.options,
                ja: (locJa as any)[w.id] || w.options,
                zh: (locZh as any)[w.id] || w.options,
                vi: (locVi as any)[w.id] || w.options,
                tw: (locTw as any)[w.id] || w.options
            },
            meaning_loc: {
                ko: w.meaning,
                ja: ((locJa as any)[w.id] && (locJa as any)[w.id][w.answer_index]) || w.meaning,
                zh: ((locZh as any)[w.id] && (locZh as any)[w.id][w.answer_index]) || w.meaning,
                vi: ((locVi as any)[w.id] && (locVi as any)[w.id][w.answer_index]) || w.meaning,
                tw: ((locTw as any)[w.id] && (locTw as any)[w.id][w.answer_index]) || w.meaning
            }
        }))
    }));
} catch (e) {
    console.error("vocaDB load error", e);
}

export { vocaDBJson };
