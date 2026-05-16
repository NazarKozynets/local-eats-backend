import type {INestApplication, Type} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export type ModuleSwaggerOptions = {
    path: string;
    title: string;
    description: string;
    version: string;
    include: Type<unknown>[];
    bearerAuth?: boolean;
};

export function setupModuleSwagger(
    app: INestApplication,
    options: ModuleSwaggerOptions,
): void {
    const documentBuilder = new DocumentBuilder()
        .setTitle(options.title)
        .setDescription(options.description)
        .setVersion(options.version);

    if (options.bearerAuth !== false) {
        documentBuilder.addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                description: 'Enter JWT access token',
                in: 'header',
            },
            'access-token',
        );
    }

    const document = SwaggerModule.createDocument(
        app,
        documentBuilder.build(),
        {
            include: options.include,
        },
    );

    SwaggerModule.setup(options.path, app, document);
}
