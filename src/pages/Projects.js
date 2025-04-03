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
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import {
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  addProject,
  updateProject,
  deleteProject,
} from '../store/slices/projectSlice';
import { addLog } from '../store/slices/activityLogSlice';
import axios from 'axios';

const Projects = () => {
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.projects);
  const { role, user } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'pending',
  });
  

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({
    key: 'title',
    direction: 'ascending',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        dispatch(fetchProjectsStart());
        const response = await axios.get('https://dummyjson.com/todos');
        const projectsData = response.data.todos.map((todo) => ({
          id: todo.id,
          title: todo.todo,
          description: `Description for ${todo.todo}`,
          status: todo.completed ? 'completed' : 'pending',
          userId: todo.userId,
        }));
        dispatch(fetchProjectsSuccess(projectsData));
      } catch (error) {
        dispatch(fetchProjectsFailure(error.message));
      }
    };

    fetchProjects();
  }, [dispatch]);

  const handleOpen = (project = null) => {
    if (project) {
      setEditProject(project);
      setFormData({
        title: project.title,
        description: project.description,
        status: project.status,
      });
    } else {
      setEditProject(null);
      setFormData({
        title: '',
        description: '',
        status: 'pending',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditProject(null);
    setFormData({
      title: '',
      description: '',
      status: 'pending',
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const projectData = {
      ...formData,
      id: editProject ? editProject.id : Date.now(),
    };

    if (editProject) {
      dispatch(updateProject(projectData));
      dispatch(addLog({
        userName: user.name,
        action: 'updated',
        details: `Updated project: ${projectData.title}`,
        timestamp: new Date().toISOString(),
      }));
    } else {
      dispatch(addProject(projectData));
      dispatch(addLog({
        userName: user.name,
        action: 'created',
        details: `Created new project: ${projectData.title}`,
        timestamp: new Date().toISOString(),
      }));
    }
    handleClose();
  };

  const handleDelete = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const projectToDelete = projects.find(p => p.id === projectId);
      dispatch(deleteProject(projectId));
      dispatch(addLog({
        userName: user.name,
        action: 'deleted',
        details: `Deleted project: ${projectToDelete.title}`,
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
  

  const filteredAndSortedProjects = React.useMemo(() => {
    let result = [...projects];
    
 

    if (searchTerm) {
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    
    if (statusFilter !== 'all') {
      result = result.filter((project) => project.status === statusFilter);
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
  }, [projects, searchTerm, statusFilter, sortConfig]);

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
        <Typography variant="h4">Projects</Typography>
        {role === 'admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Project
          </Button>
        )}
      </Box>
      
    
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search projects..."
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
                <TableCell align="right">Actions</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedProjects
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((project) => (
                <TableRow key={project.id}>
                  <TableCell>{project.title}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>
                    <Chip
                      label={project.status}
                      color={project.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  {(role === 'admin' || role === 'manager') && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        {(role === 'admin' || role === 'manager') && (
                          <IconButton
                            size="small"
                            onClick={() => handleOpen(project)}
                          >
                            <EditIcon />
                          </IconButton>
                        )}
                        {role === 'admin' && (
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(project.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            {filteredAndSortedProjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={(role === 'admin' || role === 'manager') ? 4 : 3} align="center">
                  No projects found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredAndSortedProjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

     
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editProject ? 'Edit Project' : 'Add New Project'}
        </DialogTitle>
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
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editProject ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects; 