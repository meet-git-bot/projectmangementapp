import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';

const Profile = () => {
  const { user, role } = useSelector((state) => state.auth);

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'employee':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>

      <Card>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Avatar
              src={user?.avatar}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              {user?.name}
            </Typography>
            <Chip
              label={role.toUpperCase()}
              color={getRoleColor(role)}
              sx={{ mb: 2 }}
            />
          </Box>

          <Divider sx={{ my: 3 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body1">{user?.name}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{user?.email}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="body1">{user?.id}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Role
                  </Typography>
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {role}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Role Permissions
            </Typography>
            <Grid container spacing={2}>
              {role === 'admin' && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <Chip label="Create Projects" color="primary" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Chip label="Delete Projects" color="primary" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Chip label="Manage Users" color="primary" />
                  </Grid>
                </>
              )}
              {role === 'manager' && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <Chip label="Create Tasks" color="primary" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Chip label="Assign Tasks" color="primary" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Chip label="Edit Projects" color="primary" />
                  </Grid>
                </>
              )}
              {role === 'employee' && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <Chip label="View Tasks" color="primary" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Chip label="Update Task Status" color="primary" />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Chip label="Add Comments" color="primary" />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Profile; 