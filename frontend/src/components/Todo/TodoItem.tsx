import React, { useState, useRef, useEffect } from 'react'
import { Todo } from '../../generated/graphql'
import { useMutation } from '@apollo/client'
import { DELETE_TODO, UPDATE_TODO } from './graphql/mutations'
import toast from 'react-hot-toast'
import { GET_TODOS } from './graphql/queries'

type TodoItemProps = {
  todo: Todo
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const [updateTodo] = useMutation(UPDATE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  })
  const [deleteTodo] = useMutation(DELETE_TODO, {
    refetchQueries: [{ query: GET_TODOS }],
  })

  const [editMode, setEditMode] = useState(false)
  const [editText, setEditText] = useState('')
  const [loading, setLoading] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  const handleClickOutside = (event: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
      const target = event.target as HTMLElement
      if (target.innerText !== 'Update' && target.innerText !== 'Delete') {
        // Update・Deleteボタンがクリックされた場合は早期に終了
        setEditMode(false)
        setEditText(todo.text)
      }
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleUpdateTodo = async (todo: Todo) => {
    try {
      setLoading(true)
      setEditMode(false)
      await updateTodo({
        variables: {
          todoId: todo.id,
          text: editText || todo.text,
        },
      })
      setEditText('')
    } catch (err) {
      toast.error('Something Went Wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTodo = async (todo: Todo) => {
    try {
      setLoading(true)
      setEditMode(false)
      await deleteTodo({
        variables: {
          todoId: todo.id,
        },
      })
      setEditText('')
    } catch (err) {
      toast.error('Something Went Wrong')
    } finally {
      setLoading(false)
    }
  }

  const toggleTodoCompleted = async (todo: Todo) => {
    try {
      await updateTodo({
        variables: {
          todoId: todo.id,
          text: todo.text,
          completed: !todo.completed,
        },
      })
    } catch (err) {
      toast.error('Something Went Wrong')
    }
  }

  return (
    <li className="flex justify-center mt-3">
      {editMode ? (
        <input
          ref={inputRef}
          className="p-2 rounded-md shadow-md border border-gray-300 focus:outline-none"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          disabled={loading}
        />
      ) : (
        <div
          className={`${
            todo.completed ? 'line-through' : ''
          } flex items-center`}
        >
          <span
            onDoubleClick={() => {
              setEditMode(true)
              setEditText(todo.text)
            }}
          >
            {todo.text}
          </span>
        </div>
      )}
      <div className="ml-3 flex items-center">
        {editMode ? (
          <>
            <button
              onClick={() => {
                handleUpdateTodo(todo)
              }}
              className="border rounded-md shadow-md cursor-pointer py-2 px-4 bg-indigo-500 text-white hover:opacity-70 transition duration-200 disabled:cursor-not-allowed disabled:bg-indigo-200"
              disabled={loading}
            >
              Update
            </button>
            <button
              onClick={() => {
                handleDeleteTodo(todo)
              }}
              className="border rounded-md shadow-md cursor-pointer py-2 px-4 bg-rose-500 text-white hover:opacity-70 transition duration-200"
              disabled={loading}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            {' '}
            <input
              className="w-6 h-6 mt-1 cursor-pointer"
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodoCompleted(todo)}
            />
          </>
        )}
      </div>
    </li>
  )
}

export default TodoItem
