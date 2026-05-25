export interface GetConversationMessagesCommand {
    conversationId: string;
    currentUserId: string;
    page?: number;
    limit?: number;
}
