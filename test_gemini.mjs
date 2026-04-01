import fs from 'fs';

const fetchConfig = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        contents: [{ parts: [{ text: "Hello!" }] }]
    })
};

const activeKey = Buffer.from("QUl6YVN5Q0JVRm13b3JQMmZ0amxEdklFb0o5YWs0b1lYamVCbzBj", 'base64').toString('ascii');
const modelsToTest = [
    "gemini-3.1-pro-lite",
    "gemini-3.1-pro-lite-preview"
];

let out = [];
async function test() {
    for (const model of modelsToTest) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
            const res = await fetch(url, fetchConfig);
            const text = await res.text();
            out.push(`[${model}] Status: ${res.status} | ${text.substring(0, 100)}`);
            console.log(`[${model}] Status: ${res.status}`);
        } catch (e) {
            out.push(`[${model}] Error: ${e.message}`);
            console.error(`[${model}] Fetch err: ${e.message}`);
        }
    }
    fs.writeFileSync('test_gemini_out_lite.txt', out.join('\n'));
}
test();
