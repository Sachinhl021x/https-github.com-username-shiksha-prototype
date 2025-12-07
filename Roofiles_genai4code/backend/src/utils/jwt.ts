import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../config/environment';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface RefreshTokenPayload {
    userId: string;
    tokenId: string;
    iat?: number;
    exp?: number;
}

export class JwtService {
    /**
     * Generate access token
     */
    static generateAccessToken(payload: JwtPayload): string {
        const options: SignOptions = {
            expiresIn: ENV.JWT_EXPIRES_IN as any,
        };
        return jwt.sign(payload, ENV.JWT_SECRET, options);
    }

    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload: RefreshTokenPayload): string {
        const options: SignOptions = {
            expiresIn: ENV.JWT_REFRESH_EXPIRES_IN as any,
        };
        return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, options);
    }

    /**
     * Verify access token
     */
    static verifyAccessToken(token: string): JwtPayload {
        try {
            return jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
        } catch (error) {
            throw new Error('Invalid access token');
        }
    }

    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token: string): RefreshTokenPayload {
        try {
            return jwt.verify(token, ENV.JWT_REFRESH_SECRET) as RefreshTokenPayload;
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    /**
     * Generate both tokens for a user
     */
    static generateTokens(user: {
        userId: string;
        email: string;
        role: string;
    }): {
        accessToken: string;
        refreshToken: string;
        tokenId: string;
    } {
        const tokenId = this.generateTokenId();

        const accessToken = this.generateAccessToken({
            userId: user.userId,
            email: user.email,
            role: user.role,
        });

        const refreshToken = this.generateRefreshToken({
            userId: user.userId,
            tokenId,
        });

        return {
            accessToken,
            refreshToken,
            tokenId,
        };
    }

    /**
     * Generate unique token ID
     */
    private static generateTokenId(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    /**
     * Decode token without verification
     */
    static decodeToken(token: string): any {
        return jwt.decode(token);
    }

    /**
     * Check if token is expired
     */
    static isTokenExpired(token: string): boolean {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return true;

            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch (error) {
            return true;
        }
    }

    /**
     * Get token expiration time
     */
    static getTokenExpiration(token: string): Date | null {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) return null;

            return new Date(decoded.exp * 1000);
        } catch (error) {
            return null;
        }
    }
}