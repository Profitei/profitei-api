import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const NO_AUTH = 'noAuth';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const NoAuth = () => SetMetadata(NO_AUTH, true);
