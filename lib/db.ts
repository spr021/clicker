import { User } from './definitions'

// Simple in-memory database for demo purposes
// In production, replace this with a real database (PostgreSQL, MongoDB, etc.)
const users: User[] = []

export const db = {
  // Get user by username
  getUserByUsername: async (username: string): Promise<User | undefined> => {
    return users.find((user) => user.username === username)
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User | undefined> => {
    return users.find((user) => user.id === id)
  },

  // Create new user
  createUser: async (username: string, hashedPassword: string): Promise<User> => {
    const newUser: User = {
      id: Math.random().toString(36).substring(2, 15),
      username,
      password: hashedPassword,
    }
    users.push(newUser)
    return newUser
  },

  // Get all users (for debugging)
  getAllUsers: async (): Promise<User[]> => {
    return users
  },
}
