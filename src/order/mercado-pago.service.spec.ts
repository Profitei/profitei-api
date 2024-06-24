import { Test, TestingModule } from '@nestjs/testing';
import { MercadoPagoService } from './mercado-pago.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Payment } from 'mercadopago';
import { PaymentResponse } from 'mercadopago/dist/clients/payment/commonTypes';

describe('MercadoPagoService', () => {
  let service: MercadoPagoService;
  let paymentClient: Payment;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MercadoPagoService],
    }).compile();

    service = module.get<MercadoPagoService>(MercadoPagoService);
    paymentClient = service['paymentClient'];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const req = {
        transaction_amount: 100,
        description: 'Test Payment',
        payment_method_id: 'pix',
        email: 'test@example.com',
        identificationType: 'CPF',
        number: '123456789',
      };

      const mockPaymentResult: PaymentResponse = {
        id: 1,
        status: 'approved',
        api_response: {
          status: 200,
          headers: ['header', ['value']],
        },
      };
      jest.spyOn(paymentClient, 'create').mockResolvedValue(mockPaymentResult);

      const result = await service.createPayment(req);

      expect(paymentClient.create).toHaveBeenCalledWith({
        body: {
          transaction_amount: req.transaction_amount,
          description: req.description,
          payment_method_id: req.payment_method_id,
          payer: {
            email: req.email,
            identification: {
              type: req.identificationType,
              number: req.number,
            },
          },
        },
      });
      expect(result).toEqual(mockPaymentResult);
    });

    it('should throw BadRequestException if payment creation fails', async () => {
      const req = {
        transaction_amount: 100,
        description: 'Test Payment',
        payment_method_id: 'pix',
        email: 'test@example.com',
        identificationType: 'CPF',
        number: '123456789',
      };

      jest
        .spyOn(paymentClient, 'create')
        .mockRejectedValue(new Error('Payment creation failed'));

      await expect(service.createPayment(req)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createPayment(req)).rejects.toThrow(
        'Payment creation failed Payment creation failed',
      );
    });
  });

  describe('getPayment', () => {
    it('should retrieve a payment successfully', async () => {
      const mockPaymentId = '1';
      const mockPaymentResult: PaymentResponse = {
        id: 1,
        status: 'approved',
        api_response: {
          status: 200,
          headers: ['header', ['value']],
        },
      };

      jest.spyOn(paymentClient, 'get').mockResolvedValue(mockPaymentResult);

      const result = await service.getPayment(mockPaymentId);

      expect(paymentClient.get).toHaveBeenCalledWith({ id: mockPaymentId });
      expect(result).toEqual(mockPaymentResult);
    });

    it('should throw NotFoundException if payment retrieval fails', async () => {
      const mockPaymentId = '1';

      jest
        .spyOn(paymentClient, 'get')
        .mockRejectedValue(new Error('Payment retrieval failed'));

      await expect(service.getPayment(mockPaymentId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getPayment(mockPaymentId)).rejects.toThrow(
        'Payment retrieval failed Payment retrieval failed',
      );
    });
  });
});
