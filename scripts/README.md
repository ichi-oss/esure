# Database Seed Script

This directory contains the database seeding script for the Policy Generator application.

## What the Seed Script Creates

The seed script populates your database with sample data including:

- **3 Admins** - Full system access
- **3 Sub-Admins** - Can create users and policies
- **3 Users** - End users with policies
- **9 Policies** - 3 policies per user with realistic vehicle data

## How to Run

### Prerequisites

1. Make sure you have MongoDB running and your `.env.local` file configured with `MONGODB_URI`
2. Ensure all dependencies are installed: `npm install`

### Running the Script

```bash
# Option 1: Using npm script (recommended)
npm run seed

# Option 2: Direct execution
node scripts/seed.js
```

### Interactive Options

When you run the script, it will ask:

- Whether to clear the existing database (y/N)
- The script will then proceed to create all sample data

## Sample Login Credentials

After running the seed script, you can log in with these credentials:

### Admins

- `john.admin@insurance.com` / `admin123`
- `sarah.admin@insurance.com` / `admin123`
- `michael.admin@insurance.com` / `admin123`

### Sub-Admins

- `emma.subadmin@insurance.com` / `subadmin123`
- `david.subadmin@insurance.com` / `subadmin123`
- `lisa.subadmin@insurance.com` / `subadmin123`

### Users

- `robert.johnson@email.com` / `user123`
- `jennifer.smith@email.com` / `user123`
- `william.brown@email.com` / `user123`

## Sample Data Details

### Vehicle Makes Included

- BMW X5 (2020)
- Audi A4 (2019)
- Mercedes-Benz C-Class (2021)
- Volkswagen Golf (2018)
- Toyota Prius (2020)
- Ford Focus (2019)
- Nissan Qashqai (2021)
- Honda Civic (2020)
- Hyundai Tucson (2022)

### Features Included

- Complete vehicle specifications (engine, dimensions, fuel consumption)
- MOT history and ratings
- NCAP safety ratings
- Tax and insurance information
- Realistic UK addresses and registrations
- Proper user hierarchies (sub-admins created by admins, users created by sub-admins)

## Customizing the Data

To modify the sample data:

1. Edit the data arrays in `scripts/seed.js`:

   - `adminData` - Admin users
   - `subAdminData` - Sub-admin users
   - `userData` - Regular users
   - `vehicleData` - Vehicle and policy information

2. Run the script again to apply changes

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure MongoDB is running and `MONGODB_URI` is correct in `.env.local`
2. **Permission Error**: Make sure the script has read/write access to the database
3. **Duplicate Key Error**: Clear the database first by answering 'y' when prompted

### Safe Reset

To completely start over:

1. Run the seed script
2. Choose 'y' to clear the database
3. The script will remove all existing data and create fresh sample data

## Data Relationships

The script creates proper relationships between entities:

- Sub-admins are created by the first admin
- Users are distributed among the sub-admins (created by different sub-admins)
- Each user gets 3 policies with different vehicles
- All policies are created by the same sub-admin who created the user
