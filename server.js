// API DOcumenATion
import swaggerUi from 'swagger-ui-express';
import swaggerDoc from 'swagger-jsdoc';

//packages imports
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import 'express-async-errors';

//security packages
import helmet from 'helmet';
import xss from 'xss-clean';
import mongoSanitize from 'express-mongo-sanitize';

//files import
import connectDB from './config/db.js';
//routes import
import aurtRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import jobsRoutes from './routes/jobsRoutes.js';

import { errorMiddleware } from './middlewares/errorMiddleware.js';

//Dot ENV Config
dotenv.config();

// Swagger api config
// swagger api options
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Job Portal Application',
      description: 'Node Expressjs Job Portal Application',
    },
    servers: [
      {
        url: 'http://localhost:8080',
        //url: 'https://nodejs-job-portal-app.onrender.com',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const spec = swaggerDoc(options);

//Mongodb connection
connectDB();

//rest object
const app = express();

//Middlewares
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

//routes
app.use('/api/v1/auth', aurtRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/job', jobsRoutes);

//homeroute root
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(spec));

//validation Middleware
app.use(errorMiddleware);

//port
const PORT = process.env.PORT || 8080;

//Listen
app.listen(PORT || 8080, () => {
  console.log(
    `Node server running in ${process.env.DEV_MODE} Mode on port no ${PORT}`
  );
});
