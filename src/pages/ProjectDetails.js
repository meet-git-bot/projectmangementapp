import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';



import axios from 'axios';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { projects, loading } = useSelector((state) => state.projects);
  const { role } = useSelector((state) => state.auth);
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`https://dummyjson.com/todos/${projectId}`);
        const projectData = {
          id: response.data.id,
          title: response.data.todo,
          description: `Description for ${response.data.todo}`,
          status: response.data.completed ? 'completed' : 'pending',
          userId: response.data.userId,
        };
        setProject(projectData);
      } catch (error) {
        console.error('Error fetching project details:', error);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  if (loading || !project) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/projects')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4">Project Details</Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">{project.title}</Typography>
              <Box>
                {(role === 'admin' || role === 'manager') && (
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/projects/${project.id}/edit`)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                )}
                {role === 'admin' && (
                  <IconButton
                    color="error"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this project?')) {
                   
                        navigate('/projects');
                      }
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              {project.description}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Chip
              label={project.status}
              color={project.status === 'completed' ? 'success' : 'warning'}
              size="small"
            />
          </Grid>
        </Grid>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Project Tasks
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Assigned To</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
           
            <TableRow>
              <TableCell colSpan={3} align="center">
                No tasks found for this project
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectDetails; 