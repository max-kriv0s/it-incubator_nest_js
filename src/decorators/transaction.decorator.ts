import { ResultNotification } from '../modules/notification';
import { DataSource, EntityManager } from 'typeorm';

type InsideTransactionReturnType<O> = Promise<ResultNotification<O>>;

type OperationInsideTransaction<I, O> = (
  inputData: I,
  manager: EntityManager,
) => InsideTransactionReturnType<O>;

export class TransactionDecorator {
  constructor(private readonly dataSource: DataSource) {}

  public async doOperation<D, R>(
    data: D,
    operation: OperationInsideTransaction<D, R>,
  ): InsideTransactionReturnType<R> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const res = await operation(data, queryRunner.manager);

      if (!res.hasError()) {
        await queryRunner.commitTransaction();
      } else {
        await queryRunner.rollbackTransaction();
      }

      return res;
    } catch (error) {
      console.log(error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
