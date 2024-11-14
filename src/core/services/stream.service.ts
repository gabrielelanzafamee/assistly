import * as uuid from 'uuid';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { WebSocket } from 'ws';

@Injectable()
export class StreamService {
  private expectedAudioIndex: number;
  private audioBuffer: any;
  public streamSid: string;
  public wsMap: Map<string, WebSocket>;

  constructor(private eventEmitter: EventEmitter2) {
    this.expectedAudioIndex = 0;
    this.audioBuffer = {};
    this.streamSid = '';
    this.wsMap = new Map<string, WebSocket>();
  }

  setWs(clientId: string, ws: WebSocket) {
    this.wsMap.set(clientId, ws);
  }

	getWs(clientId: string): WebSocket {
    this.wsMap.get(clientId);
  }

  removeWs(clientId: string) {
    this.wsMap.delete(clientId);
  }

  setStreamSid(streamSid: string) {
    this.streamSid = streamSid;
  }

  buffer(clientId: string, index: number, audio: any) {
    if (index === null) {
      this.sendAudio(clientId, audio);
    } else if (index === this.expectedAudioIndex) {
      this.sendAudio(clientId, audio);
      this.expectedAudioIndex++;
      while (Object.prototype.hasOwnProperty.call(this.audioBuffer, this.expectedAudioIndex)) {
        const bufferedAudio = this.audioBuffer[this.expectedAudioIndex];
        this.sendAudio(clientId, bufferedAudio);
        this.expectedAudioIndex++;
      }
    } else {
      this.audioBuffer[index] = audio;
    }
  }

  sendAudio(clientId: string, audio: any) {
    const ws = this.wsMap.get(clientId);
    if (ws) {
      ws.send(
        JSON.stringify({
          streamSid: this.streamSid,
          event: 'media',
          media: {
            payload: audio,
          },
        }),
      );
      const markLabel = uuid.v4();
      ws.send(
        JSON.stringify({
          streamSid: this.streamSid,
          event: 'mark',
          mark: {
            name: markLabel,
          },
        }),
      );
      this.eventEmitter.emit('stream.sent', markLabel);
    }
  }
}