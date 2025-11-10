import express from 'express';
const router = express.Router();

/* GET users listing. */
const userRouter = router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

export default userRouter;
