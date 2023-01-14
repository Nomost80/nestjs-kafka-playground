export interface SchemaRegistryClient {
  encode<T>(subject: string, payload: T): Promise<Buffer>;
  decode<T>(payload: Buffer): Promise<T>;
}
