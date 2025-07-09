import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { QueryBuilderService } from "./services/query-builder.service";
import { TransactionService } from "./services/transaction.service";

@Global()
@Module({
  providers: [PrismaService, QueryBuilderService, TransactionService],
  exports: [PrismaService, QueryBuilderService, TransactionService],
})
export class CommonModule {}
