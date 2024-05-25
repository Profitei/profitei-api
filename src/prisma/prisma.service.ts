import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient<
  Prisma.PrismaClientOptions,
  'query'
> {
  private readonly logger = new Logger(PrismaService.name);
  constructor() {
    super({ log: [{ level: 'query', emit: 'event' }] });
    this.$on('query', (e) => {
      this.logger.debug(
        `Query: ${e.query} Params: ${e.params} Duration: ${e.duration}ms`,
      );
    });
  }
}
