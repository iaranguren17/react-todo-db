import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { supabase } from './lib/supabaseClient'
import './App.css'

type Todo = {
  id: number
  text: string
  created_at?: string
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  async function fetchTodos() {
    setLoading(true)

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching todos:', error)
    } else {
      setTodos((data ?? []) as Todo[])
    }

    setLoading(false)
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const { data, error } = await supabase
      .from('todos')
      .insert({ text: inputValue.trim() })
      .select()

    if (error) {
      console.error('Error adding todo:', error)
    } else if (data && data.length > 0) {
      setTodos([...todos, data[0] as Todo])
      setInputValue('')
    }
  }

  const deleteTodo = async (id: number) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
    } else {
      setTodos(todos.filter((todo) => todo.id !== id))
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <div className="app">
      <h1>React Todo App</h1>

      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Add a new todo..."
          value={inputValue}
          onChange={handleChange}
        />
        <button type="submit">Add</button>
      </form>

      {loading ? (
        <p>Loading todos...</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className="todo-item">
              <span>{todo.text}</span>
              <button
                className="delete-btn"
                onClick={() => deleteTodo(todo.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default App
