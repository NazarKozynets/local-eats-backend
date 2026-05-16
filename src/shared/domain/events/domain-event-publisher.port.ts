import type { DomainEvent } from './domain-event.base';

export const DOMAIN_EVENT_PUBLISHER = Symbol('DOMAIN_EVENT_PUBLISHER');

export interface DomainEventPublisher {
    publishAll(events: DomainEvent[]): Promise<void>;
}
