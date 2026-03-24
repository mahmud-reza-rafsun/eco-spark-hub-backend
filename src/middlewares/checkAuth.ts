/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import status from "http-status";
import { envVars } from "../config/env";
import { cookieUtils } from "../shared/utils/cookie";
import { AppError } from "../shared/errors/app-error";
import { jwtUtils } from "../shared/utils/jwt";
import { Role, UserStatus } from "@prisma/client";

export const checkAuth = (...authRoles: Role[]) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");
    const accessToken = cookieUtils.getCookie(req, 'accessToken');

    if (!sessionToken) {
      throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No session token provided.');
    }

    if (!accessToken) {
      throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! No access token provided.');
    }

    const sessionExists = await prisma.session.findFirst({
      where: {
        token: sessionToken,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!sessionExists || !sessionExists.user) {
      throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! Invalid or expired session.');
    }

    const user = sessionExists.user;

    const now = new Date();
    const expiresAt = new Date(sessionExists.expiresAt);
    const createdAt = new Date(sessionExists.createdAt);
    const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
    const timeRemaining = expiresAt.getTime() - now.getTime();
    const percentRemaining = (timeRemaining / sessionLifeTime) * 100;

    if (percentRemaining < 20) {
      res.setHeader('X-Session-Refresh', 'true');
      res.setHeader('X-Session-Expires-At', expiresAt.toISOString());
      res.setHeader('X-Time-Remaining', timeRemaining.toString());
    }

    if (user.status === UserStatus.BLOCKED || user.status === UserStatus.DELETED || user.isDeleted) {
      throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! User is not active or deleted.');
    }

    const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

    if (!verifiedToken.success) {
      throw new AppError(status.UNAUTHORIZED, 'Unauthorized access! Invalid access token.');
    }

    const finalRole = (verifiedToken.data as any)?.role || user.role;

    if (authRoles.length > 0 && !authRoles.includes(finalRole as Role)) {
      throw new AppError(status.FORBIDDEN, 'Forbidden access! You do not have permission.');
    }

    req.user = {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error: any) {
    next(error);
  }
};