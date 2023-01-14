import { Serializer } from '@nestjs/microservices';
import { SchemaRegistryClient } from '../clients/schema-registry-client.inteface';
import { KafkaRecord } from 'src/models/kafka-record.model';
import { TopicConfig } from 'src/models/topic-config.model';

export class AvroSerializer implements Serializer {
  private schemaRegistryClient: SchemaRegistryClient;

  constructor(
    schemaRegistryClient: SchemaRegistryClient,
    topicsConfig?: TopicConfig[],
  ) {
    this.schemaRegistryClient = schemaRegistryClient;
  }

  async serialize(
    kafkaRecord: KafkaRecord<any, any>,
    options?: Record<string, any>,
  ): Promise<KafkaRecord<Buffer, Buffer>> {
    const encodedValue = await this.schemaRegistryClient.encode(
      `${options.pattern}-value`,
      kafkaRecord.value,
    );
    console.log('serialized')
    return {
      ...kafkaRecord,
      value: encodedValue,
    };
  }
}
