export const getRoadmapPrompt = (topic) => {
    return `
Create a comprehensive learning roadmap for "${topic}". Return a JSON object with this exact structure:

{
  "title": "Learning ${topic}",
  "description": "Brief description of what the learner will achieve",
  "estimatedDuration": "X weeks/months",
  "difficulty": "Beginner/Intermediate/Advanced",
  "chapters": [
    {
      "id": 1,
      "title": "Chapter Title",
      "description": "What this chapter covers",
      "estimatedTime": "X hours",
      "subtopics": [
        {
          "id": 1,
          "title": "Subtopic Title",
          "description": "Brief description",
          "estimatedTime": "X minutes",
          "completed": false,
          "recommendedArticleSites": [
            "top-site1.org",
            "top-site2.com"
          ],
          "detailedExplanation": ""
        }
      ]
    }
  ]
}

CRITICAL REQUIREMENTS:
- Create 4-6 chapters maximum.
- Each chapter must have 3-5 subtopics.
- Progress from basic to advanced concepts.
- For EACH subtopic, populate "recommendedArticleSites" with 2-3 real domains like geeksforgeeks.org, developer.mozilla.org, react.dev.
- Do NOT include youtube.com in this list.
- Do NOT invent domain names.

Return ONLY the valid JSON object, with no other text.
`;
};

export const getTopicGuardPrompt = (topic) => {
    return `
You are a topic classifier for a programming education platform.
The topic must be related to programming, software engineering, computer science, data science, or IT.

Topic: "${topic}"

Is this topic valid for a programming learning platform?
Respond with only the single word "true" or "false".
`;
};

export const quizPrompt = (roadMap, chapterId, subtopicId) => {
    const chapters = roadMap.roadmapData?.chapters || [];

    if (subtopicId) {
        const chapter = chapters.find(ch => ch.id === chapterId);
        if (!chapter) throw new Error('Chapter not found');
        const subtopic = chapter.subtopics.find(st => st.id === subtopicId);
        if (!subtopic) throw new Error('Subtopic not found');

        return `
You are an expert quiz generator.
Generate a 5-question multiple-choice quiz for:
Title: "${subtopic.title}"
Description: "${subtopic.description}"

Each question must have:
- 4 MCQ options (a, b, c, d)
- correctAnswer field
- explanation field (3-4 lines)

Return ONLY a JSON array.
`;
    }

    const chapter = chapters.find(ch => ch.id === chapterId);
    if (!chapter) throw new Error('Chapter not found');

    return `
You are an expert educational quiz generator.
Generate a quiz covering the chapter and its subtopics.

Chapter Title: "${chapter.title}"
Chapter Description: "${chapter.description}"

Subtopics:
${chapter.subtopics.map((s, i) => `${i + 1}. ${s.title}: ${s.description}`).join('\n')}

Return ONLY JSON with:
{
  "chapterTitle": "...",
  "totalQuestions": <number>,
  "quiz": [...]
}
`;
};

export const getSubtopicSummaryPrompt = (subtopic, roadmapTitle, chapterTitle, personalization) => {
    return `You are an expert tutor. Generate a detailed summary for this subtopic.

**Context:**
* **Roadmap Title:** "${roadmapTitle}"
* **Chapter Title:** "${chapterTitle}"
* **Subtopic:** "${subtopic}"
* **Personalization:** "${personalization}"

**Instructions:**
1. Format the entire response in Markdown.
2. Use headings, subheadings, and bullet points.
3. Explain key concepts, definitions, and practical importance.
4. Do NOT include external links.
5. Do NOT write a conversational intro. Start directly with the summary.
6. Keep it under 1500 words.

Begin the summary for "${subtopic}" now.`;
};

export const getAnalysePrompt = (code) => {
    return `You are an expert at analyzing code. Analyze the time and space complexity.

Code:
${code}

Tasks:
1. If code has syntax errors, mention in "compilationError".
2. Analyze time and space complexity.
3. Suggest optimizations if possible.

Respond ONLY in this JSON format:
{
  "compilationError": <true | false>,
  "errorExplanation": "<explain if any>",
  "timeComplexity": "<Big O notation>",
  "timeExplanation": "<reasoning>",
  "spaceComplexity": "<Big O notation>",
  "spaceExplanation": "<reasoning>",
  "suggestions": "<optimizations or No optimizations possible>"
}`;
};

export const getTitlePrompt = (userMessage) => {
    return `You are a friendly AI assistant that answers technical and coding questions.

User message: "${userMessage}"

Rules:
- If it is a greeting (hi, hello, hey), respond politely. Title: "Greeting".
- If it is technical/programming, give a helpful answer with a concise title (max 5 words).
- If it is neither, use title "General Tech Query" and politely redirect.

Respond strictly in this JSON format (no extra text):
{
  "title": "<generated_title>",
  "response": "<ai_response>"
}`;
};

export const getResponsePrompt = (userMessage, context) => {
    return `You are a friendly AI assistant that primarily answers technical and coding questions.

User message: "${userMessage}"
Past conversation context: "${context}"

Rules:
- Casual greetings and small talk are allowed.
- Technical/programming questions get detailed responses.
- Non-technical questions get a polite redirect.
- Sound natural and conversational.
- Do NOT mention the context explicitly.
- Respond with only the final answer, no markdown formatting.`;
};