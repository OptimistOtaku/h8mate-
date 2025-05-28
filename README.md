# H8 Mate - Classmate Tier List

A fun web application where you can create tier lists for your classmates. Built with Next.js, TypeScript, and MongoDB.

## Features

- Create and manage tier lists for classmates
- Drag and drop interface for easy organization
- User authentication
- Comments on classmates
- Responsive design
- Real-time updates

## Tech Stack

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [MongoDB](https://www.mongodb.com/) - Database
- [NextAuth.js](https://next-auth.js.org) - Authentication
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [dnd-kit](https://dnd-kit.com/) - Drag and drop functionality

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/h8mate-.git
cd h8mate-
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and create a new project

3. Import your GitHub repository

4. Configure the following environment variables in Vercel:
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
   - `NEXTAUTH_URL`: Your production URL (Vercel will set this automatically)

5. Deploy!

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `NEXTAUTH_URL`: Base URL of your application

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
