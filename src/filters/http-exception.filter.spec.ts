import { HttpExceptionFilter } from './http-exception.filter';
import { ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

describe('HttpExceptionFilter', () => {
  let httpExceptionFilter: HttpExceptionFilter;
  let mockArgumentsHost: ArgumentsHost;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<Request>;
  let mockLoggerError: jest.SpyInstance;

  beforeEach(() => {
    httpExceptionFilter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: '/test-url',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: () => mockResponse as Response,
      getRequest: () => mockRequest as Request,
    } as unknown as ArgumentsHost;

    mockLoggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log the exception and return the proper response', () => {
    const exception = new HttpException('Test exception', 400);
    const status = exception.getStatus();
    const message = exception.getResponse();

    httpExceptionFilter.catch(exception, mockArgumentsHost);

    expect(mockLoggerError).toHaveBeenCalledWith(JSON.stringify(message));
    expect(mockResponse.status).toHaveBeenCalledWith(status);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: status,
      message: message,
      timestamp: expect.any(String),
      path: mockRequest.url,
    });
  });
});
