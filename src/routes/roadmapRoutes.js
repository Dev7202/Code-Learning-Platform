import express from 'express';
import {
    generateRoadmap, getUserRoadmaps, getRoadmapById,
    deleteRoadmap, togglePinRoadmap, searchRoadmaps,
} from '../controllers/Roadmap.js';
import userAuth from '../middlewares/userAuth.js';
import { validate } from '../middlewares/validate.js';
import { generationSchema } from '../validators/roadmapValidators.js';

const router = express.Router();

router.post('/generate',          validate(generationSchema), userAuth, generateRoadmap);
router.get ('/get-roadmaps',      userAuth, getUserRoadmaps);
router.post('/get-roadmap-by-id', userAuth, getRoadmapById);
router.post('/delete-roadmap',    userAuth, deleteRoadmap);
router.post('/toggle-pin',        userAuth, togglePinRoadmap);
router.get ('/search',            userAuth, searchRoadmaps);

export default router;