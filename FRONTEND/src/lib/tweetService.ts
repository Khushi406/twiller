import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  increment, 
  orderBy, 
  query, 
  serverTimestamp,
  where,
  limit,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { db } from '../lib/firebase'

export interface Tweet {
  id: string
  author: {
    id: string
    name: string
    username: string
    avatar: string
    verified: boolean
  }
  content: string
  timestamp: Date
  likes: number
  retweets: number
  replies: number
  image?: string
  likedBy?: string[]
  retweetedBy?: string[]
}

export interface CreateTweetData {
  content: string
  image?: string
  authorId: string
  authorName: string
  authorUsername: string
  authorAvatar: string
  authorVerified?: boolean
}

// Create a new tweet
export const createTweet = async (tweetData: CreateTweetData): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'tweets'), {
      author: {
        id: tweetData.authorId,
        name: tweetData.authorName,
        username: tweetData.authorUsername,
        avatar: tweetData.authorAvatar,
        verified: tweetData.authorVerified || false
      },
      content: tweetData.content,
      image: tweetData.image || null,
      timestamp: serverTimestamp(),
      likes: 0,
      retweets: 0,
      replies: 0,
      likedBy: [],
      retweetedBy: [],
      createdAt: serverTimestamp()
    })
    
    console.log('Tweet created with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating tweet:', error)
    throw new Error('Failed to create tweet')
  }
}

// Get all tweets (with pagination)
export const getTweets = async (limitCount: number = 20): Promise<Tweet[]> => {
  try {
    const q = query(
      collection(db, 'tweets'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const tweets: Tweet[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tweets.push({
        id: doc.id,
        author: data.author,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
        likes: data.likes || 0,
        retweets: data.retweets || 0,
        replies: data.replies || 0,
        image: data.image,
        likedBy: data.likedBy || [],
        retweetedBy: data.retweetedBy || []
      })
    })
    
    return tweets
  } catch (error) {
    console.error('Error getting tweets:', error)
    throw new Error('Failed to fetch tweets')
  }
}

// Get tweets by user
export const getUserTweets = async (userId: string, limitCount: number = 20): Promise<Tweet[]> => {
  try {
    const q = query(
      collection(db, 'tweets'),
      where('author.id', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    )
    
    const querySnapshot = await getDocs(q)
    const tweets: Tweet[] = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      tweets.push({
        id: doc.id,
        author: data.author,
        content: data.content,
        timestamp: data.timestamp?.toDate() || new Date(),
        likes: data.likes || 0,
        retweets: data.retweets || 0,
        replies: data.replies || 0,
        image: data.image,
        likedBy: data.likedBy || [],
        retweetedBy: data.retweetedBy || []
      })
    })
    
    return tweets
  } catch (error) {
    console.error('Error getting user tweets:', error)
    throw new Error('Failed to fetch user tweets')
  }
}

// Like a tweet
export const likeTweet = async (tweetId: string, userId: string): Promise<void> => {
  try {
    const tweetRef = doc(db, 'tweets', tweetId)
    
    // Note: In a real app, you'd want to check if user already liked to prevent duplicates
    // For now, we'll just increment the count
    await updateDoc(tweetRef, {
      likes: increment(1),
      likedBy: arrayUnion(userId)
    })
    
    console.log('Tweet liked successfully')
  } catch (error) {
    console.error('Error liking tweet:', error)
    throw new Error('Failed to like tweet')
  }
}

// Unlike a tweet
export const unlikeTweet = async (tweetId: string, userId: string): Promise<void> => {
  try {
    const tweetRef = doc(db, 'tweets', tweetId)
    
    await updateDoc(tweetRef, {
      likes: increment(-1),
      likedBy: arrayRemove(userId)
    })
    
    console.log('Tweet unliked successfully')
  } catch (error) {
    console.error('Error unliking tweet:', error)
    throw new Error('Failed to unlike tweet')
  }
}

// Retweet a tweet
export const retweetTweet = async (tweetId: string, userId: string): Promise<void> => {
  try {
    const tweetRef = doc(db, 'tweets', tweetId)
    
    await updateDoc(tweetRef, {
      retweets: increment(1),
      retweetedBy: arrayUnion(userId)
    })
    
    console.log('Tweet retweeted successfully')
  } catch (error) {
    console.error('Error retweeting tweet:', error)
    throw new Error('Failed to retweet tweet')
  }
}

// Unretweet a tweet
export const unretweetTweet = async (tweetId: string, userId: string): Promise<void> => {
  try {
    const tweetRef = doc(db, 'tweets', tweetId)
    
    await updateDoc(tweetRef, {
      retweets: increment(-1),
      retweetedBy: arrayRemove(userId)
    })
    
    console.log('Tweet unretweeted successfully')
  } catch (error) {
    console.error('Error unretweeting tweet:', error)
    throw new Error('Failed to unretweet tweet')
  }
}