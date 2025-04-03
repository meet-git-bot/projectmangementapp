import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  List,
  ListItem,
  ListItemText,
  Divider,
  InputAdornment,
  Grid,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import {
  fetchTasksStart,
  fetchTasksSuccess,
  fetchTasksFailure,
  addTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment,
  updateComment,
  deleteComment,
} from '../store/slices/taskSlice';
import { addLog } from '../store/slices/activityLogSlice';
import axios from 'axios';

const Tasks = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((state) => state.tasks);
  const { role, user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [openComment, setOpenComment] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
    assignedTo: '',
  });
  

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'title',
    direction: 'ascending',
  });
  

  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        dispatch(fetchTasksStart());
        const response = await axios.get('https://dummyjson.com/todos');
        const tasksData = response.data.todos.map((todo) => ({
          id: todo.id,
          title: todo.todo,
          description: `Description for ${todo.todo}`,
          status: todo.completed ? 'completed' : 'pending',
          userId: todo.userId,
          comments: [],
        }));
        dispatch(fetchTasksSuccess(tasksData));
      } catch (error) {
        dispatch(fetchTasksFailure(error.message));
      }
    };

    fetchTasks();
    

    const fetchUsers = async () => {
      try {
        const response = await axios.get('https://dummyjson.com/users');
        setUsers(response.data.users);
        setFilteredUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, [dispatch]);

  const handleOpen = (task = null) => {

    if (role !== 'manager' && role !== 'admin') {
      return;
    }
    
    if (task) {
      setEditTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        status: task.status,
        assignedTo: task.assignedTo || '',
      });
    } else {
      setEditTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        assignedTo: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTask(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
      assignedTo: '',
    });
  };

  const handleCommentOpen = (task) => {
    setSelectedTask(task);
    setComment('');
    setEditingComment(null);
    setOpenComment(true);
  };

  const handleCommentClose = () => {
    setOpenComment(false);
    setSelectedTask(null);
    setComment('');
    setEditingComment(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
   
    if (role !== 'manager' && role !== 'admin') {
      return;
    }
    

    if (role === 'manager' && !formData.assignedTo) {
      alert('Please assign the task to a user');
      return;
    }
    
    const taskData = {
      ...formData,
      id: editTask ? editTask.id : Date.now(),
      userId: user.id,
    };

    if (editTask) {
      dispatch(updateTask(taskData));
      dispatch(addLog({
        userName: user.name,
        action: 'updated',
        details: `Updated task: ${taskData.title}`,
        timestamp: new Date().toISOString(),
      }));
    } else {
      dispatch(addTask(taskData));
      dispatch(addLog({
        userName: user.name,
        action: 'created',
        details: `Created new task: ${taskData.title}`,
        timestamp: new Date().toISOString(),
      }));
    }
    handleClose();
  };

  const handleDelete = (taskId) => {
  
    if (role !== 'admin' && role !== 'manager') {
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      const taskToDelete = tasks.find(t => t.id === taskId);
      dispatch(deleteTask(taskId));
      dispatch(addLog({
        userName: user.name,
        action: 'deleted',
        details: `Deleted task: ${taskToDelete.title}`,
        timestamp: new Date().toISOString(),
      }));
    }
  };

  const handleStatusChange = (taskId, newStatus) => {
   
    if (role !== 'employee') {
      return;
    }
    
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      dispatch(updateTaskStatus({ taskId, status: newStatus }));
      dispatch(addLog({
        userName: user.name,
        action: 'updated',
        details: `Updated task status: ${task.title} to ${newStatus}`,
        timestamp: new Date().toISOString(),
      }));
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (comment.trim()) {
      if (editingComment) {
     
        dispatch(updateComment({
          taskId: selectedTask.id,
          commentId: editingComment.id,
          text: comment,
        }));
        dispatch(addLog({
          userName: user.name,
          action: 'updated',
          details: `Updated comment on task: ${selectedTask.title}`,
          timestamp: new Date().toISOString(),
        }));
      } else {

        dispatch(addComment({
          taskId: selectedTask.id,
          comment: {
            id: Date.now(),
            text: comment,
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
          },
        }));
        dispatch(addLog({
          userName: user.name,
          action: 'commented',
          details: `Added comment to task: ${selectedTask.title}`,
          timestamp: new Date().toISOString(),
        }));
      }
      handleCommentClose();
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setComment(comment.text);
  };

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      dispatch(deleteComment({
        taskId: selectedTask.id,
        commentId,
      }));
      dispatch(addLog({
        userName: user.name,
        action: 'deleted',
        details: `Deleted comment from task: ${selectedTask.title}`,
        timestamp: new Date().toISOString(),
      }));
    }
  };


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };
  
  
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };
  

  const filteredAndSortedTasks = React.useMemo(() => {
    let result = [...tasks];
    

    if (searchTerm) {
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    

    if (statusFilter !== 'all') {
      result = result.filter((task) => task.status === statusFilter);
    }
    
  
    result.sort((a, b) => {
      if (sortConfig.key === 'title') {
        return sortConfig.direction === 'ascending'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortConfig.key === 'status') {
        return sortConfig.direction === 'ascending'
          ? a.status.localeCompare(b.status)
          : b.status.localeCompare(a.status);
      }
      return 0;
    });
    
    return result;
  }, [tasks, searchTerm, statusFilter, sortConfig]);


  const handleUserSearch = (event) => {
    const searchValue = event.target.value;
    setUserSearchTerm(searchValue);
    
    if (searchValue.trim() === '') {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => 
        user.firstName.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchValue.toLowerCase()) ||
        user.email.toLowerCase().includes(searchValue.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };
  

  const handleUserSelect = (selectedUser) => {
    setFormData({ ...formData, assignedTo: selectedUser.id.toString() });
    setUserDropdownOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Tasks</Typography>
        {role === 'manager' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Task
          </Button>
        )}
      </Box>
      
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <Select
              value={statusFilter}
              onChange={handleFilterChange}
              displayEmpty
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell 
                onClick={() => handleSort('title')}
                sx={{ cursor: 'pointer' }}
              >
                Title {getSortIcon('title')}
              </TableCell>
              <TableCell>Description</TableCell>
              <TableCell 
                onClick={() => handleSort('status')}
                sx={{ cursor: 'pointer' }}
              >
                Status {getSortIcon('status')}
              </TableCell>
              {(role === 'admin' || role === 'manager') && (
                <TableCell>Assign To</TableCell>
              )}
              {role !== 'user' && (
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedTasks
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    {role === 'employee' ? (
                      <FormControl size="small">
                        <Select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value)}
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="in-progress">In Progress</MenuItem>
                          <MenuItem value="completed">Completed</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Chip
                        label={task.status}
                        color={
                          task.status === 'completed' 
                            ? 'success' 
                            : task.status === 'in-progress'
                            ? 'primary'
                            : 'warning'
                        }
                        size="small"
                      />
                    )}
                  </TableCell>
                  {(role === 'admin' || role === 'manager') && (
                    <TableCell>
                      <Box sx={{ position: 'relative' }}>
                        <TextField
                          size="small"
                          value={task.assignedTo ? users.find(u => u.id.toString() === task.assignedTo)?.firstName || task.assignedTo : ''}
                          onClick={() => {
                            setSelectedTask(task);
                            setUserDropdownOpen(true);
                          }}
                          placeholder="Assign to user"
                          sx={{ width: 150 }}
                          InputProps={{
                            readOnly: true,
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setUserDropdownOpen(true);
                                  }}
                                >
                                  <SearchIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ),
                          }}
                        />
                        {userDropdownOpen && selectedTask && selectedTask.id === task.id && (
                          <Paper 
                            sx={{ 
                              position: 'absolute', 
                              zIndex: 1, 
                              width: '100%', 
                              maxHeight: 200, 
                              overflow: 'auto',
                              mt: 0.5
                            }}
                          >
                            <TextField
                              size="small"
                              placeholder="Search users..."
                              value={userSearchTerm}
                              onChange={handleUserSearch}
                              fullWidth
                              sx={{ p: 1 }}
                            />
                            <List dense>
                              {filteredUsers.map((user) => (
                                <ListItem 
                                  key={user.id} 
                                  button 
                                  onClick={() => {
                                    const updatedTask = {
                                      ...task,
                                      assignedTo: user.id.toString(),
                                    };
                                    dispatch(updateTask(updatedTask));
                                    dispatch(addLog({
                                      userName: user.name,
                                      action: 'updated',
                                      details: `Assigned task: ${task.title} to user: ${user.firstName} ${user.lastName}`,
                                      timestamp: new Date().toISOString(),
                                    }));
                                    setUserDropdownOpen(false);
                                  }}
                                >
                                  <ListItemText 
                                    primary={`${user.firstName} ${user.lastName}`} 
                                    secondary={user.email} 
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Paper>
                        )}
                      </Box>
                    </TableCell>
                  )}
                  {role !== 'user' && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {role === 'employee' && (
                          <IconButton
                            size="small"
                            onClick={() => handleCommentOpen(task)}
                          >
                            <CommentIcon />
                          </IconButton>
                        )}
                        {(role === 'manager' || role === 'admin') && (
                          <IconButton
                            size="small"
                            onClick={() => handleOpen(task)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {(role === 'admin' || role === 'manager') && (
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(task.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {filteredAndSortedTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={
                  role === 'user' ? 3 : 
                  (role === 'admin' || role === 'manager') ? 5 : 4
                } align="center">
                  No tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSortedTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

    
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editTask ? 'Edit Task' : 'Add New Task'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={4}
              required
            />
            <FormControl fullWidth margin="normal">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            {role === 'manager' && (
              <Box sx={{ position: 'relative', mt: 2 }}>
                <TextField
                  fullWidth
                  label="Assign To"
                  value={formData.assignedTo ? users.find(u => u.id.toString() === formData.assignedTo)?.firstName || formData.assignedTo : ''}
                  onClick={() => setUserDropdownOpen(true)}
                  placeholder="Search and select user"
                  required
                  error={!formData.assignedTo}
                  helperText={!formData.assignedTo ? "Please assign the task to a user" : ""}
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setUserDropdownOpen(true)}
                        >
                          <SearchIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                {userDropdownOpen && (
                  <Paper 
                    sx={{ 
                      position: 'absolute', 
                      zIndex: 1, 
                      width: '100%', 
                      maxHeight: 200, 
                      overflow: 'auto',
                      mt: 0.5
                    }}
                  >
                    <TextField
                      size="small"
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={handleUserSearch}
                      fullWidth
                      sx={{ p: 1 }}
                    />
                    <List dense>
                      {filteredUsers.map((user) => (
                        <ListItem 
                          key={user.id} 
                          button 
                          onClick={() => handleUserSelect(user)}
                        >
                          <ListItemText 
                            primary={`${user.firstName} ${user.lastName}`} 
                            secondary={user.email} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editTask ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      
      <Dialog open={openComment} onClose={handleCommentClose} maxWidth="sm" fullWidth>
        <DialogTitle>Comments</DialogTitle>
        <DialogContent>
          <List>
            {selectedTask?.comments?.map((comment) => (
              <React.Fragment key={comment.id}>
                <ListItem
                  secondaryAction={
                    comment.userId === user.id && (
                      <Box>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEditComment(comment)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    )
                  }
                >
                  <ListItemText
                    primary={comment.text}
                    secondary={`${comment.userName} - ${new Date(comment.timestamp).toLocaleString()}`}
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          {role === 'employee' && (
            <Box component="form" onSubmit={handleAddComment} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label={editingComment ? "Edit Comment" : "Add Comment"}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                multiline
                rows={2}
                required
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCommentClose}>Close</Button>
          {role === 'employee' && (
            <Button onClick={handleAddComment} variant="contained">
              {editingComment ? 'Update Comment' : 'Add Comment'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks; 