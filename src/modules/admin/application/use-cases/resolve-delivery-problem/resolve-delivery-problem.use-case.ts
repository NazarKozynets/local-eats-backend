import { Inject, Injectable } from '@nestjs/common';
import {
    ADMIN_DELIVERY_PROBLEM_READER,
    type AdminDeliveryProblemReader,
} from '../../ports/admin-delivery-problem-reader.port';
import {
    ADMIN_DELIVERY_PROBLEM_ACTIONS,
    type AdminDeliveryProblemActionsPort,
} from '../../ports/admin-delivery-problem-actions.port';
import { DeliveryProblemNotFoundError } from '../../../domain/errors/delivery-problem-not-found.error';
import { DeliveryProblemAlreadyResolvedError } from '../../../domain/errors/delivery-problem-already-resolved.error';
import type { ResolveDeliveryProblemCommand } from './resolve-delivery-problem.command';

@Injectable()
export class ResolveDeliveryProblemUseCase {
    constructor(
        @Inject(ADMIN_DELIVERY_PROBLEM_READER)
        private readonly deliveryProblemReader: AdminDeliveryProblemReader,
        @Inject(ADMIN_DELIVERY_PROBLEM_ACTIONS)
        private readonly deliveryProblemActions: AdminDeliveryProblemActionsPort,
    ) {}

    async execute(command: ResolveDeliveryProblemCommand): Promise<void> {
        const problem = await this.deliveryProblemReader.findById(command.problemId);

        if (!problem) {
            throw new DeliveryProblemNotFoundError();
        }

        if (problem.status === 'RESOLVED') {
            throw new DeliveryProblemAlreadyResolvedError();
        }

        await this.deliveryProblemActions.resolve(command.problemId, new Date());
    }
}
