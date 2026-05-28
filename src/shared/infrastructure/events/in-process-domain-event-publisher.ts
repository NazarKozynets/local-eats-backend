import { Injectable, Logger } from '@nestjs/common';
import type { DomainEvent } from '../../domain/events/domain-event.base';
import type { DomainEventPublisher } from '../../domain/events/domain-event-publisher.port';

type EventHandler = (event: DomainEvent) => Promise<void>;

@Injectable()
export class InProcessDomainEventPublisher implements DomainEventPublisher {
    private readonly logger = new Logger(InProcessDomainEventPublisher.name);
    private readonly handlers = new Map<string, EventHandler[]>();

    subscribe<T extends DomainEvent>(
        eventClass: abstract new (...args: any[]) => T,
        handler: (event: T) => Promise<void>,
    ): void {
        const key = eventClass.name;
        const existing = this.handlers.get(key) ?? [];
        this.handlers.set(key, [...existing, handler as EventHandler]);
    }

    async publishAll(events: DomainEvent[]): Promise<void> {
        for (const event of events) {
            const key = event.constructor.name;
            const handlers = this.handlers.get(key) ?? [];
            const results = await Promise.allSettled(handlers.map(h => h(event)));
            for (const result of results) {
                if (result.status === 'rejected') {
                    this.logger.error(
                        `Event handler error for ${key}: ${result.reason?.message ?? result.reason}`,
                        result.reason?.stack,
                    );
                }
            }
        }
    }
}
