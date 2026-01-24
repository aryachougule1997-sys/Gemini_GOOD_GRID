# Good Grid Database

This directory contains the database schema, migrations, and seed data for the Good Grid platform.

## Structure

```
database/
├── migrations/          # Database migration files
│   └── 001_initial_schema.sql
├── seeds/              # Seed data files
│   └── 001_initial_data.sql
├── schema.sql          # Complete schema (for reference)
├── migrator.ts         # Migration runner utility
└── README.md           # This file
```

## Setup

### Prerequisites

1. PostgreSQL 12+ installed and running
2. Database created (default: `good_grid`)
3. Environment variables configured (see `.env.example`)

### Environment Variables

Create a `.env` file in the backend directory with:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=good_grid
DB_USER=postgres
DB_PASSWORD=your_password
```

### Running Migrations

```bash
# Run all pending migrations
npm run migrate:up

# Run migrations and seed data (for initial setup)
npm run migrate:setup

# Check migration status
npm run migrate:status

# Reset database (WARNING: deletes all data)
npm run migrate:reset

# Run only seed data
npm run migrate:seed
```

## Database Schema

### Core Tables

- **users** - User accounts and character data
- **user_stats** - User statistics (XP, Trust Score, RWIS)
- **zones** - Geographical zones on the map
- **dungeons** - Opportunity hubs within zones
- **tasks** - Available tasks/opportunities
- **task_applications** - User applications to tasks
- **work_history** - Completed work records
- **badges** - Available achievement badges
- **user_achievements** - User-earned badges
- **organizations** - Verified organizations

### Key Features

- **UUID Primary Keys** - All tables use UUID for better scalability
- **JSONB Columns** - Flexible data storage for character data, requirements, etc.
- **Enum Types** - Type safety for categories, statuses, etc.
- **Indexes** - Optimized for common query patterns
- **Triggers** - Automatic timestamp updates
- **Constraints** - Data integrity and validation

## Models

The `models/` directory contains TypeScript classes for database operations:

- `UserModel` - User management and authentication
- `TaskModel` - Task creation and management
- `ZoneModel` - Map zones and dungeons
- `BadgeModel` - Achievement system
- `OrganizationModel` - Organization management
- `WorkHistoryModel` - Work history tracking

### Usage Example

```typescript
import { UserModel } from '../models';

// Create a new user
const user = await UserModel.create({
  username: 'player1',
  email: 'player1@example.com',
  password: 'securepassword',
  characterData: { /* character config */ },
  locationData: { /* location config */ }
});

// Find user by email
const foundUser = await UserModel.findByEmail('player1@example.com');

// Update user stats
await UserModel.updateStats(user.id, {
  trustScore: 25,
  xpPoints: 100
});
```

## Seed Data

The initial seed data includes:

- **8 Zones** - From beginner to expert difficulty
- **15 Dungeons** - Covering all three work categories
- **21 Badges** - Achievement system foundation
- **5 Organizations** - Sample verified organizations

### Zone Progression

1. **Downtown District** (Beginner) - Starting zone
2. **Community Gardens Area** (Beginner) - Trust Score 25+
3. **Tech Valley** (Intermediate) - Trust Score 25+
4. **Mountain Retreat** (Intermediate) - Trust Score 50+
5. **Riverside Commons** (Intermediate) - Trust Score 50+
6. **Corporate Heights** (Advanced) - Trust Score 100+
7. **Innovation Desert** (Advanced) - Trust Score 100+
8. **Elite Summit** (Expert) - Trust Score 200+

### Dungeon Types

- **Freelance Towers** - Individual client work
- **Community Gardens** - Volunteering opportunities
- **Corporate Castles** - Organizational tasks

## Development

### Adding New Migrations

1. Create a new file in `migrations/` with format: `XXX_description.sql`
2. Use sequential numbering (002, 003, etc.)
3. Include both UP and DOWN operations if needed
4. Test thoroughly before committing

### Model Development

1. Follow the existing pattern in `models/` directory
2. Include proper TypeScript types
3. Add error handling and validation
4. Write tests for new functionality

### Testing

```bash
# Run model tests
npm test

# Run specific test file
npm test models.test.ts
```

## Production Considerations

- Use connection pooling (already configured)
- Monitor query performance
- Regular database backups
- Index optimization for large datasets
- Consider read replicas for scaling

## Troubleshooting

### Common Issues

1. **Connection refused** - Check PostgreSQL is running
2. **Permission denied** - Verify database user permissions
3. **Migration failed** - Check SQL syntax and constraints
4. **Seed data conflicts** - Reset database if needed

### Debugging

Enable query logging in development:
```env
NODE_ENV=development
```

This will log all database queries with execution time.