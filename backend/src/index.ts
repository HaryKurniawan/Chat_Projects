import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';
import adminRoutes from './routes/adminRoutes';
import logger from './utils/logger';
import prisma from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

app.set('io', io);

io.on('connection', (socket: Socket) => {
  logger.info(`User connected via socket: ${socket.id}`);

  // When user joins their own private room
  socket.on('join', (userId: string | number) => {
    socket.join(`user_${userId}`);
    logger.info(`Socket ${socket.id} joined room user_${userId}`);
  });

  socket.on('sendMessage', async (data: any) => {
    try {
      const { senderId, receiverId, content } = data;
      
      const message = await prisma.message.create({
        data: {
          senderId,
          receiverId,
          content,
        },
        include: {
          sender: { select: { id: true, name: true, email: true } },
          receiver: { select: { id: true, name: true, email: true } },
        }
      });

      // Emit to receiver's room
      io.to(`user_${receiverId}`).emit('receiveMessage', message);
      // Emit back to sender's room
      io.to(`user_${senderId}`).emit('receiveMessage', message);
    } catch (error) {
      logger.error('Error saving message via socket', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  socket.on('disconnect', () => {
    logger.info(`User disconnected: ${socket.id}`);
  });
});


/**
 * =============================================================
 * [OWASP A02 - Security Misconfiguration]
 * 
 * Helmet secara otomatis menambahkan HTTP security headers seperti:
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - Strict-Transport-Security (HSTS)
 * - X-XSS-Protection
 * 
 * Tanpa headers ini, browser tidak memiliki instruksi keamanan
 * tambahan dan aplikasi lebih rentan terhadap clickjacking,
 * MIME-type sniffing, dan serangan lainnya.
 * =============================================================
 */
app.use(helmet());

/**
 * =============================================================
 * [OWASP A02 - Security Misconfiguration]
 * 
 * CORS dikonfigurasi SECARA KETAT hanya untuk origin frontend.
 * Sebelumnya: app.use(cors()) — mengizinkan SEMUA origin.
 * Ini berbahaya karena website manapun bisa mengirim request
 * ke API kita dan mengakses data pengguna.
 * 
 * credentials: true diperlukan agar browser mengirim HttpOnly
 * cookie pada cross-origin request.
 * =============================================================
 */
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}));

/**
 * =============================================================
 * [OWASP A04 - Cryptographic Failures]
 * 
 * Cookie parser diperlukan agar Express bisa membaca HttpOnly
 * cookie yang berisi JWT token. Ini JAUH lebih aman daripada
 * mengirim token melalui response body lalu menyimpannya
 * di localStorage (yang bisa dicuri via XSS).
 * =============================================================
 */
app.use(cookieParser());

/**
 * =============================================================
 * [OWASP A05 - Injection]
 * 
 * Membatasi ukuran request body ke 10KB untuk mencegah:
 * - Serangan denial-of-service via payload besar
 * - Injection via JSON body yang sangat panjang
 * 
 * Untuk aplikasi upload file, batas ini perlu disesuaikan.
 * =============================================================
 */
app.use(express.json({ limit: '10kb' }));

/**
 * =============================================================
 * [OWASP A06 - Insecure Design]
 * 
 * Rate limiter GLOBAL membatasi setiap IP address maksimal
 * 100 request per 15 menit. Ini mencegah:
 * - Brute force attack
 * - DDoS dari satu sumber
 * - Automated bot abuse
 * 
 * Endpoint login/register punya rate limiter LEBIH KETAT 
 * yang dikonfigurasi di file routes.
 * =============================================================
 */
const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 menit
  max: 500, // Maks 500 request per window
  message: {
    message: 'Terlalu banyak request dari IP ini, coba lagi setelah 5 menit.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// App routes
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('Simple Backend API running with Chat');
});

httpServer.listen(PORT, () => {
  logger.info(`Server berjalan di http://localhost:${PORT}`);
});
