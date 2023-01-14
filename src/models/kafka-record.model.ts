export class KafkaRecord<Key, Value> {
  headers: Record<string, string>[];
  key: Key;
  value: Value;
}
