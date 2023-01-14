import { Controller } from '@nestjs/common';
import {
  EventPattern,
  ClientKafka,
  Client,
  Transport,
} from '@nestjs/microservices';
import { AppService } from './app.service';
import { Hello } from './models/hello.model';
import { KafkaRecord } from './models/kafka-record.model';
import { AvroSerializer } from './serializers/avro-serializer';
import { ConfluentSchemaRegistryClient } from './clients/confluent-schema-registry-client';

@Controller()
export class AppController {
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'local-test',
        brokers: ['localhost:29092'],
      },
      producerOnlyMode: true,
      serializer: new AvroSerializer(
        new ConfluentSchemaRegistryClient({
          host: 'http://localhost:8081',
        }),
      ),
    },
  })
  client: ClientKafka;

  constructor(private readonly appService: AppService) {}

  @EventPattern('say_hello')
  sayHello(record: KafkaRecord<null, Hello>): void {
    console.log('data: ', record);
    this.appService.sayHello(record.value.firstName);
    const hello = new Hello()
    hello.firstName = 'Guillaume updated'
    const kafkaRecord = new KafkaRecord()
    kafkaRecord.value = hello
    this.client.emit<Hello>('sayed_hello', kafkaRecord).subscribe({
      complete: () => console.log('complete')
    })
  }

  // @EventPattern('sayed_hello')
  // consumeHello(record: KafkaRecord<null, Hello>): void {
  //   console.log(record.value.firstName)
  // }
}
