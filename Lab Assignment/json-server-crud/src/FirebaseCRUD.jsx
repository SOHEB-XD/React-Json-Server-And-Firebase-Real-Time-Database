// src/FirebaseCRUD.js
import React, { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import './FirebaseCRUD.css';

function FirebaseCRUD() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        fetchTasks();
      } else {
        setTasks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Google Sign In
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Google sign-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError('Sign out failed: ' + err.message);
    }
  };

  // Fetch tasks in real-time
  const fetchTasks = () => {
    if (!user) return;

    const tasksQuery = query(
      collection(db, 'users', user.uid, 'tasks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(tasksQuery, 
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(tasksData);
      },
      (err) => {
        setError('Failed to fetch tasks: ' + err.message);
      }
    );

    return unsubscribe;
  };

  // CREATE - Add new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await addDoc(collection(db, 'users', user.uid, 'tasks'), {
        text: taskInput,
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setTaskInput('');
    } catch (err) {
      setError('Failed to add task: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // UPDATE - Toggle task completion
  const toggleTask = async (taskId, completed) => {
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await updateDoc(taskRef, {
        completed: !completed,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      setError('Failed to update task: ' + err.message);
    }
  };

  // UPDATE - Edit task text
  const updateTask = async (taskId, newText) => {
    if (!newText.trim()) return;

    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await updateDoc(taskRef, {
        text: newText,
        updatedAt: serverTimestamp()
      });
      setEditingTask(null);
    } catch (err) {
      setError('Failed to update task: ' + err.message);
    }
  };

  // DELETE - Remove task
  const deleteTask = async (taskId) => {
    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (err) {
      setError('Failed to delete task: ' + err.message);
    }
  };

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1>Firebase Task Manager</h1>
          <p>Please sign in to manage your tasks</p>
          <button 
            onClick={signInWithGoogle} 
            disabled={loading}
            className="google-signin-btn"
          >
            {loading ? 'Signing In...' : 'Sign in with Google'}
          </button>
          {error && <div className="error">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="firebase-container">
      <header className="app-header">
        <div>
          <h1>Firebase Task Manager</h1>
          <p>Welcome, {user.displayName}!</p>
        </div>
        <button onClick={handleSignOut} className="signout-btn">
          Sign Out
        </button>
      </header>

      {error && <div className="error">{error}</div>}

      {/* Add Task Form */}
      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Enter a new task..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !taskInput.trim()}>
          {loading ? 'Adding...' : 'Add Task'}
        </button>
      </form>

      {/* Tasks List */}
      <div className="tasks-container">
        <h2>Your Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <p className="no-tasks">No tasks yet. Add your first task above!</p>
        ) : (
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                {editingTask === task.id ? (
                  <input
                    type="text"
                    defaultValue={task.text}
                    onBlur={(e) => updateTask(task.id, e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateTask(task.id, e.target.value);
                      }
                    }}
                    autoFocus
                  />
                ) : (
                  <>
                    <span 
                      className="task-text"
                      onDoubleClick={() => setEditingTask(task.id)}
                    >
                      {task.text}
                    </span>
                    <div className="task-actions">
                      <button
                        onClick={() => toggleTask(task.id, task.completed)}
                        className={`toggle-btn ${task.completed ? 'undo' : 'complete'}`}
                      >
                        {task.completed ? 'Undo' : 'Complete'}
                      </button>
                      <button
                        onClick={() => setEditingTask(task.id)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FirebaseCRUD;