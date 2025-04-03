import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    fetchTasksStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchTasksSuccess: (state, action) => {
      state.loading = false;
      state.tasks = action.payload;
    },
    fetchTasksFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    updateTaskStatus: (state, action) => {
      const { taskId, status } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        task.status = status;
      }
    },
    addComment: (state, action) => {
      const { taskId, comment } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task) {
        if (!task.comments) {
          task.comments = [];
        }
        task.comments.push(comment);
      }
    },
    updateComment: (state, action) => {
      const { taskId, commentId, text } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task && task.comments) {
        const comment = task.comments.find(c => c.id === commentId);
        if (comment) {
          comment.text = text;
        }
      }
    },
    deleteComment: (state, action) => {
      const { taskId, commentId } = action.payload;
      const task = state.tasks.find(t => t.id === taskId);
      if (task && task.comments) {
        task.comments = task.comments.filter(c => c.id !== commentId);
      }
    },
  },
});

export const {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  setCurrentTask,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
  updateComment,
  deleteComment,
} = taskSlice.actions;

export default taskSlice.reducer; 