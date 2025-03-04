import { NestFactory , HttpAdapterHost} from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './all-exception.filter';
import * as cookieParser from 'cookie-parser'


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = ['http://localhost:3000', 'https://react-11-two.vercel.app/login','https://react-11-two.vercel.app'];
      
      if (!origin||allowedOrigins.includes(origin)) {
        callback(null, true); 
      } else {
      
        callback(new Error('CORS blocked: Origin not allowed'), false);
      }
    },
    methods: 'GET,POST,PUT,DELETE, OPTIONS', // Allowed HTTP methods
    allowedHeaders: 'Content-Type, Authorization', // Allowed headers
    credentials: true, // Allow cookies and credentials
  });

  const {httpAdapter}=app.get(HttpAdapterHost)
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter))
  
  await app.listen(process.env.PORT ?? 3500);
}
bootstrap();
