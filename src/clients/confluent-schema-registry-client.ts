import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { SchemaRegistryClient } from './schema-registry-client.inteface';
import { SchemaRegistryAPIClientArgs } from '@kafkajs/confluent-schema-registry/dist/api';
import { SchemaRegistryAPIClientOptions } from '@kafkajs/confluent-schema-registry/dist/@types';

export class ConfluentSchemaRegistryClient implements SchemaRegistryClient {
  private client: SchemaRegistry;
  private schemaIds: Map<string, number> = new Map();

  constructor(
    options: SchemaRegistryAPIClientArgs,
    protocolOptions?: SchemaRegistryAPIClientOptions,
  ) {
    this.client = new SchemaRegistry(options, protocolOptions);
  }

  private async fetchLatestSchemaId(subject: string): Promise<void> {
    const schemaId: number = await this.client.getLatestSchemaId(subject);
    this.schemaIds.set(subject, schemaId);
  }

  async encode<T>(subject: string, payload: T): Promise<Buffer> {
    const schemaId: number | null = this.schemaIds.get(subject);
    if (!schemaId) {
      await this.fetchLatestSchemaId(subject);
      return this.encode(subject, payload);
    }
    return this.client.encode(schemaId, payload);
  }

  async decode<T>(payload: Buffer): Promise<T> {
    return this.client.decode(payload);
  }
}
