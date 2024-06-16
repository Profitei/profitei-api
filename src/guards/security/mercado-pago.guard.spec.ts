import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoGuard } from './mercado-pago.guard';

describe('MercadoPagoGuard', () => {
  let guard: MercadoPagoGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MercadoPagoGuard],
    }).compile();

    guard = module.get<MercadoPagoGuard>(MercadoPagoGuard);
  });

  describe('canActivate', () => {
    it('should return false if headers or query parameters are missing', () => {
      const context = createContext({}, {});

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return false if x-signature format is invalid', () => {
      const context = createContext(
        { 'x-signature': 'invalid', 'x-request-id': 'request-id' },
        { 'data.id': 'data-id' },
      );

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return false if secret key is not defined', () => {
      process.env.MP_SECRET_SIGN = '';
      const context = createContext(
        { 'x-signature': 'ts=timestamp,v1=hash', 'x-request-id': 'request-id' },
        { 'data.id': 'data-id' },
      );

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should return false if HMAC verification fails', () => {
      process.env.MP_SECRET_SIGN = 'secret';
      const context = createContext(
        {
          'x-signature': 'ts=timestamp,v1=wrong-hash',
          'x-request-id': 'request-id',
        },
        { 'data.id': 'data-id' },
      );

      const spy = jest
        .spyOn(guard as any, 'createHmacHash')
        .mockReturnValue('correct-hash');

      expect(guard.canActivate(context)).toBe(false);
      spy.mockRestore();
    });

    it('should return true if HMAC verification passes', () => {
      process.env.MP_SECRET_SIGN = 'secret';
      const context = createContext(
        {
          'x-signature': 'ts=timestamp,v1=correct-hash',
          'x-request-id': 'request-id',
        },
        { 'data.id': 'data-id' },
      );

      const spy = jest
        .spyOn(guard as any, 'createHmacHash')
        .mockReturnValue('correct-hash');

      expect(guard.canActivate(context)).toBe(true);
      spy.mockRestore();
    });
  });
});

function createContext(headers: any, query: any): any {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        headers,
        query,
      }),
    }),
  };
}
