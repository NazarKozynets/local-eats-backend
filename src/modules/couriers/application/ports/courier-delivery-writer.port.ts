export const COURIER_DELIVERY_WRITER = Symbol('COURIER_DELIVERY_WRITER');

export interface CourierDeliveryWriter {
    markBusy(courierProfileId: string): Promise<void>;
    markOnline(courierProfileId: string): Promise<void>;
    incrementCompletedDeliveries(courierProfileId: string): Promise<void>;
    updateLocation(courierProfileId: string, latitude: number, longitude: number): Promise<void>;
}
