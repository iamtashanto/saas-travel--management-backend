import { AccessTokenPayload } from '../common/utils/jwt.util';

declare global {
  namespace Express {
    interface Request {
      auth?: AccessTokenPayload;
    }
  }
}
