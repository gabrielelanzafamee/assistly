export enum MessageType {
	INBOUND = 'inbound',
	OUTBOUND = 'outbound',
}

export enum MessageStatus {
	SCHEDULED = 'scheduled',	
	ACCEPTED = 'accepted',
	QUEUED = 'queued',
	SENDING = 'sending',
	SENT = 'sent',
	DELIVERY_UNKNOWN = 'delivery_unknown',
	DELIVERED = 'delivered',
	UNDELIVERED = 'undelivered',
	FAILED = 'failed',
	RECEIVED = 'received',
	READ = 'read'
}