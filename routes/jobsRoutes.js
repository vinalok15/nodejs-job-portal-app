import express from 'express';
import userAuth from '../middlewares/authMiddleware.js';
import {
  createJobController,
  deleteJobController,
  getAlljobsController,
  jobStatsController,
  updatejobController,
} from '../controllers/jobsController.js';

const router = express.Router();

//routes

//Create Job
router.post('/create-job', userAuth, createJobController);
router.get('/get-jobs', userAuth, getAlljobsController);
router.patch('/update-job/:id', userAuth, updatejobController);
router.delete('/delete-job/:id', userAuth, deleteJobController);
router.get('/job-stats', userAuth, jobStatsController);

export default router;
