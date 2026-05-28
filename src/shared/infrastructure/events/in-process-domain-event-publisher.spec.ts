import { InProcessDomainEventPublisher } from './in-process-domain-event-publisher';
import { DomainEvent } from '../../domain/events/domain-event.base';

class FooEvent extends DomainEvent {
    constructor(public readonly value: string) { super(); }
}

class BarEvent extends DomainEvent {
    constructor(public readonly count: number) { super(); }
}

describe('InProcessDomainEventPublisher', () => {
    let publisher: InProcessDomainEventPublisher;

    beforeEach(() => {
        publisher = new InProcessDomainEventPublisher();
    });

    it('calls a subscribed handler when its event is published', async () => {
        const handler = jest.fn().mockResolvedValue(undefined);
        publisher.subscribe(FooEvent, handler);

        await publisher.publishAll([new FooEvent('hello')]);

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ value: 'hello' }));
    });

    it('does not call handler for a different event type', async () => {
        const fooHandler = jest.fn().mockResolvedValue(undefined);
        const barHandler = jest.fn().mockResolvedValue(undefined);
        publisher.subscribe(FooEvent, fooHandler);
        publisher.subscribe(BarEvent, barHandler);

        await publisher.publishAll([new FooEvent('x')]);

        expect(fooHandler).toHaveBeenCalledTimes(1);
        expect(barHandler).not.toHaveBeenCalled();
    });

    it('calls multiple handlers subscribed to the same event type', async () => {
        const h1 = jest.fn().mockResolvedValue(undefined);
        const h2 = jest.fn().mockResolvedValue(undefined);
        publisher.subscribe(FooEvent, h1);
        publisher.subscribe(FooEvent, h2);

        await publisher.publishAll([new FooEvent('multi')]);

        expect(h1).toHaveBeenCalledTimes(1);
        expect(h2).toHaveBeenCalledTimes(1);
    });

    it('publishes all events in the array', async () => {
        const handler = jest.fn().mockResolvedValue(undefined);
        publisher.subscribe(FooEvent, handler);

        await publisher.publishAll([new FooEvent('a'), new FooEvent('b'), new FooEvent('c')]);

        expect(handler).toHaveBeenCalledTimes(3);
    });

    it('does nothing when no handlers are subscribed', async () => {
        await expect(publisher.publishAll([new FooEvent('orphan')])).resolves.toBeUndefined();
    });

    it('does nothing when events array is empty', async () => {
        const handler = jest.fn();
        publisher.subscribe(FooEvent, handler);

        await publisher.publishAll([]);

        expect(handler).not.toHaveBeenCalled();
    });

    it('continues publishing remaining events after a handler throws', async () => {
        const failing = jest.fn().mockRejectedValue(new Error('boom'));
        const succeeding = jest.fn().mockResolvedValue(undefined);
        publisher.subscribe(FooEvent, failing);

        const secondPublisher = new InProcessDomainEventPublisher();
        secondPublisher.subscribe(BarEvent, succeeding);

        await publisher.publishAll([new FooEvent('x')]);
        await secondPublisher.publishAll([new BarEvent(1)]);

        expect(succeeding).toHaveBeenCalledTimes(1);
    });

    it('continues other handlers in the same batch after one throws', async () => {
        const failing = jest.fn().mockRejectedValue(new Error('boom'));
        const succeeding = jest.fn().mockResolvedValue(undefined);
        publisher.subscribe(FooEvent, failing);
        publisher.subscribe(FooEvent, succeeding);

        await publisher.publishAll([new FooEvent('x')]);

        expect(succeeding).toHaveBeenCalledTimes(1);
    });

    it('logs an error when a handler rejects', async () => {
        const logSpy = jest.spyOn((publisher as any).logger, 'error').mockImplementation(() => undefined);
        const failing = jest.fn().mockRejectedValue(new Error('handler-error'));
        publisher.subscribe(FooEvent, failing);

        await publisher.publishAll([new FooEvent('x')]);

        expect(logSpy).toHaveBeenCalledWith(
            expect.stringContaining('FooEvent'),
            expect.anything(),
        );
    });
});
