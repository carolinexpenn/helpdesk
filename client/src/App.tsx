import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setMessage(data.status))
      .catch(() => setMessage('Error reaching server'))
  }, [])

  return (
    <div>
      <h1>Helpdesk</h1>
      <p>API health: {message}</p>
    </div>
  )
}

export default App
