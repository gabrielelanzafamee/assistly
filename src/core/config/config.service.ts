import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { Injectable } from '@nestjs/common';

const env = dotenv.parse(
	fs.readFileSync(
		path.join(
			__dirname,
			'../../..',
			process.env.NODE_ENV === 'production' ? '.env' : '.env.dev',
		),
	),
);

for (const k in env) {
	process.env[k] = env[k];
}

@Injectable()
export class ConfigService {
	getOpenAIConfig() {
		return {
			apiKey: process.env.OPENAI_API_KEY,
			model: process.env.OPENAI_MODEL,
			embeddingModel: process.env.OPENAI_EMBEDDING_MODEL,
		};
	}

	getSystemConfig() {
		return {
			baseUrl: process.env.BASE_URL || 'http://localhost:5000',
			debug: process.env.NODE_ENV !== 'production',
			port: parseInt(process.env.PORT) || 3000,
			mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/nest',
			jwtSecret: process.env.JWT_SECRET,
			jwtExpiration: process.env.JWT_EXPIRATION,
			openai: {
				OPENAI_API_KEY: process.env.OPENAI_API_KEY,
				OPENAI_MODEL: process.env.OPENAI_MODEL,
				OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL,
			},
			elevenlabs: {
				ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
				ELEVENLABS_MODEL: process.env.ELEVENLABS_MODEL,
				ELEVENLABS_VOICE: process.env.ELEVENLABS_VOICE,
			},
			deepgram: {
				DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
				DEEPGRAM_MODEL: process.env.DEEPGRAM_MODEL,
			},
			twilio: {
				TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
				TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
				TWILIO_BUNDLE_SID: process.env.TWILIO_BUNDLE_SID,
				TWILIO_ADDRESS_SID: process.env.TWILIO_ADDRESS_SID,
			},
		};
	}
}
