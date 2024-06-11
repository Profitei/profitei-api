import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { createHmac } from 'crypto';

@Injectable()
export class MercadoPagoGuard implements CanActivate {
  private readonly logger = new Logger(MercadoPagoGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  private validateRequest(request: any): boolean {
    this.logger.log('Validating Mercado Pago Webhook request');

    const xSignature: string = request.headers['x-signature'];
    const xRequestId: string = request.headers['x-request-id'];
    const dataID: string = request.query['data.id'];

    if (!xSignature || !xRequestId || !dataID) {
      this.logger.warn('Missing required headers or query parameters');
      return false;
    }

    const { ts, hash } = this.parseSignature(xSignature);

    if (!ts || !hash) {
      this.logger.warn('Invalid x-signature format');
      return false;
    }

    const secret: string = process.env.MP_SECRET_SIGN;
    if (!secret) {
      this.logger.error('Secret key not defined');
      return false;
    }

    const manifest: string = `id:${dataID};request-id:${xRequestId};ts:${ts};`;
    const generatedHash: string = this.createHmacHash(manifest, secret);

    const isValid: boolean = generatedHash === hash;
    if (isValid) {
      this.logger.log('HMAC verification passed');
    } else {
      this.logger.warn('HMAC verification failed');
    }

    return isValid;
  }

  private parseSignature(signature: string): { ts: string; hash: string } {
    const parts = signature.split(',');
    let ts: string = '';
    let hash: string = '';

    parts.forEach((part) => {
      const [key, value] = part.split('=').map((str) => str.trim());
      if (key === 'ts') {
        ts = value;
      } else if (key === 'v1') {
        hash = value;
      }
    });

    return { ts, hash };
  }

  private createHmacHash(manifest: string, secret: string): string {
    const hmac = createHmac('sha256', secret);
    hmac.update(manifest);
    return hmac.digest('hex');
  }
}
