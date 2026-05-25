import { Inject, Injectable } from '@nestjs/common';
import type { Conversation } from '../../../domain/entities/conversation.entity';
import {
    CONVERSATION_REPOSITORY,
    type ConversationRepository,
} from '../../ports/conversation.repository.port';
import type { GetMyConversationsCommand } from './get-my-conversations.command';

@Injectable()
export class GetMyConversationsUseCase {
    constructor(
        @Inject(CONVERSATION_REPOSITORY)
        private readonly conversationRepository: ConversationRepository,
    ) {}

    async execute(command: GetMyConversationsCommand): Promise<Conversation[]> {
        return this.conversationRepository.findManyByUserId(command.currentUserId);
    }
}
