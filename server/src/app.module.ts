import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AchievementModule } from './achievements/achievement.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { CatalogGroupsModule } from './catalog-groups/catalog-groups.module';
import { CatalogItemsModule } from './catalog-items/catalog-items.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { UploadModule } from './upload/upload.module';
import { BannersModule } from './banners/banners.module';
import { StubsModule } from './stubs/stubs.module';
import { CollectionsModule } from './collections/collections.module';
import { CollectionLikesModule } from './collection-likes/collection-likes.module';
import { CollectionCommentsModule } from './collection-comments/collection-comments.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    EventEmitterModule.forRoot(),
    AchievementModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    CatalogGroupsModule,
    CatalogItemsModule,
    LikesModule,
    FollowsModule,
    UploadModule,
    BannersModule,
    StubsModule,
    CollectionsModule,
    CollectionLikesModule,
    CollectionCommentsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
