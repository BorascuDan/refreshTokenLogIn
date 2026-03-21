import { SignJWT, jwtVerify, importPKCS8, importSPKI, errors } from 'jose';
import { AppError } from './errorHandler.mjs';

const ALG = 'ES256';
const ISSUER = 'magic-backend';
const AUDIENCE = 'magic-app';

export async function signToken(userDetails, type) {
  let privateKey;
  try {
    privateKey = await importPKCS8(process.env.JWT_PRIVATE_KEY, ALG);
  } catch (err) {
    console.error('Failed to import private key:', err);
    throw new Error('Token signing failed');
  }

  const duration = type === 'refresh' ? '7d' : '1h';

  return new SignJWT({
    ...userDetails,
    type 
  })
    .setProtectedHeader({ alg: ALG })
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(duration)
    .sign(privateKey);
}

export async function verifyToken(token) {
  const publicKey = await importSPKI(process.env.JWT_PUBLIC_KEY, ALG);

  try {
    const { payload } = await jwtVerify(token, publicKey, {
      algorithms: [ALG],
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return payload;
  } catch (error) {
    if (error instanceof errors.JWTExpired) {
      const err = new AppError('Token has expired', 401, 'JWT_EXPIRED');
      err.payload = error.payload;
      throw err;
    }
    throw new AppError(error.message, 401, 'JWT_MALFORMED');
  }
}