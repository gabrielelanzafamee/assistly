# Assistly

A modern, scalable customer service platform built with NestJS and Angular, featuring AI-powered interactions, customer management, and multi-channel communication capabilities.

## Features

- AI-powered customer interactions
- Comprehensive customer management
- Multi-channel communication (Email, SMS, WhatsApp)
- Real-time updates with WebSocket
- Customer analytics and insights
- Role-based access control
- Multi-organization support
- Custom tools integration
- Voice call support
- WhatsApp integration
- SMS capabilities
- Knowledge base management
- Automatic responses
- Analytics dashboard

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Angular CLI (npm install -g @angular/cli)

## Getting Started

1. Clone the repository:
- `git clone https://github.com/gabrielelanzafamee/assistly.git`
- `cd assistly`

2. Environment Setup
Create .env file in the root directory with the following variables:

```
# Database
MONGODB_URI=mongodb://localhost:27017/your-database

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=30d

# OpenAI
OPENAI_API_KEY=your-openai-api-key
OPENAI_ORGANIZATION=your-openai-organization

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-phone

# ElevenLabs (Optional - for voice synthesis)
ELEVEN_LABS_API_KEY=your-eleven-labs-key

# Deepgram (Optional - for real-time speech recognition)
DEEPGRAM_API_KEY=your-eleven-labs-key

# System
PORT=3000
BASE_URL=http://localhost:3000
NODE_ENV=development
```

3. Install Dependencies

For the backend:
- `npm install`

For the frontend:
- `cd public`
- `npm install`

4. Run the Application

Start the backend server:
- `npm run start:dev`

Start the frontend application:
- `cd public`
- `npm run start`

The application will be available at:
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api/v1

## Project Structure
```
src/                  # Backend source code (NestJS)
├── core/            # Core functionality
│   ├── config/      # Configuration
│   ├── decorators/  # Custom decorators
│   ├── guards/      # Auth guards
│   └── interfaces/  # TypeScript interfaces
├── customers/       # Customer management
├── messages/        # Messaging system
├── calls/           # Call handling
├── openai/          # AI integration
└── websockets/      # Real-time communication
public/              # Frontend source code (Angular)
├── src/
│   ├── modules/     # Feature modules
│   ├── shared/      # Shared components
│   └── core/        # Core services
```

## Configuration

1. OpenAI Setup
- Create an account at OpenAI (https://openai.com)
- Get your API key from the dashboard
- Add it to your .env file

2. Twilio Setup
- Create an account at Twilio (https://www.twilio.com)
- Get your Account SID and Auth Token
- Purchase a phone number
- Add credentials to your .env file

3. ElevenLabs Setup (Optional)
- Create an account at ElevenLabs (https://elevenlabs.io)
- Get your API key
- Add it to your .env file

4. Deepgram Setup (Optional)
- Create an account at Deepgram (https://deepgram.com)
- Get your API key
- Add it to your .env file

## Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

Please ensure your PR adheres to our coding standards and includes appropriate tests.

## Running Tests

Backend tests:
- `npm run test`
- `npm run test:e2e`

Frontend tests:
- `cd public`
- `ng test`

## API Documentation

API documentation is automatically generated using Swagger and is available at http://localhost:5000/api/v1 when running the development server.

## Security Features

- JWT authentication
- Role-based access control
- Organization-level data isolation
- Input validation
- Rate limiting
- CORS protection

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you find this project useful, please give it a star on GitHub!

For questions and support:
- Open an issue

## Acknowledgments

- NestJS (https://nestjs.com/) - The backend framework
- Angular (https://angular.io/) - The frontend framework
- OpenAI (https://openai.com/) - AI capabilities
- Twilio (https://www.twilio.com/) - Communication services
- ElevenLabs (https://elevenlabs.io/) - Voice synthesis
- MongoDB (https://www.mongodb.com/) - Database
- All our amazing contributors!

## Additional Resources

- NestJS Documentation: https://docs.nestjs.com/
- Angular Documentation: https://angular.io/docs
- OpenAI API Documentation: https://platform.openai.com/docs/
- Twilio Documentation: https://www.twilio.com/docs
