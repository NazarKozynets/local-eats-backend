import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// PrismaClient is a const returned from a factory (getPrismaClientClass), not a
// plain class declaration. The cast is required for TypeScript to allow `extends`.
const PrismaBase = PrismaClient as unknown as new (options: { adapter: InstanceType<typeof PrismaPg> }) => PrismaClient;

@Injectable()
export class PrismaService extends PrismaBase implements OnModuleInit, OnModuleDestroy {
  constructor(configService: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: configService.getOrThrow<string>('database.url'),
    });
    super({ adapter });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
