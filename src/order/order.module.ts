import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MercadoPagoService } from './mercado-pago.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, MercadoPagoService],
  imports: [PrismaModule],
  exports: [OrderService],
})
export class OrderModule {}
