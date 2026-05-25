import { Inject, Injectable } from '@nestjs/common';
import {
    MESSAGE_REPOSITORY,
    type MessageRepository,
} from '../../ports/message.repository.port';
import type { GetMyUnreadCountCommand } from './get-my-unread-count.command';

@Injectable()
export class GetMyUnreadCountUseCase {
    constructor(
        @Inject(MESSAGE_REPOSITORY)
        private readonly messageRepository: MessageRepository,
    ) {}

    async execute(command: GetMyUnreadCountCommand): Promise<number> {
        return this.messageRepository.countUnreadByParticipantId(command.currentUserId);
    }
}
