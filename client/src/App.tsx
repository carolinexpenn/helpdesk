import axios from 'axios'
import { useQuery } from '@tanstack/react-query'

function App() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['health'],
    queryFn: () => axios.get('/api/health').then((res) => res.data.status),
  })

  const message = isPending ? 'Loading...' : isError ? 'Error reaching server' : data

  return (
    <div>
      <h1>Helpdesk</h1>
      <p>API health: {message}</p>
    </div>
  )
}

export default App
