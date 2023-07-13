import { RequestHandler } from 'express';
import { ErrorResponse, secret } from '../app';
import * as jose from 'jose';

export const isAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.get('Authorization');

    if (!authHeader) {
      const error: ErrorResponse = {
        message: 'Unauthenticated',
        name: 'Unauthenticated',
        data: { message: 'Unauthenticated', statusCode: 401 },
        status: 401,
      };

      throw error;
    }

    if (!authHeader.includes('Bearer')) {
      const error: ErrorResponse = {
        message: 'Unauthenticated',
        name: 'Unauthenticated',
        data: { message: 'Unauthenticated', statusCode: 401 },
        status: 401,
      };

      throw error;
    }

    const access_token = authHeader.split(' ')[1];

    let decodedToken;

    try {
      const { payload } = await jose.jwtDecrypt(access_token, secret);
      decodedToken = payload;
    } catch (error) {
      const { message, name } = error as Error;
      const thrownError: ErrorResponse = {
        message: message,
        name: name,
        data: { message: 'Unauthenticated', statusCode: 401 },
        status: 401,
      };
      throw thrownError;
    }

    req.userId = decodedToken.userId as any;
    next();
  } catch (error) {
    
    next(error);
  }
};
