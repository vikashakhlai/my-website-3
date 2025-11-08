export const jwtConstants = {
  secret: process.env.JWT_ACCESS_SECRET || 'super-secret-key',
  expiresIn: '15m' as any,

  refreshSecret: process.env.JWT_REFRESH_SECRET || 'super-refresh-key',
  refreshExpiresIn: '7d',
};
