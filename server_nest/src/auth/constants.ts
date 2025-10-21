export const jwtConstants = {
  secret: 'super-secret-key',
  expiresIn: '15m', // access токен живёт 15 минут
  refreshSecret: 'super-refresh-key',
  refreshExpiresIn: '7d', // refresh токен живёт 7 дней
};
