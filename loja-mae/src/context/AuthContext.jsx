import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user)
      setCarregando(false)
    })
    return unsubscribe
  }, [])

  const entrar = (email, senha) => signInWithEmailAndPassword(auth, email, senha)
  const criarConta = (email, senha) => createUserWithEmailAndPassword(auth, email, senha)
  const entrarComGoogle = () => signInWithPopup(auth, googleProvider)
  const sair = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ usuario, carregando, entrar, criarConta, entrarComGoogle, sair }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
