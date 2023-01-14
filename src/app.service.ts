import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  sayHello(firstName: string): void {
    console.log(`Hello World ${firstName}!`);
  }
}
