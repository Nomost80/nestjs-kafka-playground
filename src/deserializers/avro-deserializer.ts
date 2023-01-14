import { Deserializer } from '@nestjs/microservices';
import { KafkaMessage } from '@nestjs/microservices/external/kafka.interface';
import { ReadPacket } from '@nestjs/microservices';
import { SchemaRegistryClient } from '../clients/schema-registry-client.inteface';
import { KafkaRecord } from 'src/models/kafka-record.model';
import { TopicConfig } from 'src/models/topic-config.model';

export class AvroDeserializer implements Deserializer {
  private schemaRegistryClient: SchemaRegistryClient;

  constructor(
    schemaRegistryClient: SchemaRegistryClient,
    topicsConfig?: TopicConfig[],
  ) {
    this.schemaRegistryClient = schemaRegistryClient;
  }

  async deserialize(
    kafkaMessage: any,
    options?: Record<string, any>,
  ): Promise<ReadPacket<KafkaRecord<any, any>>> {
    console.log('val: ', kafkaMessage);
    const decodedValue = await this.schemaRegistryClient.decode(
      kafkaMessage.value,
    );
    return {
      pattern: kafkaMessage.topic,
      data: {
        headers: kafkaMessage.headers,
        key: kafkaMessage.key,
        value: decodedValue,
      },
    };
  }
}
