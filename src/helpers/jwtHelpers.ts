import { secret } from '..';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../consts/constants';
import { BlackListedToken } from '../models/blacklistedToken';

import * as jose from 'jose';

interface userJwtSignData {
  userId: string;
  email: string;
  fullName: string;
  username: string;
  countryCode: string;
  phoneNumber: number;
}

export const generateAccessToken = async (jwtSignData: userJwtSignData) => {
  return await new jose.EncryptJWT({
    ...jwtSignData,
    grant_type: ACCESS_TOKEN,
  } as jose.JWTPayload)
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .setIssuedAt()
    .setIssuer('urn:instaclone:issuer')
    .setAudience('urn:instaclone:audience')
    .setExpirationTime('5m')
    .encrypt(secret);
};

export const generateRefreshToken = async (jwtSignData: userJwtSignData) => {
  return await new jose.EncryptJWT({
    ...jwtSignData,
    grant_type: REFRESH_TOKEN,
  } as jose.JWTPayload)
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .setIssuedAt()
    .setIssuer('urn:instaclone:issuer')
    .setAudience('urn:instaclone:audience')
    .setExpirationTime('15d')
    .encrypt(secret);
};

export const blacklistRefresh_Token = async (refresh_token: string) => {
  const blackListedToken = await new BlackListedToken({
    blackListedToken: refresh_token,
  });

  await blackListedToken.save();
};
