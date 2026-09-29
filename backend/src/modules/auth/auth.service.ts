import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { HttpError } from '../../common/httpError';
import { AppDataSource } from '../../config/database';
import { env, HR_SEED } from '../../config/env';
import { User } from '../../entities/User';

export async function login(email: string, password: string) {
  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required');
  }

  const user = await AppDataSource.getRepository(User).findOne({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new HttpError(401, 'Invalid email or password');
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: '8h' },
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  };
}

export async function ensureHrManager() {
  const repo = AppDataSource.getRepository(User);
  const existing = await repo.findOne({ where: { email: HR_SEED.email } });
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(HR_SEED.password, 10);
  return repo.save(
    repo.create({
      email: HR_SEED.email,
      password_hash: passwordHash,
      role: HR_SEED.role,
    }),
  );
}
