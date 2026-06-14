import axios from 'axios';

const SERPER_API_KEY = process.env.SERPER_API_KEY;
const SERPER_URL = 'https://google.serper.dev/search';

const getArticleLinks = async (mainTopic, subtopic) => {
    const query = subtopic.title;
    const sites = subtopic.recommendedArticleSites || [];
    const siteFilter = sites.map(site => `site:${site}`).join(' OR ');
    const fullQuery = siteFilter ? `${query} ${siteFilter}` : query;

    try {
        const { data } = await axios.post(
            SERPER_URL,
            { q: fullQuery, num: 10 },
            { headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' }, timeout: 8000 }
        );

        const siteCount = {};
        const filteredLinks = [];
        for (const r of data.organic || []) {
            try {
                const domain = new URL(r.link).hostname.replace('www.', '');
                siteCount[domain] = (siteCount[domain] || 0) + 1;
                if (siteCount[domain] <= 3) filteredLinks.push(r.link);
            } catch { continue; }
        }
        return filteredLinks;
    } catch (error) {
        console.error('Serper article error:', error.message);
        return [];
    }
};

const getVideoLinks = async (mainTopic, subtopic) => {
    const query = `${subtopic.title} tutorial site:youtube.com`;
    try {
        const { data } = await axios.post(
            SERPER_URL,
            { q: query, num: 5 },
            { headers: { 'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json' }, timeout: 8000 }
        );
        return (data.organic || []).map(r => r.link);
    } catch (error) {
        console.error('Serper video error:', error.message);
        return [];
    }
};

export const getArticles = async (roadmapData) => {
    const mainTopic = roadmapData.title;
    const promises = [];
    for (const chapter of roadmapData.chapters) {
        for (const subtopic of chapter.subtopics) {
            await new Promise(resolve => setTimeout(resolve, 500));
            promises.push(
                getArticleLinks(mainTopic, subtopic).then(links => ({
                    chapterId: chapter.id, subtopicId: subtopic.id, articles: links,
                }))
            );
        }
    }
    return Promise.all(promises);
};

export const getVideos = async (roadmapData) => {
    const mainTopic = roadmapData.title;
    const promises = [];
    for (const chapter of roadmapData.chapters) {
        for (const subtopic of chapter.subtopics) {
            await new Promise(resolve => setTimeout(resolve, 500));
            promises.push(
                getVideoLinks(mainTopic, subtopic).then(links => ({
                    chapterId: chapter.id, subtopicId: subtopic.id, videos: links,
                }))
            );
        }
    }
    return Promise.all(promises);
};