import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CollectionComment } from '../database/entities/collection-comment.entity';

@Injectable()
export class CollectionCommentsService {
  constructor(
    @InjectRepository(CollectionComment)
    private commentRepo: Repository<CollectionComment>,
  ) {}

  // 컬렉션의 댓글 목록 조회
  async findByCollection(collectionId: number) {
    const comments = await this.commentRepo.find({
      where: { collection_id: collectionId },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
    return comments;
  }

  // 댓글 작성
  async create(collectionId: number, userId: number, content: string) {
    const comment = this.commentRepo.create({
      collection_id: collectionId,
      user_id: userId,
      content,
    });
    const saved = await this.commentRepo.save(comment);

    // 작성자 정보 포함하여 반환
    return this.commentRepo.findOne({
      where: { id: saved.id },
      relations: ['user'],
    });
  }

  // 댓글 삭제
  async remove(commentId: number, userId: number) {
    const comment = await this.commentRepo.findOne({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다');
    if (comment.user_id !== userId) throw new ForbiddenException('권한이 없습니다');

    await this.commentRepo.remove(comment);
    return { deleted: true };
  }
}
