To achieve your desired behavior, you need to implement logic that checks the status of the reception phone (whether it’s busy or free) and dynamically redirects the call either to the AI or the reception phone. Additionally, you need to enable mid-call redirection to the human when the reception becomes available.

### Implementation Steps

1. **Check Reception Phone Status**: Implement a method to query the reception phone's status (e.g., using an API provided by your telephony system or through a webhook).

2. **Dynamic Call Handling**:
   - If the reception phone is free, route the call there directly.
   - If the reception phone is busy, route the call to the AI (`/ws/v1/custom`).
   - Implement a mechanism to re-check the reception phone's status mid-call.

3. **Redirect During a Call**: Use Twilio's `Redirect` TwiML or dynamic updates through the Programmable Voice API to switch call destinations.

---

### Modified Code
Below is an updated version of your `callbackCall` method to include the desired logic:

```typescript
async callbackCall(params: ITwilioVoiceCallback, phoneId: string) {
    const response = new twilio.twiml.VoiceResponse();
    const { phone, assistant } = await this.webhooksCommonService.getAssistantAndPhone(
        phoneId,
        AssistantType.CALL,
    );

    // Check if the number of simultaneous calls exceeds the plan limit
    const calls = await this.webhooksCommonService.callsService.getCallsByStatus(
        phone.organization._id.toString(),
        CallStatus.IN_PROGRESS,
    );

    if (calls >= plansLimitations[phone.organization.plan].calls) {
        response.say('The line is busy at the moment, try later.');
        return response.toString();
    }

    // Check the status of the reception phone
    const isReceptionBusy = await this.webhooksCommonService.checkReceptionPhoneStatus(phone._id.toString());

    if (!isReceptionBusy) {
        // Route the call directly to the reception phone
        const dial = response.dial();
        dial.number(phone.number); // Replace with the reception phone number
        return response.toString();
    }

    // If the reception phone is busy, handle the call with AI
    const call = await this.webhooksCommonService.callsService.create({
        organization: phone.organization._id.toString(),
        assistant: assistant._id.toString(),
        phone: phone._id.toString(),
        callSid: params.CallSid,
        from: params.From,
        to: params.To,
        transcript: [],
        status: CallStatus.QUEUED,
    });
    assertion(call, new InternalServerErrorException('Unable to start a call'));

    if (!assistant.isActive) {
        response.say("I'm sorry but at the moment we are offline. Try Later.");
        return response.toString();
    }

    const connect = response.connect();
    const stream = connect.stream({
        url: `${process.env.BASE_URL.replace('https', 'wss')}/ws/v1/custom`,
    });

    stream.parameter({ name: 'callId', value: call._id.toString() });
    stream.parameter({ name: 'callSid', value: params.CallSid });
    stream.parameter({ name: 'from', value: params.From });
    stream.parameter({ name: 'phoneId', value: phone._id.toString() });
    stream.parameter({ name: 'phoneNumber', value: params.To });
    stream.parameter({
        name: 'organizationId',
        value: phone.organization._id.toString(),
    });

    return response.toString();
}
```

---

### Mid-Call Redirection
To implement redirection mid-call:
1. **Websocket Communication**:
   - Use the `/ws/v1/custom` websocket to monitor if the reception phone becomes free during the call.
   - If the reception is free, trigger an API call to Twilio to redirect the call.

2. **Twilio Call Redirect**:
   - Use Twilio's `calls` API to update the call's `TwiML` and redirect it to the reception phone:
   ```typescript
   const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

   await client.calls(callSid)
       .update({
           method: 'POST',
           url: `${process.env.BASE_URL}/redirect-to-reception`, // Endpoint to handle redirection
       });
   ```

3. **Redirection Endpoint**:
   Create a new endpoint that returns `TwiML` to route the call to the reception phone:
   ```typescript
   @Post('redirect-to-reception')
   redirectToReception(@Body() body: any) {
       const response = new twilio.twiml.VoiceResponse();
       response.dial().number(RECEPTION_PHONE_NUMBER);
       return response.toString();
   }
   ```

