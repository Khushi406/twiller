# 🐦 Twiller - Twitter Clone

A full-stack Twitter clone built with **Next.js**, **Express.js**, and **MongoDB**. Features real-time tweeting, user authentication, profiles, and a responsive design that mimics the Twitter/X experience.

## ✨ Features

- 🔐 **User Authentication** - Secure signup/login with JWT tokens
- 🐦 **Tweet Creation** - Post tweets with character counting
- 👤 **User Profiles** - Customizable user profiles with avatars
- 🏠 **Timeline Feed** - Real-time tweet feed
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🎨 **Modern UI** - Clean interface using shadcn/ui components
- 🛡️ **Secure Backend** - Express.js with MongoDB and bcrypt password hashing

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **React Context** - State management for authentication

### Backend
- **Express.js** - Node.js web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
twiller/                 # Frontend (Next.js)
├── src/
│   ├── app/            # Next.js App Router
│   ├── components/     # React components
│   ├── contexts/       # React Context providers
│   ├── lib/           # Utility functions and API service
│   └── ...
└── package.json

BACKEND/                # Backend (Express.js)
├── models/            # MongoDB models
├── routes/            # API routes
├── middleware/        # Express middleware
├── server.js          # Server entry point
└── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/Khushi406/twiller.git
cd twiller
```

### 2. Setup Backend
```bash
cd BACKEND
npm install
```

Create a `.env` file in the BACKEND directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd ../twiller
npm install
```

Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/me` - Update user profile

### Tweets
- `GET /api/tweets` - Get all tweets
- `POST /api/tweets` - Create new tweet
- `POST /api/tweets/:id/like` - Like/unlike tweet

## 🎯 Features in Development

- [ ] Real-time notifications
- [ ] Tweet replies and threads
- [ ] Image upload for tweets
- [ ] Follow/Unfollow system
- [ ] Search functionality
- [ ] Direct messaging
- [ ] Tweet analytics

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

Created by **Khushi** - [GitHub](https://github.com/Khushi406)

## 🙏 Acknowledgments

- Inspired by Twitter/X design and functionality
- Built with modern web development best practices
- Thanks to the open-source community for amazing tools and libraries

---

⭐ If you found this project helpful, please give it a star on GitHub!