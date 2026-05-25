export const ADMIN_DELIVERY_PROBLEM_ACTIONS = Symbol('ADMIN_DELIVERY_PROBLEM_ACTIONS');

export interface AdminDeliveryProblemActionsPort {
    resolve(problemId: string, resolvedAt: Date): Promise<void>;
}
