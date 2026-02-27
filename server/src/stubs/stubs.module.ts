import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stub } from '../database/entities/stub.entity';
import { StubsService } from './stubs.service';
import { StubsController } from './stubs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Stub])],
  controllers: [StubsController],
  providers: [StubsService],
  exports: [StubsService],
})
export class StubsModule {}
