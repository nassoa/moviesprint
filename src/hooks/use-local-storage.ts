"use client"

import { useState, useEffect } from "react"

export function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Initialiser l'état avec la valeur du localStorage lors du premier rendu
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(error)
      return initialValue
    }
  })

  // Synchroniser avec localStorage quand la valeur change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue))
      } catch (error) {
        console.error(error)
      }
    }
  }, [key, storedValue])

  // Fonction pour mettre à jour la valeur
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permettre la valeur d'être une fonction
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Sauvegarder l'état
      setStoredValue(valueToStore)

      // Note: Pas besoin de sauvegarder dans localStorage ici
      // car le useEffect ci-dessus s'en chargera
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}
