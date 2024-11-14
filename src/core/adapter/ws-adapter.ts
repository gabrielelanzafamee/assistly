import { MessageMappingProperties } from '@nestjs/websockets';
import { Observable, EMPTY } from 'rxjs';
import { WsAdapter } from '@nestjs/platform-ws';

export class CustomWsAdapter extends WsAdapter {
  bindMessageHandler(
    buffer,
    handlersMap: Map<string, MessageMappingProperties>,
    process: (data: any) => Observable<any>,
  ): Observable<any> {
    const message = JSON.parse(buffer.data);
    const messageHandler = handlersMap.get(message.event);
    if (!messageHandler) {
      return EMPTY;
    }
    return process(messageHandler.callback(message));
  }
}

