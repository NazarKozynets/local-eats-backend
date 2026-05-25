import { ApiProperty } from '@nestjs/swagger';
import { ConversationType } from '../../../domain/enums/conversation-type.enum';
import { ConversationParticipantRole } from '../../../domain/enums/conversation-participant-role.enum';
import type { Conversation } from '../../../domain/entities/conversation.entity';

export class ParticipantResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    userId!: string;

    @ApiProperty({ enum: ConversationParticipantRole })
    role!: ConversationParticipantRole;

    @ApiProperty()
    createdAt!: Date;
}

export class ConversationResponseDto {
    @ApiProperty()
    id!: string;

    @ApiProperty()
    orderId!: string;

    @ApiProperty({ enum: ConversationType })
    type!: ConversationType;

    @ApiProperty({ type: [ParticipantResponseDto] })
    participants!: ParticipantResponseDto[];

    @ApiProperty()
    createdAt!: Date;

    @ApiProperty()
    updatedAt!: Date;

    static from(conversation: Conversation): ConversationResponseDto {
        const dto = new ConversationResponseDto();
        dto.id = conversation.id.value;
        dto.orderId = conversation.orderId.value;
        dto.type = conversation.type;
        dto.participants = conversation.participants.map(p => {
            const pdto = new ParticipantResponseDto();
            pdto.id = p.id.value;
            pdto.userId = p.userId.value;
            pdto.role = p.role;
            pdto.createdAt = p.createdAt;
            return pdto;
        });
        dto.createdAt = conversation.createdAt;
        dto.updatedAt = conversation.updatedAt;
        return dto;
    }
}
