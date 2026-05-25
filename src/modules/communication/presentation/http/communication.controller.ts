import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
    ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../iam/presentation/guards/jwt-auth.guard';
import { CurrentUser } from '../../../iam/presentation/decorators/current-user.decorator';
import type { AuthUser } from '../../../iam/presentation/types/auth-user.type';
import { GetOrCreateOrderConversationUseCase } from '../../application/use-cases/get-or-create-order-conversation/get-or-create-order-conversation.use-case';
import { SendMessageUseCase } from '../../application/use-cases/send-message/send-message.use-case';
import { GetConversationMessagesUseCase } from '../../application/use-cases/get-conversation-messages/get-conversation-messages.use-case';
import { MarkMessagesAsReadUseCase } from '../../application/use-cases/mark-messages-as-read/mark-messages-as-read.use-case';
import { GetMyUnreadCountUseCase } from '../../application/use-cases/get-my-unread-count/get-my-unread-count.use-case';
import { GetMyConversationsUseCase } from '../../application/use-cases/get-my-conversations/get-my-conversations.use-case';
import { GetConversationUseCase } from '../../application/use-cases/get-conversation/get-conversation.use-case';
import { SendMessageRequestDto } from './dtos/send-message-request.dto';
import { GetMessagesQueryDto } from './dtos/get-messages-query.dto';
import { ConversationResponseDto } from './dtos/conversation.response.dto';
import { MessageResponseDto } from './dtos/message.response.dto';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
@ApiTags('Communication')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
export class CommunicationController {
    constructor(
        private readonly getOrCreateOrderConversationUseCase: GetOrCreateOrderConversationUseCase,
        private readonly sendMessageUseCase: SendMessageUseCase,
        private readonly getConversationMessagesUseCase: GetConversationMessagesUseCase,
        private readonly markMessagesAsReadUseCase: MarkMessagesAsReadUseCase,
        private readonly getMyUnreadCountUseCase: GetMyUnreadCountUseCase,
        private readonly getMyConversationsUseCase: GetMyConversationsUseCase,
        private readonly getConversationUseCase: GetConversationUseCase,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get my conversations' })
    @ApiOkResponse({ type: [ConversationResponseDto] })
    async getMyConversations(@CurrentUser() user: AuthUser): Promise<ConversationResponseDto[]> {
        const conversations = await this.getMyConversationsUseCase.execute({
            currentUserId: user.userId,
        });
        return conversations.map(ConversationResponseDto.from);
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get my total unread messages count' })
    @ApiOkResponse({ schema: { properties: { count: { type: 'number' } } } })
    async getUnreadCount(@CurrentUser() user: AuthUser): Promise<{ count: number }> {
        const count = await this.getMyUnreadCountUseCase.execute({
            currentUserId: user.userId,
        });
        return { count };
    }

    @Get('order/:orderId')
    @ApiOperation({ summary: 'Get or create a conversation for an order' })
    @ApiOkResponse({ type: ConversationResponseDto })
    @ApiNotFoundResponse({ description: 'Order not found' })
    @ApiForbiddenResponse({ description: 'Not a participant of this order' })
    async getOrCreateOrderConversation(
        @CurrentUser() user: AuthUser,
        @Param('orderId', ParseUUIDPipe) orderId: string,
    ): Promise<ConversationResponseDto> {
        const conversation = await this.getOrCreateOrderConversationUseCase.execute({
            orderId,
            currentUserId: user.userId,
            currentUserRole: user.role,
        });
        return ConversationResponseDto.from(conversation);
    }

    @Get(':conversationId')
    @ApiOperation({ summary: 'Get conversation details' })
    @ApiOkResponse({ type: ConversationResponseDto })
    @ApiNotFoundResponse({ description: 'Conversation not found' })
    @ApiForbiddenResponse({ description: 'Not a participant' })
    async getConversation(
        @CurrentUser() user: AuthUser,
        @Param('conversationId', ParseUUIDPipe) conversationId: string,
    ): Promise<ConversationResponseDto> {
        const conversation = await this.getConversationUseCase.execute({
            conversationId,
            currentUserId: user.userId,
        });
        return ConversationResponseDto.from(conversation);
    }

    @Post(':conversationId/messages')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Send a message' })
    @ApiBody({ type: SendMessageRequestDto })
    @ApiCreatedResponse({ type: MessageResponseDto })
    @ApiNotFoundResponse({ description: 'Conversation not found' })
    @ApiForbiddenResponse({ description: 'Not a participant' })
    async sendMessage(
        @CurrentUser() user: AuthUser,
        @Param('conversationId', ParseUUIDPipe) conversationId: string,
        @Body() dto: SendMessageRequestDto,
    ): Promise<MessageResponseDto> {
        const message = await this.sendMessageUseCase.execute({
            conversationId,
            senderUserId: user.userId,
            body: dto.body,
        });
        return MessageResponseDto.from(message);
    }

    @Get(':conversationId/messages')
    @ApiOperation({ summary: 'Get conversation messages' })
    @ApiOkResponse({ type: [MessageResponseDto] })
    @ApiNotFoundResponse({ description: 'Conversation not found' })
    @ApiForbiddenResponse({ description: 'Not a participant' })
    async getMessages(
        @CurrentUser() user: AuthUser,
        @Param('conversationId', ParseUUIDPipe) conversationId: string,
        @Query() query: GetMessagesQueryDto,
    ): Promise<MessageResponseDto[]> {
        const messages = await this.getConversationMessagesUseCase.execute({
            conversationId,
            currentUserId: user.userId,
            page: query.page,
            limit: query.limit,
        });
        return messages.map(MessageResponseDto.from);
    }

    @Post(':conversationId/messages/read')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Mark all messages in conversation as read' })
    @ApiNoContentResponse({ description: 'Messages marked as read' })
    @ApiNotFoundResponse({ description: 'Conversation not found' })
    @ApiForbiddenResponse({ description: 'Not a participant' })
    async markAsRead(
        @CurrentUser() user: AuthUser,
        @Param('conversationId', ParseUUIDPipe) conversationId: string,
    ): Promise<void> {
        return this.markMessagesAsReadUseCase.execute({
            conversationId,
            currentUserId: user.userId,
        });
    }
}
