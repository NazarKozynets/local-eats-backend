import {Injectable} from "@nestjs/common";
import {AccountRepository} from "../../domain/repositories/account.repository";
import {PrismaService} from "../../../../shared/infrastructure/database/prisma.service";
import {Email} from "../../../../shared/domain/value-objects/email.vo";
import {PhoneNumber} from "../../../../shared/domain/value-objects/phone-number.vo";
import {UUID} from "../../../../shared/domain/value-objects/uuid.vo";
import {Account} from "../../domain/entities/account.entity";
import {AccountMapper} from "./account.mapper";

@Injectable()
export class PrismaAccountRepository implements AccountRepository {
    constructor(private readonly prisma: PrismaService) {
    }

    // Find user by id
    async findById(id: UUID): Promise<Account | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id: id.value,
            },
        })

        return user ? AccountMapper.toDomain(user) : null;
    }

    // Find user by email
    async findByEmail(email: Email): Promise<Account | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email.value,
            },
        })

        return user ? AccountMapper.toDomain(user) : null;
    }

    // Find user by phone number
    async findByPhoneNumber(phoneNumber: PhoneNumber): Promise<Account | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                phone: phoneNumber.value,
            },
        })

        return user ? AccountMapper.toDomain(user) : null;
    }

    // Check if user exists by email
    async existsByEmail(email: Email): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: {
                email: email.value,
            },
        })

        return !!user;
    }

    // Check if user exists by phone number
    async existsByPhoneNumber(phoneNumber: PhoneNumber): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: {
                phone: phoneNumber.value,
            },
        })

        return !!user;
    }

    // Save user
    async save(user: Account): Promise<void> {
        const data = AccountMapper.toPersistence(user);

        await this.prisma.user.upsert({
            where: { id: data.id },
            create: data as any,
            update: data as any,
        });
    }
}