---

### Helper to Check Reception Phone Status
Add a method in `WebhooksCommonService` to check the reception phone’s status:

```typescript
async checkReceptionPhoneStatus(phoneId: string): Promise<boolean> {
    // Implement logic to check if the reception phone is busy
    // Example: query the phone system API or track via database/webhooks
    const phoneStatus = await this.phoneSystemApi.getPhoneStatus(phoneId); // Replace with your API logic
    return phoneStatus.isBusy; // Return true if busy, false otherwise
}
```

---

### Key Notes
- Ensure you handle Twilio webhooks securely by validating requests.
- Monitor the `statusCallback` to track call progress and implement fail-safes.
- Test extensively to ensure seamless handoff between AI and reception.

This approach allows flexible call routing and mid-call redirection. Let me know if you need help with specific parts of this!

To handle a **call queue system** based on the organization's plan limitations, you can implement a queue that tracks the incoming calls and determines whether they should be routed or placed in a waiting state. If the maximum simultaneous calls for the organization have been reached, the new calls will remain in the queue until a slot becomes available.

Here’s how to build it:

---

### **Plan and Implementation**

1. **Define Maximum Call Limits**:
   Each organization's plan should define the maximum number of simultaneous calls allowed. This is already available in your `plansLimitations` object.

2. **Queue Management**:
   Implement a queue for incoming calls. Calls exceeding the limit are added to this queue. When a call ends, the next call in the queue is processed.

3. **Database Updates**:
   Use a database or in-memory storage to:
   - Track ongoing calls (`CallStatus.IN_PROGRESS`).
   - Store queued calls.

4. **Queue Processor**:
   - Regularly check for available slots.
   - Fetch calls from the queue and route them as slots free up.

5. **Twilio Behavior**:
   Use Twilio’s hold music or messages to inform queued callers about their status.

---

### **Code Implementation**

#### 1. **Database Schema for Call Queue**
Add a `queue` collection to store queued calls:
```typescript
// Schema for Call Queue
{
  _id: ObjectId,
  organizationId: string,
  callSid: string,
  from: string,
  to: string,
  createdAt: Date,
}
```

---

