import db from './database.mjs'
import { AppError } from './errorHandler.mjs';
import argon2 from 'argon2';
import { signToken, verifyToken } from './loginUtilFunctions.mjs';

export const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;
  if ( !username || !email || !password ) return next(new AppError('Missing mandatory fiealds, can not create user', 400, 'BODY_MISS'));

  try {
    const existing = await db('users')
      .where('email', email)    
      .first('id');    
    if ( existing ) throw new AppError('Email alredy has an account', 409, 'EMAIL_EXISTS');

    const hashedPassword = await argon2.hash(password);
    const [ id ] = await db('users')
      .insert({
        name: username,
        email,
        password: hashedPassword
      })
    if ( !id ) throw new AppError('Failed to create user', 500, 'DB_FAILURE');

    req.success = id;
    next(); 
  } catch (error) {
    next(error);
  }
}

export const loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  if ( !email || !password ) return next(new AppError('Missing mandatory fiealds, can not create user', 400, 'BODY_MISS'));
  
  try {
    const user = await db('users')
      .where('email', email)
      .first();
    if ( !user ) throw new AppError('Email dose not have an account', 400, 'EMAIL_NTEXISTS');
    const { id, name, password: passwordHash } = user;

    const checkPassword = await argon2.verify(passwordHash, password);
    if ( !checkPassword ) throw new AppError('The providen password is wrong', 400, 'WRONG_PASSWORD');

    const accesToken = await signToken({ id }, 'acces');
    const refreshToken = await signToken({ id }, 'refresh');
    
    const [ tokenId ] = await db('tokens')
      .insert({
        user_id: id,
        token: refreshToken
      })
    if ( !tokenId ) throw new AppError('Could not save the refresh token', 500, 'DB_FAILURE');

    res.setHeader('x-access-token', accesToken);
    res.setHeader('x-refresh-token', refreshToken);

    req.login = { name };
    next();
  } catch (error) {
    next(error);
  }
}

export const authenticateToken = async (req, res, next) => {
  const accessToken = req?.headers["authorization"]?.split(" ")[1];
  if (!accessToken) return next(new AppError('Missing access token', 401, 'AUTH_MISSING'));

  try {
    const { id } = await verifyToken(accessToken);

    const user = await db("users")
      .where({ id })
      .first('id', 'name', 'email');
    if (!user) throw new AppError('User not found', 404, 'USER_NOT_FOUND');

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const generateNewAccesToken = async (req, res, next) => {
  const refreshToken = req?.headers["authorization"]?.split(" ")[1];
  if (!refreshToken) return next(new AppError('Missing refresh token', 401, 'AUTH_MISSING'));

  try {
    const { id } = await verifyToken(refreshToken);

    const user = await db("tokens")
      .where('token', refreshToken)
      .andWhere('expired', false)
      .first('user_id');
    if (!user) throw new AppError('Refresh token not found', 404, 'TOKEN_NOT_FOUND');
    if (user.user_id != id) throw new AppError('Not the users token', 401, 'TOKEN_NOT_FOUND');

    const accesToken = await signToken({ id }, 'acces');
    res.setHeader('x-access-token', accesToken);
    next();
  } catch (error) {
    if (error.code === 'JWT_EXPIRED') {
      await db('tokens').where({ token: refreshToken }).update({ expired: true });
    }
    next(error);
  }
}