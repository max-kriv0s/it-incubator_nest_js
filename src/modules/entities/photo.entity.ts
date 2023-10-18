import { Column } from 'typeorm';
import { BaseEntityClass } from './base.entity';

export class PhotoEntity extends BaseEntityClass {
  @Column()
  url: string;

  @Column()
  width: number;

  @Column()
  height: number;

  @Column()
  fileSize: number;

  @Column()
  storageId: string;
}
