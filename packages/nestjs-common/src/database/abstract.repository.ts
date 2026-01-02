import { Logger } from '@nestjs/common';
import { Model, QueryFilter, Types, UpdateQuery } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
export abstract class AbstractRepository<
  TDocument extends { _id: Types.ObjectId },
> {
  protected abstract readonly logger: Logger;
  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Partial<TDocument>): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    this.logger.log(`Created document: ${createdDocument._id}`);
    return (await createdDocument.save()) as TDocument;
  }

  async findOne(filterQuery: QueryFilter<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });
    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      throw new NotFoundException('Document not found.');
    }
    return document;
  }
  async find(filterQuery: QueryFilter<TDocument>) {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  async findOneAndUpdate(
    filterQuery: QueryFilter<TDocument>,
    update: UpdateQuery<TDocument>
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean(true)) as TDocument;
    if (!document) {
      this.logger.warn(
        `Document not found with filter query: ${JSON.stringify(filterQuery)}`
      );
      throw new NotFoundException('The document was not found');
    }
    return document;
  }

  async findOneAndDelete(
    filterQuery: QueryFilter<TDocument>
  ): Promise<TDocument> {
    const document = (await this.model
      .findOneAndDelete(filterQuery)
      .lean(true)) as TDocument;
    if (!document) {
      this.logger.warn(
        `Document not found with filter query: ${JSON.stringify(filterQuery)}`
      );
      throw new NotFoundException('The document was not found');
    }
    return document;
  }
}
