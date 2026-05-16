import { Injectable } from '@nestjs/common';
import type { DomainEvent } from '../../domain/events/domain-event.base';
import type { DomainEventPublisher } from '../../domain/events/domain-event-publisher.port';

@Injectable()
export class NoopDomainEventPublisher implements DomainEventPublisher {
    async publishAll(_events: DomainEvent[]): Promise<void> {}
}
