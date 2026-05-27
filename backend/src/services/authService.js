import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { adminRepo } from '../repositories/adminRepo.js';
import { env } from '../config/env.js';
import { badRequest, unauthorized } from '../utils/httpError.js';

export const authService = {
    async login(username, password) {
        if (!username || !password) throw badRequest('Faltan credenciales');

        const admin = await adminRepo.findByUsername(username);
        if (!admin) throw unauthorized('Credenciales inválidas');

        const ok = await bcrypt.compare(password, admin.password_hash);
        if (!ok) throw unauthorized('Credenciales inválidas');

        const token = jwt.sign(
            { sub: admin.id, username: admin.username },
            env.jwt.secret,
            { expiresIn: env.jwt.expiresIn }
        );

        return { token, user: { username: admin.username } };
    },
};
