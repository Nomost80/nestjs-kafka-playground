import { ServerKafka } from '@nestjs/microservices';
import { Consumer } from '@nestjs/microservices/external/kafka.interface';
import {
  EachBatchHandler,
  EachBatchPayload,
  EachMessagePayload,
  KafkaMessage,
} from 'kafkajs';
import { from, timeout, throwError } from 'rxjs';

export class CustomServerKafka extends ServerKafka {
  public async bindEvents(consumer: Consumer): Promise<void> {
    const registeredPatterns = [...this.messageHandlers.keys()];
    const consumerSubscribeOptions = this.options.subscribe || {};
    const subscribeToPattern = async (pattern: string) =>
      consumer.subscribe({
        topic: pattern,
        ...consumerSubscribeOptions,
      });
    await Promise.all(registeredPatterns.map(subscribeToPattern));

    const consumerRunOptions = Object.assign(this.options.run || {}, {
      eachBatch: this.getBatchHandler(),
    });
    await consumer.run(consumerRunOptions);
  }

  public getBatchHandler(): EachBatchHandler {
    return async (payload: EachBatchPayload) => this.handleBatch(payload);
  }

  public async handleBatch(payload: EachBatchPayload) {
    if (!payload.isRunning() || payload.isStale()) return;
    const eachMessagePayloads: EachMessagePayload[] =
      payload.batch.messages.map((message: KafkaMessage) => ({
        topic: payload.batch.topic,
        partition: payload.batch.partition,
        message,
        heartbeat: payload.heartbeat,
        pause: payload.pause,
      }));

    const batchHandling$ = from(
      eachMessagePayloads.map(this.handleMessage.bind(this)),
    );

    // batch should be processed withing 2 seconds otherwise raise error timeout, we don't want to block everything due to slow processing
    batchHandling$.pipe(
      timeout({
        each: 2000,
        with: () => throwError(() => new Error('timeout error')),
      }),
    );

    batchHandling$.subscribe({
      complete: async () => {
        await payload.heartbeat()
        console.log('batch completed');
      },
      error: (error) => {
        console.error(error.message);
      },
    });
  }
}
