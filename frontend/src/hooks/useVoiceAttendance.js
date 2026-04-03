// useVoiceAttendance.js — Web Speech API integration
// Listens for spoken student names and marks them present

import { useState, useRef, useCallback } from 'react'

export function useVoiceAttendance(students, onMatch) {
  const [listening,   setListening]   = useState(false)
  const [transcript,  setTranscript]  = useState('')  // what was heard
  const [matchedName, setMatchedName] = useState('')  // name that was matched
  const [error,       setError]       = useState('')
  const recognitionRef = useRef(null)

  // Check if browser supports Web Speech API
  const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice recognition is not supported in this browser. Try Chrome.')
      return
    }

    // Initialise the speech recognition engine
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.lang = 'en-IN'        // Indian English accent
    recognition.continuous = false    // stop after one phrase
    recognition.interimResults = false // only final results

    recognition.onstart = () => {
      setListening(true)
      setTranscript('')
      setMatchedName('')
      setError('')
    }

    recognition.onresult = (event) => {
      // Get the spoken text
      const spoken = event.results[0][0].transcript.toLowerCase().trim()
      setTranscript(spoken)

      // Try to match spoken name against student list
      // Uses fuzzy matching: checks if spoken text contains the student's first name
      const matched = students.find(student => {
        const firstName = student.name.split(' ')[0].toLowerCase()
        const fullName  = student.name.toLowerCase()
        return spoken.includes(firstName) || spoken.includes(fullName)
      })

      if (matched) {
        setMatchedName(matched.name)
        onMatch(matched.id, 'present') // mark them present
      } else {
        setError(`Could not match "${spoken}" to any student. Try again.`)
      }
    }

    recognition.onerror = (event) => {
      setError(`Voice error: ${event.error}. Please try again.`)
      setListening(false)
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
  }, [students, onMatch, isSupported])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setListening(false)
  }, [])

  return {
    listening, transcript, matchedName, error, isSupported,
    startListening, stopListening
  }
}