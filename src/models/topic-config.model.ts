export class TopicConfig {
  name: string | null;
  wildcard: string | null;
  key: Encodable;
  value: Encodable;
}

class Encodable {
  encoding: Encoding = Encoding.AVRO;
  subject: string | null;
}

enum Encoding {
  AVRO,
}
