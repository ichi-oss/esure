# Deploying Policy Gen to Coolify

This guide will help you deploy the Insurance Policy Management System to Coolify.

## Prerequisites

1. A Coolify instance running on your server
2. A MongoDB database (can be deployed on Coolify or external)
3. A Resend API key for email functionality
4. Your project pushed to a Git repository (GitHub, GitLab, etc.)

## Step 1: Prepare Your Environment Variables

You'll need to set up the following environment variables in Coolify:

### Required Environment Variables

```env
NODE_ENV=production
MONGODB_URI=mongodb://your-mongo-host:27017/insurance-app
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
RESEND_API_KEY=re_your_resend_api_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Environment Variable Details

- **NODE_ENV**: Set to `production`
- **MONGODB_URI**: Your MongoDB connection string
  - If using Coolify's MongoDB service: `mongodb://mongodb:27017/insurance-app`
  - If using external MongoDB: `mongodb://username:password@host:port/database`
- **JWT_SECRET**: A long, random string for JWT token signing (minimum 32 characters)
- **RESEND_API_KEY**: Your Resend API key for email functionality
- **NEXT_PUBLIC_APP_URL**: Your application's public URL

## Step 2: Deploy MongoDB (if needed)

If you don't have an existing MongoDB instance:

1. In Coolify, go to **Services**
2. Click **+ New Service**
3. Select **MongoDB**
4. Configure:
   - **Name**: `policy-gen-mongodb`
   - **Database Name**: `insurance-app`
   - **Username**: `admin` (or your preferred username)
   - **Password**: Generate a secure password
5. Deploy the service
6. Note the internal connection string for your app

mongodb://root:VxPlB8744FN7ua3AENvoSwIsXnVCcE3KbBxUBODGTM5o3QXrSLRPVxuZ9GHct9FY@us0kk0cgswsc8gkcooss84ws:27017/?directConnection=true

## Step 3: Deploy the Application

1. **Create New Application**

   - In Coolify, go to **Applications**
   - Click **+ New Application**
   - Select **Public Repository** or **Private Repository**

2. **Repository Configuration**

   - **Git Repository URL**: Your repository URL
   - **Branch**: `main` (or your preferred branch)
   - **Build Pack**: Select **Docker**

3. **Build Configuration**

   - Coolify will automatically detect the `Dockerfile`
   - **Port**: `3000`
   - **Build Command**: Leave empty (handled by Dockerfile)
   - **Start Command**: Leave empty (handled by Dockerfile)

4. **Environment Variables**

   - Add all the environment variables listed in Step 1
   - Make sure to use the correct MongoDB URI if using Coolify's MongoDB

5. **Domain Configuration**

   - Set up your domain or use the provided Coolify subdomain
   - Enable SSL/TLS certificate

6. **Deploy**
   - Click **Deploy**
   - Monitor the build logs for any issues

## Step 4: Initial Setup

After successful deployment:

1. **Create Admin User**

   - Make a POST request to: `https://your-domain.com/api/setup`
   - This creates the initial admin user:
     - Email: `admin@insurance.com`
     - Password: `admin123`

2. **Test the Application**
   - Visit your application URL
   - Login with admin credentials
   - Create a sub-admin account
   - Test policy creation functionality

## Step 5: Production Considerations

### Security

- Change the default admin password immediately
- Use a strong JWT secret (32+ characters)
- Enable HTTPS/SSL
- Consider setting up a firewall

### Database Backup

- Set up regular MongoDB backups
- Consider using MongoDB Atlas for managed database

### Email Configuration

- Verify Resend API key is working
- Test email delivery
- Set up proper SPF/DKIM records for your domain

### Monitoring

- Monitor application logs in Coolify
- Set up health checks
- Monitor database performance

## Troubleshooting

### Common Issues

1. **Build Fails**

   - Check if all dependencies are properly installed
   - Verify Node.js version compatibility
   - Check build logs for specific errors

2. **Database Connection Issues**

   - Verify MongoDB URI is correct
   - Check if MongoDB service is running
   - Ensure network connectivity between services

3. **Email Not Working**

   - Verify Resend API key
   - Check email configuration
   - Test with a simple email first

4. **Environment Variables**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify values are correct

### Logs and Debugging

- Check application logs in Coolify dashboard
- Monitor MongoDB logs if using Coolify's MongoDB
- Use browser developer tools for frontend issues

## Updating the Application

To update your application:

1. Push changes to your Git repository
2. In Coolify, go to your application
3. Click **Deploy** to trigger a new build
4. Monitor the deployment process

## Backup and Recovery

### Application Backup

- Your code is backed up in your Git repository
- Environment variables are stored in Coolify

### Database Backup

- Set up regular MongoDB dumps
- Store backups in a secure location
- Test restore procedures regularly

## Support

If you encounter issues:

1. Check Coolify documentation
2. Review application logs
3. Verify all environment variables
4. Test database connectivity
5. Check email service status
