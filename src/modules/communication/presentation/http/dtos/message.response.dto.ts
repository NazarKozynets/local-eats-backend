import { ApiProperty } from '@nestjs/swagger';
import { MessageType } from '../../../domain/enums/message-type.enum';
import type { Message } from '../../../domain/entities/message.entity';

export class MessageResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    conversationId!: string;

    @ApiProperty()
    senderUserId!: string;

    @ApiProperty({ enum: MessageType })
    type!: MessageType;

    @ApiProperty()
    body!: string;

    @ApiProperty()
    createdAt!: Date;

    static from(message: Message): MessageResponseDto {
        const dto = new MessageResponseDto();
        dto.id = message.id.value;
        dto.conversationId = message.conversationId.value;
        dto.senderUserId = message.senderUserId.value;
        dto.type = message.type;
        dto.body = message.body;
        dto.createdAt = message.createdAt;
        return dto;
    }
}
