import config from '../../config/index.ts';
import express, { type Router } from 'express';
import authRoute from './auth.route.ts';
import jobRoute from './job.route.ts';
import tileRoute from './tile.route.ts';
import nearmapRoute from './nearmap.route.ts';
import quoteRoute from './quote.route.ts';
import deliveryRoute from './delivery.route.ts';

const router: Router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/jobs',
    route: jobRoute,
  },
  {
    path: '/tiles',
    route: tileRoute,
  },
  {
    path: '/nearmap',
    route: nearmapRoute,
  },

  {
    path: '/quotes',
    route: quoteRoute,
  },
  {
    path: '/deliveries',
    route: deliveryRoute,
  },
];

const devRoutes: { path: string; route: Router }[] = [];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

if (config.env === 'development') {
  devRoutes.forEach((route: { path: string; route: express.Router }) => {
    router.use(route.path, route.route);
  });
}

export default router;
