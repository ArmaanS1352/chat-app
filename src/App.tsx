import './App.css'
import ChatLayout from './components/ChatLayout'
import { useEffect, useState } from 'react'
import type { User } from './types'
import { fetchUsers } from './users'
import LoginPage from './components/LoginPage'



function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  console.log("APP CURRENT USER: ", currentUser)

  if (!currentUser) {
    return <LoginPage setCurrentUser={setCurrentUser}/>
  }

  return <ChatLayout currentUser={currentUser}/>

}

export default App
