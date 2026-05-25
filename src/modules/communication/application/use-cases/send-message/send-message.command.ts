export interface SendMessageCommand {
    conversationId: string;
    senderUserId: string;
    body: string;
}
