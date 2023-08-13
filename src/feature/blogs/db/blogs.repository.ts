// import { Injectable } from '@nestjs/common';
// import {
//   Blog,
//   BlogDocument,
//   BlogModelType,
//   CreateUserBlockDto,
// } from '../model/blog.schema';
// import { InjectModel } from '@nestjs/mongoose';
// import { castToObjectId } from '../../../utils';

// @Injectable()
// export class BlogsRepository {
//   constructor(@InjectModel(Blog.name) private BlogModel: BlogModelType) {}

//   createBlog(createDto: CreateUserBlockDto): BlogDocument {
//     return this.BlogModel.createBlog(createDto, this.BlogModel);
//   }

//   async findBlogById(id: string): Promise<BlogDocument | null> {
//     return this.BlogModel.findById(id).exec();
//   }

//   async deleteBlogById(id: string): Promise<BlogDocument | null> {
//     return this.BlogModel.findByIdAndDelete(id);
//   }

//   async deleteBlogs() {
//     await this.BlogModel.deleteMany({});
//   }

//   async save(blog: BlogDocument): Promise<BlogDocument> {
//     return blog.save();
//   }

//   async findBlogsByOwnerId(ownerId: string): Promise<BlogDocument[] | null> {
//     return this.BlogModel.find({ 'blogOwner.userId': castToObjectId(ownerId) });
//   }
// }