#### 2. **Queue Service**
Create a `CallQueueService` to manage the call queue:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class CallQueueService {
  private queue = new Map<string, Array<any>>(); // Organization ID -> Call Queue

  // Add call to the queue
  enqueueCall(organizationId: string, callDetails: any) {
    if (!this.queue.has(organizationId)) {
      this.queue.set(organizationId, []);
    }
    this.queue.get(organizationId).push(callDetails);
  }

  // Remove call from the queue
  dequeueCall(organizationId: string): any | null {
    if (this.queue.has(organizationId) && this.queue.get(organizationId).length > 0) {
      return this.queue.get(organizationId).shift();
    }
    return null;
  }

  // Get the queue length for an organization
  getQueueLength(organizationId: string): number {
    return this.queue.has(organizationId) ? this.queue.get(organizationId).length : 0;
  }

  // Get the next call in the queue without removing it
  peekQueue(organizationId: string): any | null {
    if (this.queue.has(organizationId) && this.queue.get(organizationId).length > 0) {
      return this.queue.get(organizationId)[0];
    }
    return null;
  }
}
```

---

#### 3. **Updated `callbackCall` Method**
Integrate the queue logic into the `callbackCall` method:

```typescript
async callbackCall(params: ITwilioVoiceCallback, phoneId: string) {
  const response = new twilio.twiml.VoiceResponse();
  const { phone, assistant } = await this.webhooksCommonService.getAssistantAndPhone(
    phoneId,
    AssistantType.CALL,
  );

  // Check active calls for the organization
  const activeCalls = await this.webhooksCommonService.callsService.getCallsByStatus(
    phone.organization._id.toString(),
    CallStatus.IN_PROGRESS,
  );

  const maxCalls = plansLimitations[phone.organization.plan].calls;

  if (activeCalls >= maxCalls) {
    // Add call to the queue
    this.callQueueService.enqueueCall(phone.organization._id.toString(), {
      callSid: params.CallSid,
      from: params.From,
      to: params.To,
      createdAt: new Date(),
    });

    // Inform the caller they are in a queue
    response.say(
      `The line is currently busy. You are placed in a queue. We will connect you as soon as possible.`
    );
    return response.toString();
  }

  // Process the call (same as before)
  const call = await this.webhooksCommonService.callsService.create({
    organization: phone.organization._id.toString(),
    assistant: assistant._id.toString(),
    phone: phone._id.toString(),
    callSid: params.CallSid,
    from: params.From,
    to: params.To,
    transcript: [],
    status: CallStatus.QUEUED,
  });

  assertion(call, new InternalServerErrorException('Unable to start a call'));

  if (!assistant.isActive) {
    response.say("I'm sorry but at the moment we are offline. Try later.");
    return response.toString();
  }

  const connect = response.connect();
  const stream = connect.stream({
    url: `${process.env.BASE_URL.replace('https', 'wss')}/ws/v1/custom`,
  });

  stream.parameter({ name: 'callId', value: call._id.toString() });
  stream.parameter({ name: 'callSid', value: params.CallSid });
  stream.parameter({ name: 'from', value: params.From });
  stream.parameter({ name: 'phoneId', value: phone._id.toString() });
  stream.parameter({ name: 'phoneNumber', value: params.To });
  stream.parameter({
    name: 'organizationId',
    value: phone.organization._id.toString(),
  });

  return response.toString();
}
```

---

#### 4. **Queue Processor**
Create a processor to check for available slots and handle queued calls:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class QueueProcessorService {
  constructor(
    private readonly callQueueService: CallQueueService,
    private readonly webhooksCommonService: WebhooksCommonService,
  ) {}

  async processQueue(organizationId: string) {
    const activeCalls = await this.webhooksCommonService.callsService.getCallsByStatus(
      organizationId,
      CallStatus.IN_PROGRESS,
    );

    const maxCalls = plansLimitations[organizationId].calls;

    while (activeCalls < maxCalls) {
      const nextCall = this.callQueueService.dequeueCall(organizationId);
      if (!nextCall) break; // No calls in the queue

      // Process the queued call (you can invoke callbackCall logic here)
      await this.processCall(nextCall);
    }
  }

  private async processCall(callDetails: any) {
    // Logic to process the queued call
    // Example: Dial the number, route to AI, etc.
    console.log('Processing queued call:', callDetails);
  }
}
```

---

#### 5. **Schedule Queue Processing**
Use a cron job or periodic task (e.g., with `@nestjs/schedule`) to periodically check and process the queue.

```typescript
import { Injectable } from '@nestjs/schedule';

@Injectable()
export class QueueScheduler {
  constructor(private readonly queueProcessorService: QueueProcessorService) {}

  @Interval(5000) // Check the queue every 5 seconds
  async handleQueueProcessing() {
    const organizations = await this.getOrganizationsWithQueues(); // Fetch all organizations with queues
    for (const organizationId of organizations) {
      await this.queueProcessorService.processQueue(organizationId);
    }
  }

  private async getOrganizationsWithQueues(): Promise<string[]> {
    // Logic to get organization IDs with active queues
    return [...this.callQueueService.getOrganizations()];
  }
}
```

---

### Key Features
- **Dynamic Call Management**: Automatically queues or routes calls based on active call limits.
- **Periodic Queue Processing**: Ensures queued calls are processed as slots become available.
- **Scalable Design**: Supports multiple organizations with independent queues.

Let me know if you need further help!