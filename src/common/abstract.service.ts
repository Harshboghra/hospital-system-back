import { BadRequestException, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export abstract class AbstractService {
  protected constructor(protected readonly repository: Repository<any>) {}

  async find(options: FindManyOptions): Promise<any[]> {
    return await this.repository.find(options);
  }

  async findOne(options: FindOneOptions): Promise<any> {
    const data = await this.repository.find(options);
    return data[0];
  }

  async abstractCreate(dto: any, relations: string[] = null): Promise<any> {
    const errors = await validate(dto);

    if (errors.length > 0) {
      const formatted = errors.map((e) => ({
        target: e.target.constructor.name,
        error: {
          [e.property]: Object.values(e.constraints).join(' '),
        },
      }));
      throw new BadRequestException(formatted);
    }

    const entity = this.repository.create(dto);
    const saved = await this.repository.save(entity);

    return await this.findOne({
      where: { id: saved.id },
      relations,
    });
  }

  async abstractUpdate(
    id: number,
    data: any,
    relations: string[] = null,
  ): Promise<any> {
    const entity = await this.repository.create(data);

    if (!entity) {
      throw new BadRequestException('Entity not found');
    }

    const res = await this.repository.update(id, entity);
    if (res && res.affected > 0) {
      return await this.findOne({
        where: { id },
        relations: relations,
      });
    } else {
      return false;
    }
  }

  async abstractRemove(data: any): Promise<any> {
    const res = await this.repository.delete(data);
    if (res && res.affected > 0) {
      return { status: true };
    } else {
      return false;
    }
  }

  async countInRelation(relation: string, id: number): Promise<any> {
    const entityName = this.repository.metadata.tableName;
    let queryBuilder = this.repository.createQueryBuilder(`${entityName}`);
    const relations = relation.split('.');
    for (let i = 0; i <= relations.length - 1; i++) {
      if (i == 0) {
        queryBuilder = queryBuilder.innerJoinAndSelect(
          `${entityName}.${relations[i]}`,
          `${relations[i]}${i}`,
        );
      } else {
        queryBuilder = queryBuilder.innerJoinAndSelect(
          `${relations[i - 1]}${i - 1}.${relations[i]}`,
          `${relations[i]}${i}`,
        );
      }
    }

    const count = await queryBuilder
      .where(`${entityName}.id = :id`, { id })
      .getCount();

    return count;
  }

  async countByCondition(options: FindOneOptions = {}): Promise<number> {
    return this.repository.count(options);
  }
}
