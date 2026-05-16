import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateCustomerProfileRequestDto {
    @ApiPropertyOptional({
        example: 'John Doe',
        description: 'Display name shown in the app. Pass null to clear it.',
        nullable: true,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    displayName?: string | null;

    @ApiPropertyOptional({
        example: 'https://cdn.example.com/avatars/user-123.jpg',
        description: 'URL to the customer avatar image. Pass null to clear it.',
        nullable: true,
    })
    @IsOptional()
    @IsUrl()
    avatarUrl?: string | null;
}
