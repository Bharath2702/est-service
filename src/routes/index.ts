
import bodyParser from 'body-parser';
import user from './user';
import { Router } from 'express';

const jsonParser = bodyParser.json({ limit: "50mb" })
const router = Router();

router.use('/user', jsonParser, user);

router.get('/userMaster', (req: any, res: any, next: any) => {
    try {
        return res.status(200).send({
            success: true,
            message: 'Welcome to the User Service!',
        })
    } catch (error: any) {
        return res.status(500).send({
            success: false,
            message: 'Something went wrong in User master'
        });
    }
});

// after `const router = Router();`
router.get('/health', (req: any, res: any) => {
  return res.status(200).json({ success: true, status: 'OK' });
});



export default router;