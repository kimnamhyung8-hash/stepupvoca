import fs from 'fs';

const activeKey = Buffer.from("QUl6YVN5Q0JVRm13b3JQMmZ0amxEdklFb0o5YWs0b1lYamVCbzBj", 'base64').toString('ascii');
const LIGHTWEIGHT_MODEL = "gemini-3.1-flash-lite-preview";

const convLogs = '[{"role":"user","text":"Hello, I want to learn English.","timestamp":"10:00","translation":"안녕하세요, 영어를 배우고 싶습니다."}]';
const activeScenario = { subScSelected: { title_ko: "초보자를 위한 인사말" } };

const promptText = `
                당신은 냉철하고 분석적인 1타 영어 강사입니다. 
                아래 유저의 롤플레이 대화 기록을 분석하여 학습자가 즉각적으로 개선할 수 있는 핵심 리포트를 JSON 형식으로만 응답하세요.

                [분석 항목 가이드]
                1. userLevelAssessed: 대화 내용을 바탕으로 판단한 CEFR 레벨 (예: A1, A2, B1, B2, C1, C2)
                2. strengths: 이번 세션에서 잘한 점 1가지 (한국어로 상세히)
                3. weaknesses: 보완해야 할 점 1가지 (한국어로 상세히)
                4. overallFeedback: 총평 및 다음 학습을 위한 조언 (한국어로 상세히)
                5. selectedReviewIndices: 유저가 틀렸거나, 아쉬웠던 발화 패턴을 보여준 유저 메시지 인덱스 (최대 4개) [0, 1...]

                오로지 아래 JSON 형식의 응답만 해야 하며 다른 말머리나 인사는 절대 추가하지 마세요. (마크다운 포맷도 생략하세요.)
                {
                    "userLevelAssessed": "string",
                    "strengths": "string",
                    "weaknesses": "string",
                    "overallFeedback": "string",
                    "selectedReviewIndices": [number, number]
                }

                # Input Data
                - Level: A1
                - Conversation Logs: ${convLogs}
                - Scenario: ${activeScenario?.subScSelected?.title_ko || "English Chat"}
            `;

const fetchConfig = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
};

async function test() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${LIGHTWEIGHT_MODEL}:generateContent?key=${activeKey}`;
        const res = await fetch(url, fetchConfig);
        const text = await res.text();
        const data = JSON.parse(text);
        
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log("----- RAW -----");
        console.log(rawText);
        console.log("----- CLEANED & PARSED -----");
        try {
            const cleanJson = rawText.replace(new RegExp('```json', 'gi'), '').replace(new RegExp('```', 'gi'), '').trim() || rawText.trim();
            const parsedReport = JSON.parse(cleanJson);
            console.log(parsedReport);
            console.log("PARSE SUCCESS!");
        } catch(e) {
            console.error("JSON PARSE ERROR! -->", e.message);
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
