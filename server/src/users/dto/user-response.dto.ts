import { Expose } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  userId: string;

  @Expose()
  displayName: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  createdAt: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
