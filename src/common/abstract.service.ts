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
    const entity = await this.repository.preload(data);
    const errors = await validate(entity);
    if (errors.length > 0) {
      const error = errors.map((e) => {
        return {
          target: e.target.constructor.name,
          error: {
            [e.property]: Object.values(e.constraints).join(' '),
          },
        };
      });
      throw new BadRequestException(error);
    }
    const res = await this.repository.update(id, data);
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
}
