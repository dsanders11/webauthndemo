import express, { Request, Response } from 'express';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { UserInfo } from '../public/scripts/common';

initializeApp();

const auth = getAuth();
const router = express.Router();

router.post('/userInfo', async (req: Request, res: Response) => {
  if (req.session.user_id) {
    const user = {
      user_id: req.session.user_id,
      name: req.session.name,
      displayName: req.session.displayName,
      picture: req.session.picture
    } as UserInfo;
    res.json(user);
  } else {
    res.status(401).send('Unauthorized');
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  const { id_token } = req.body;

  try {
    const result = await auth.verifyIdToken(<string>id_token, true);
    if (result) {
      console.log(result);
      req.session.user_id = result.user_id;
      req.session.name = result.email;
      req.session.displayName = result.name;
      req.session.picture = result.picture || `${res.locals.origin}/user.svg`;
      res.json({
        user_id: req.session.user_id,
        name: req.session.name,
        displayName: req.session.displayName,
        picture: req.session.picture
      } as UserInfo);
    } else {
      throw 'Verification failed.';
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({
      status: false,
      message: 'Verification failed.'
    });
    return;
  }
});

router.post('/signout', (req: Request, res: Response) => {
  req.session.destroy(error => {
    if (error) {
      res.status(500).send(error);
    } else {
      res.json({
        status: true,
        message: 'Successfully signed out.'
      });
    }
  });
});

export { router as auth };
