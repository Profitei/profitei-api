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
  constructor(private reflector: Reflector) {}

  private readonly logger = new Logger(MercadoPagoGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    return validateRequest(request);
  }
}
function validateRequest(request: any): boolean {
  this.logger.log('Validating Mercado Pago Webhook request');

  // Assuming headers is an object containing request headers
  const { 'x-signature': xSignature, 'x-request-id': xRequestId } =
    request.headers;

  // Obtain Query params related to the request URL
  const urlParams = new URLSearchParams(window.location.search);
  const dataID = urlParams.get('data.id');

  // Separating the x-signature into parts
  const parts = xSignature.split(',');

  // Initializing variables to store ts and hash
  let ts;
  let hash;

  // Iterate over the values to obtain ts and v1
  parts.forEach((part) => {
    const [key, value] = part.split('=').map((str) => str.trim());
    if (key === 'ts') {
      ts = value;
    } else if (key === 'v1') {
      hash = value;
    }
  });

  // Obtain the secret key for the user/application from Mercadopago developers site
  const secret = process.env.MP_SECRET_SIGN;

  // Generate the manifest string
  const manifest = `id:${dataID};request-id:${xRequestId};ts:${ts};`;

  // Create an HMAC signature
  const hmac = createHmac('sha256', secret);
  hmac.update(manifest);

  // Obtain the hash result as a hexadecimal string
  const sha = hmac.digest('hex');

  // Check if the generated HMAC matches the provided hash
  return sha === hash;
}
