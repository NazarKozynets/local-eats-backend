import { Global, Module } from '@nestjs/common';
import { DOMAIN_EVENT_PUBLISHER } from '../../domain/events/domain-event-publisher.port';
import { InProcessDomainEventPublisher } from './in-process-domain-event-publisher';

@Global()
@Module({
    providers: [
        InProcessDomainEventPublisher,
        {
            provide: DOMAIN_EVENT_PUBLISHER,
            useExisting: InProcessDomainEventPublisher,
        },
    ],
    exports: [DOMAIN_EVENT_PUBLISHER, InProcessDomainEventPublisher],
})
export class SharedEventsModule {}
