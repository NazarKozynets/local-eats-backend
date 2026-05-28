import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { DeliveryProblemReport } from '../../../domain/entities/delivery-problem-report.entity';
import type { DeliveryProblemType } from '../../../domain/enums/delivery-problem-type.enum';
import type { DeliveryProblemStatus } from '../../../domain/enums/delivery-problem-status.enum';

export class DeliveryProblemReportResponseDto {
    @ApiProperty() id!: string;
    @ApiProperty() orderId!: string;
    @ApiProperty() reportedByUserId!: string;
    @ApiProperty() type!: DeliveryProblemType;
    @ApiProperty() status!: DeliveryProblemStatus;
    @ApiProperty() description!: string;
    @ApiPropertyOptional({ nullable: true }) resolvedAt!: Date | null;
    @ApiProperty() createdAt!: Date;
    @ApiProperty() updatedAt!: Date;

    static from(report: DeliveryProblemReport): DeliveryProblemReportResponseDto {
        const dto = new DeliveryProblemReportResponseDto();
        dto.id = report.id.value;
        dto.orderId = report.orderId.value;
        dto.reportedByUserId = report.reportedByUserId.value;
        dto.type = report.type;
        dto.status = report.status;
        dto.description = report.description;
        dto.resolvedAt = report.resolvedAt;
        dto.createdAt = report.createdAt;
        dto.updatedAt = report.updatedAt;
        return dto;
    }
}
