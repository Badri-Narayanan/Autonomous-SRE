import { useState, useEffect } from 'react'

export default function TypewriterText({ text, speed = 30 }) {
  const [displayed, setDisplayed] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!text) return
    setDisplayed('')
    setIndex(0)
  }, [text])

  useEffect(() => {
    if (text && index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed(prev => prev + text[index])
        setIndex(index + 1)
      }, speed)
      return () => clearTimeout(timeout)
    }
  }, [index, text, speed])

  return <span>{displayed}</span>
}
