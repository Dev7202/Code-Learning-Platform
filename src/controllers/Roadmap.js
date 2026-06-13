import RoadmapModel from '../models/RoadmapModel.js';
import UserModel from '../models/UserModel.js';
import { generateWithGemini } from '../utils/generate.js';
import { getRoadmapPrompt, getTopicGuardPrompt } from '../utils/prompt.js';

// ─── Generate Roadmap ─────────────────────────────────────────
export const generateRoadmap = async (req, res) => {
    try {
        const { userDescription, userLevel } = req.validatedData;
        const userId = req.userId;

        // Topic guard
        const guardResult = await generateWithGemini(getTopicGuardPrompt(userDescription));
        if (guardResult.trim().toLowerCase() !== 'true') {
            return res.status(400).json({ success: false, message: 'Topic must be related to programming or technology.' });
        }

        const prompt = `${getRoadmapPrompt(userDescription)}\n\nTailor this roadmap for a ${userLevel} level learner.`;
        const responseText = await generateWithGemini(prompt);

        let roadmapData;
        try {
            const cleaned = responseText.trim().replace(/^```json\s*|\s*```$/g, '').trim();
            roadmapData = JSON.parse(cleaned);
        } catch {
            return res.status(500).json({ success: false, message: 'Failed to parse AI response.' });
        }

        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const newRoadmap = await RoadmapModel.create({
            email: user.email,
            roadmapData,
            roadmapPhoto: Math.floor(Math.random() * 5) + 1,
        });

        return res.status(200).json({ success: true, data: newRoadmap, message: 'Roadmap generated successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get All Roadmaps ─────────────────────────────────────────
export const getUserRoadmaps = async (req, res) => {
    try {
        const roadmaps = await RoadmapModel.find({ email: req.email }).sort({ isPinned: -1, createdAt: -1 });
        return res.status(200).json({ success: true, data: roadmaps });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Get Roadmap By ID ────────────────────────────────────────
export const getRoadmapById = async (req, res) => {
    try {
        const roadmap = await RoadmapModel.findById(req.body.roadmapId);
        if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
        return res.status(200).json({ success: true, data: roadmap });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Delete Roadmap ───────────────────────────────────────────
export const deleteRoadmap = async (req, res) => {
    try {
        const { roadmapId } = req.body;
        const roadmap = await RoadmapModel.findById(roadmapId);
        if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
        await RoadmapModel.deleteOne({ _id: roadmapId });
        
        return res.status(200).json({ success: true, message: 'Roadmap deleted successfully' });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Toggle Pin ───────────────────────────────────────────────
export const togglePinRoadmap = async (req, res) => {
    try {
        const roadmap = await RoadmapModel.findOne({ _id: req.body.roadmapId, email: req.email });
        if (!roadmap) return res.status(404).json({ success: false, message: 'Roadmap not found' });
        roadmap.isPinned = !roadmap.isPinned;
        await roadmap.save();
        return res.status(200).json({ success: true, data: roadmap, message: `Roadmap ${roadmap.isPinned ? 'pinned' : 'unpinned'}` });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ─── Search Roadmaps ──────────────────────────────────────────
export const searchRoadmaps = async (req, res) => {
    try {
        const q = (req.query.q || '').trim();
        if (!q) return res.status(400).json({ success: false, message: 'Query cannot be empty' });

        const roadmaps = await RoadmapModel.find({ email: req.email }).select({ roadmapData: 1 }).lean();
        const term = q.toLowerCase();
        const results = { roadmaps: [], chapters: [], subtopics: [] };

        for (const r of roadmaps) {
            const rm = r.roadmapData || {};
            const roadmapId = r._id;
            const roadmapTitle = rm.title || '';

            if (roadmapTitle.toLowerCase().includes(term))
                results.roadmaps.push({ roadmapId, title: roadmapTitle });

            for (const ch of rm.chapters || []) {
                if ((ch.title || '').toLowerCase().includes(term))
                    results.chapters.push({ roadmapId, title: ch.title, chapterId: ch.id, roadmapTitle });

                for (const st of ch.subtopics || []) {
                    if ((st.title || '').toLowerCase().includes(term))
                        results.subtopics.push({ roadmapId, title: st.title, chapterId: ch.id, subtopicId: st.id, roadmapTitle });
                }
            }
        }

        return res.status(200).json({ success: true, data: results });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};