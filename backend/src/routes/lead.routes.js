import express from 'express';
import { leadController } from '../controllers/lead.controller.js';

const router = express.Router();

router.post('/report', leadController.submitReportRequest);
router.get('/', leadController.getLeads);

export default router;
