import mongoose from 'mongoose';
import Job from '../models/Job.js';
import moment from 'moment';

export const createJobController = async (req, res, next) => {
  const { company, position } = req.body;
  if (!company || !position) {
    return next('Please provide all fields.');
  }

  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(201).json({ job });
};

export const getAlljobsController = async (req, res, next) => {
  const { status, workType, search, sort } = req.query;
  //conditons for searching filters
  const queryObject = {
    createdBy: req.user.userId,
  };
  //logic filters
  if (status && status !== 'all') {
    queryObject.status = status;
  }
  if (workType && workType !== 'all') {
    queryObject.workType = workType;
  }
  if (search) {
    queryObject.position = { $regex: search, $options: 'i' };
  }

  let queryResult = Job.find(queryObject);

  //sorting
  if (sort === 'latest') {
    queryResult = queryResult.sort('-createdAt');
  }
  if (sort === 'oldest') {
    queryResult = queryResult.sort('createdAt');
  }
  if (sort === 'a-z') {
    queryResult = queryResult.sort('position');
  }
  if (sort === 'z-a') {
    queryResult = queryResult.sort('-position');
  }

  //pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  queryResult = queryResult.skip(skip).limit(limit);
  //jobs count
  const totalJobs = await Job.countDocuments(queryResult);
  const numOfPage = Math.ceil(totalJobs / limit);

  const jobs = await queryResult;

  //let jobs = await Job.find(queryObject);

  //const jobs = await Job.find({ createdBy: req.user.userId });
  res.status(200).json({
    totalJobs,
    jobs,
    numOfPage,
  });
};

export const updatejobController = async (req, res, next) => {
  const { id } = req.params;
  const { company, position } = req.body;
  //validation
  if (!company || !position) {
    return next('Please provide all fields');
  }
  //find job
  const job = await Job.findOne({ _id: id });
  //validation
  if (!job) {
    return next(`No jobs found this id ${id}`);
  }
  console.log(req.user.userId);
  console.log(job.createdBy);
  if (!req.user.userId.toString() === job.createdBy.toString()) {
    return next('your not authorized to update this job');
  }
  const updatedJob = await Job.findOneAndUpdate({ _id: id }, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ updatedJob });
};

export const deleteJobController = async (req, res, next) => {
  const { id } = req.params;
  //find job
  const job = await Job.findOne({ _id: id });

  //validation
  if (!job) {
    return next(`No job found with this is id ${id}`);
  }

  if (!req.user.userId === job.createdBy.toString()) {
    return next('Your are not authrized to delete this job.');
  }
  await job.deleteOne();
  res.status(200).json({ message: 'Success, job deleted.' });
};

//----------------------Jobs Stats & Filters------------------------
export const jobStatsController = async (req, res) => {
  const stats = await Job.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  //default stats
  const defaultStats = {
    pending: stats.pending || 0,
    reject: stats.reject || 0,
    interview: stats.interview || 0,
  };

  //monthly yearly stats
  let monthlyApplication = await Job.aggregate([
    {
      $match: {
        createdBy: new mongoose.Types.ObjectId(req.user.userId),
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  monthlyApplication = monthlyApplication
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse();

  res.status(200).json({
    totaljobs: stats.length,
    defaultStats,
    monthlyApplication,
  });
};
