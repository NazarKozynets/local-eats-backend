import {Injectable, Module} from "@nestjs/common";
import {ConfigModule} from "@nestjs/config";
import {Test} from "@nestjs/testing";
import {JwtService} from "@nestjs/jwt";
import {IamModule} from "./iam.module";
import {JwtAuthGuard} from "./presentation/guards/jwt-auth.guard";
import {RolesGuard} from "./presentation/guards/roles.guard";
import {AuthController} from "./presentation/controllers/auth.controller";
import {AccountController} from "./presentation/controllers/account.controller";
import {AdminIamController} from "./presentation/controllers/admin-iam.controller";
import {DatabaseModule} from "../../shared/infrastructure/database/database.module";
import {PrismaService} from "../../shared/infrastructure/database/prisma.service";

@Injectable()
class IamExportsConsumer {
    constructor(
        readonly jwtService: JwtService,
        readonly jwtAuthGuard: JwtAuthGuard,
        readonly rolesGuard: RolesGuard,
    ) {}
}

@Module({
    imports: [IamModule],
    providers: [IamExportsConsumer],
})
class IamConsumerModule {}

describe("IamModule", () => {
    it("wires IAM controllers, guards, and exported auth providers", async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    ignoreEnvFile: true,
                    load: [
                        () => ({
                            jwt: {
                                accessSecret: "test-access-secret",
                                refreshSecret: "test-refresh-secret",
                                accessExpiresIn: "15m",
                                refreshExpiresIn: "30d",
                            },
                            database: {
                                url: "postgresql://test:test@localhost:5432/local_eats_test",
                            },
                        }),
                    ],
                }),
                DatabaseModule,
                IamConsumerModule,
            ],
        })
            .overrideProvider(PrismaService)
            .useValue({
                user: {
                    findUnique: jest.fn(),
                    upsert: jest.fn(),
                },
                userSession: {
                    create: jest.fn(),
                    findFirst: jest.fn(),
                    update: jest.fn(),
                    updateMany: jest.fn(),
                },
            })
            .compile();

        expect(moduleRef.get(AuthController)).toBeInstanceOf(AuthController);
        expect(moduleRef.get(AccountController)).toBeInstanceOf(AccountController);
        expect(moduleRef.get(AdminIamController)).toBeInstanceOf(AdminIamController);
        expect(moduleRef.get(JwtAuthGuard)).toBeInstanceOf(JwtAuthGuard);
        expect(moduleRef.get(RolesGuard)).toBeInstanceOf(RolesGuard);

        const consumer = moduleRef.get(IamExportsConsumer);

        expect(consumer.jwtService).toBeInstanceOf(JwtService);
        expect(consumer.jwtAuthGuard).toBeInstanceOf(JwtAuthGuard);
        expect(consumer.rolesGuard).toBeInstanceOf(RolesGuard);

        await moduleRef.close();
    });
});
