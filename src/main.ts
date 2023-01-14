import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { CustomServerKafka } from './transporters/custom-server-kafka';
import { AvroSerializer } from './serializers/avro-serializer';
import { AvroDeserializer } from './deserializers/avro-deserializer';
import { ConfluentSchemaRegistryClient } from './clients/confluent-schema-registry-client';

async function bootstrap() {
  const confluentSchemaRegistryClient: ConfluentSchemaRegistryClient =
    new ConfluentSchemaRegistryClient({
      host: 'http://localhost:8081',
    });
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      strategy: new CustomServerKafka({
        client: {
          clientId: 'local-test',
          brokers: ['localhost:29092'],
        },
        consumer: {
          allowAutoTopicCreation: false,
          groupId: 'test-consumer',
          rebalanceTimeout: 60000,
          heartbeatInterval: 5000,
          maxInFlightRequests: 3,
          maxBytes: 10485760,
          retry: {
            retries: 2,
          },
        },
        run: {
          eachBatchAutoResolve: true,
          // partitionsConsumedConcurrently: 3, only if less members (pod) than partitions
        },
        // serializer: , should not be used with server kafka, only with kafka client
        deserializer: new AvroDeserializer(confluentSchemaRegistryClient),
      }),
    },
  );
  await app.listen();
}
bootstrap();
