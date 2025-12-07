import { Request, Response, NextFunction } from 'express';
import { JwtService, JwtPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

/**
 * Authentication middleware - verifies JWT token
 */
export const authenticateToken = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Access token required',
            });
        }

        const user = JwtService.verifyAccessToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Invalid or expired token',
        });
    }
};

/**
 * Optional authentication middleware - continues if no token, but adds user if valid token
 */
export const optionalAuth = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const user = JwtService.verifyAccessToken(token);
            req.user = user;
        }
    } catch (error) {
        // Ignore invalid tokens for optional auth
    }
    next();
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: 'Forbidden',
                message: `Insufficient permissions. Required roles: ${roles.join(', ')}`,
            });
        }

        next();
    };
};

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRole(['ADMIN']);

/**
 * Premium or Admin middleware
 */
export const requirePremiumOrAdmin = requireRole(['PREMIUM', 'ADMIN']);

/**
 * API Key authentication middleware
 */
export const authenticateApiKey = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const apiKey = req.headers['x-api-key'] as string;

        if (!apiKey) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'API key required',
            });
        }

        // Hash the provided API key to compare with stored hash
        const crypto = await import('crypto');
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();

        const apiKeyRecord = await prisma.apiKey.findFirst({
            where: {
                keyHash,
                isActive: true,
            },
            include: {
                user: true,
            },
        });

        if (!apiKeyRecord) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'Invalid API key',
            });
        }

        // Update usage
        await prisma.apiKey.update({
            where: { id: apiKeyRecord.id },
            data: {
                usageCount: { increment: 1 },
                lastUsedAt: new Date(),
            },
        });

        // Add user to request
        req.user = {
            userId: apiKeyRecord.user.id,
            email: apiKeyRecord.user.email,
            role: apiKeyRecord.user.role,
        };

        next();
    } catch (error) {
        console.error('API Key authentication error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to authenticate API key',
        });
    }
};