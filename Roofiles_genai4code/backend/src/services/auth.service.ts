import { PrismaClient, User, UserRole } from '@prisma/client';
import { PasswordService } from '../utils/password';
import { JwtService } from '../utils/jwt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

export interface RegisterData {
    email: string;
    password: string;
    name?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface AuthResponse {
    user: {
        id: string;
        email: string;
        name: string | null;
        role: UserRole;
        avatar: string | null;
    };
    tokens: {
        accessToken: string;
        refreshToken: string;
    };
}

export class AuthService {
    /**
     * Register a new user with email and password
     */
    static async register(data: RegisterData): Promise<AuthResponse> {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Validate password
        const passwordValidation = PasswordService.validate(data.password);
        if (!passwordValidation.isValid) {
            throw new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`);
        }

        // Hash password
        const passwordHash = await PasswordService.hash(data.password);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash,
                role: UserRole.FREE,
            },
        });

        // Generate tokens
        const tokens = JwtService.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
            },
            tokens,
        };
    }

    /**
     * Login with email and password
     */
    static async login(data: LoginData): Promise<AuthResponse> {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user || !user.passwordHash) {
            throw new Error('Invalid email or password');
        }

        // Verify password
        const isValidPassword = await PasswordService.compare(
            data.password,
            user.passwordHash
        );

        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        const tokens = JwtService.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
            },
            tokens,
        };
    }

    /**
     * Login or register with Google OAuth
     */
    static async googleAuth(googleData: {
        googleId: string;
        email: string;
        name?: string;
        avatar?: string;
    }): Promise<AuthResponse> {
        // Try to find existing user by Google ID
        let user = await prisma.user.findFirst({
            where: { googleId: googleData.googleId },
        });

        if (!user) {
            // Try to find by email
            user = await prisma.user.findUnique({
                where: { email: googleData.email },
            });

            if (user) {
                // Link Google account to existing user
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        googleId: googleData.googleId,
                        name: user.name || googleData.name,
                        avatar: user.avatar || googleData.avatar,
                    },
                });
            } else {
                // Create new user
                user = await prisma.user.create({
                    data: {
                        email: googleData.email,
                        name: googleData.name,
                        avatar: googleData.avatar,
                        googleId: googleData.googleId,
                        role: UserRole.FREE,
                        isEmailVerified: true,
                    },
                });
            }
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens
        const tokens = JwtService.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
            },
            tokens,
        };
    }

    /**
     * Refresh access token
     */
    static async refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        // Verify refresh token
        const payload = JwtService.verifyRefreshToken(refreshToken);

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Generate new tokens
        const tokens = JwtService.generateTokens({
            userId: user.id,
            email: user.email,
            role: user.role,
        });

        return tokens;
    }

    /**
     * Get user profile
     */
    static async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                lastLoginAt: true,
                dailyMessageCount: true,
                totalMessages: true,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    }

    /**
     * Update user profile
     */
    static async updateProfile(
        userId: string,
        data: {
            name?: string;
            avatar?: string;
        }
    ) {
        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                avatar: true,
                createdAt: true,
                lastLoginAt: true,
            },
        });

        return user;
    }

    /**
     * Change password
     */
    static async changePassword(
        userId: string,
        data: {
            currentPassword: string;
            newPassword: string;
        }
    ) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.passwordHash) {
            throw new Error('User not found or password not set');
        }

        // Verify current password
        const isValidPassword = await PasswordService.compare(
            data.currentPassword,
            user.passwordHash
        );

        if (!isValidPassword) {
            throw new Error('Current password is incorrect');
        }

        // Validate new password
        const passwordValidation = PasswordService.validate(data.newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(`Invalid password: ${passwordValidation.errors.join(', ')}`);
        }

        // Hash new password
        const newPasswordHash = await PasswordService.hash(data.newPassword);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash: newPasswordHash },
        });

        return { success: true };
    }

    /**
     * Reset daily message count for all users
     */
    static async resetDailyMessageCounts() {
        const result = await prisma.user.updateMany({
            where: {
                lastMessageReset: {
                    lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
                },
            },
            data: {
                dailyMessageCount: 0,
                lastMessageReset: new Date(),
            },
        });

        return result;
    }

    /**
     * Check if user can send message (rate limiting)
     */
    static async canSendMessage(userId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return false;
        }

        // Admin has no limits
        if (user.role === UserRole.ADMIN) {
            return true;
        }

        // Premium users have higher limits
        const dailyLimit = user.role === UserRole.PREMIUM ? 1000 : 50;

        // Check if we need to reset the daily count
        const now = new Date();
        const lastReset = user.lastMessageReset;
        const hoursSinceReset = (now.getTime() - lastReset.getTime()) / (1000 * 60 * 60);

        if (hoursSinceReset >= 24) {
            // Reset the count
            await prisma.user.update({
                where: { id: userId },
                data: {
                    dailyMessageCount: 0,
                    lastMessageReset: now,
                },
            });
            return true;
        }

        return user.dailyMessageCount < dailyLimit;
    }

    /**
     * Increment user's message count
     */
    static async incrementMessageCount(userId: string) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                dailyMessageCount: { increment: 1 },
                totalMessages: { increment: 1 },
            },
        });
    }
}