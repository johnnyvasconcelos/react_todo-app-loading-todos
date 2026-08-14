/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import {
  USER_ID,
  getTodos,
  addTodo,
  removeTodo,
  updateTodo,
  updateTodoApi,
} from './api/todos';
import { Todo } from './types/Todo';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [err, setErr] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [editValue, setEditValue] = useState(inputValue);
  const [isCheck, setIsCheck] = useState(false);
  const [isEdit, setIsEdit] = useState<number | null>(null);
  const [filterActive, setFilterActive] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTodos();

        setTodos(data);
      } catch (error) {
        /* eslint-disable-next-line no-console */
        console.error(error);
        setErr('Unable to load todos');
      }
    };

    load();
  }, []);

  useEffect(() => {
    const check = todos.some(todo => todo.completed === true);

    if (check) {
      setIsCheck(true);
    }
  }, [todos]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputValue === '') {
      setErr('Title should not be empty');
    } else {
      setErr('');
      try {
        const newTodo = {
          id: 0,
          userId: USER_ID,
          title: inputValue,
          completed: false,
        };

        setTodos(prevTodos => {
          return [...prevTodos, newTodo];
        });

        addTodo(newTodo);
      } catch (error) {
        /* eslint-disable-next-line no-console */
        console.error(error);
        setErr('Unable to update a todo');
      }
    }
  };

  const handleDelete = (id: number) => {
    try {
      const newTodos = todos.filter(todo => {
        return todo.id !== id;
      });

      setTodos(newTodos);

      removeTodo(id);
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(error);
      setErr('Unable to delete a todo');
    }
  };

  const checkTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);

    if (!todo) {
      return;
    }

    const completed = !todo?.completed;

    try {
      await updateTodo(id, { completed });

      setTodos(prevTodos =>
        prevTodos.map(t => (t.id === id ? { ...t, completed } : t)),
      );
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(error);
      setErr('Unable to update todo');
    }
  };

  const handleUpdate = async (id: number) => {
    const todo = todos.find(t => t.id === id);

    if (!todo) {
      return;
    }

    try {
      await updateTodoApi(id, { title: editValue });

      setTodos(prevTodos =>
        prevTodos.map(t => (t.id === id ? { ...t, title: editValue } : t)),
      );
    } catch (error) {
      /* eslint-disable-next-line no-console */
      console.error(error);
      setErr('Unable to update todo');
    }
  };

  // filtros
  const filterLink = async (filter: string) => {
    if (filter === 'all') {
      setFilterActive('all');
      try {
        const data = await getTodos();

        setTodos(data);
      } catch (error) {
        /* eslint-disable-next-line no-console */
        console.error(error);
        setErr('Unable to load todos');
      }
    } else if (filter === 'active') {
      setFilterActive('active');
      setTodos(
        todos.filter(todo => {
          return todo.completed === false;
        }),
      );
    } else if (filter === 'completed') {
      setFilterActive('completed');
      setTodos(
        todos.filter(todo => {
          return todo.completed === true;
        }),
      );
    }
  };

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form onSubmit={handleSubmit}>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              onChange={e => {
                setInputValue(e.target.value);
              }}
              value={inputValue}
            />
          </form>
        </header>

        {todos.length !== 0 && (
          <section className="todoapp__main" data-cy="TodoList">
            {/* This is a completed todo */}
            {todos.map(todo => (
              <div
                key={todo.id}
                data-cy="Todo"
                className={`todo ${todo.completed ? 'completed' : ''}`}
              >
                <label
                  className="todo__status-label"
                  onClick={() => {
                    checkTodo(todo.id);
                  }}
                >
                  <input
                    data-cy="TodoStatus"
                    type="checkbox"
                    className="todo__status"
                    checked={todo.completed}
                  />
                </label>

                {isEdit === todo.id && (
                  <input
                    data-cy="TodoTitleField"
                    type="text"
                    className="todo__title-field"
                    placeholder="Empty todo will be deleted"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        setIsEdit(null);
                        handleUpdate(todo.id);
                      }
                    }}
                    onChange={e => {
                      setEditValue(e.target.value);
                    }}
                    value={editValue}
                  />
                )}

                {isEdit !== todo.id && (
                  <span
                    data-cy="TodoTitle"
                    className="todo__title"
                    onDoubleClick={() => {
                      setIsEdit(todo.id);
                      setEditValue(todo.title);
                    }}
                  >
                    {todo.title}
                  </span>
                )}

                {/* Remove button appears only on hover */}
                <button
                  type="button"
                  className="todo__remove"
                  data-cy="TodoDelete"
                  onClick={() => {
                    handleDelete(todo.id);
                  }}
                >
                  ×
                </button>

                {/* overlay will cover the todo while it is being deleted or updated */}
                <div data-cy="TodoLoader" className="modal overlay">
                  <div
                    className="
                      modal-background 
                      has-background-white-ter"
                  />
                  <div className="loader" />
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Hide the footer if there are no todos */}
        {todos.length !== 0 && (
          <footer className="todoapp__footer" data-cy="Footer">
            <span className="todo-count" data-cy="TodosCounter">
              3 items left
            </span>

            {/* Active link should have the 'selected' class */}
            <nav className="filter" data-cy="Filter">
              <a
                href="#/"
                className={`filter__link ${filterActive === 'all' ? 'selected' : ''}`}
                data-cy="FilterLinkAll"
                onClick={() => {
                  filterLink('all');
                }}
              >
                All
              </a>

              <a
                href="#/active"
                className={`filter__link ${filterActive === 'active' ? 'selected' : ''}`}
                data-cy="FilterLinkActive"
                onClick={() => {
                  filterLink('active');
                }}
              >
                Active
              </a>

              <a
                href="#/completed"
                className={`filter__link ${filterActive === 'completed' ? 'selected' : ''}`}
                data-cy="FilterLinkCompleted"
                onClick={() => {
                  filterLink('completed');
                }}
              >
                Completed
              </a>
            </nav>

            {/* this button should be disabled if there are no completed todos */}
            <button
              type="button"
              className={`todoapp__clear-completed ${isCheck ? 'is-hidden' : ''}`}
              data-cy="ClearCompletedButton"
            >
              Clear completed
            </button>
          </footer>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${err.length === 0 ? 'hidden' : ''}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => {
            setErr('');
          }}
        />
        {/* show only one message at a time */}
        {err.length > 0 && <span>{err}</span>}
        {/*
        <br />
        Unable to add a todo
        <br />
        Unable to update a todo
        */}
      </div>
    </div>
  );
};
