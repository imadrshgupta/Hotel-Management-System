import { Sequelize } from 'sequelize';
import { env } from './env';
import { logger } from './logger';

let sequelize: Sequelize;

export function getSequelize(): Sequelize {
  if (!sequelize) {
    sequelize = new Sequelize({
      dialect: 'postgres',
      host: env.DB.HOST,
      port: env.DB.PORT,
      database: env.DB.NAME,
      username: env.DB.USER,
      password: env.DB.PASSWORD,
      ssl: env.DB.SSL,
      logging: env.isDevelopment() ? (msg) => logger.debug(msg) : false,
      pool: {
        max: 20,
        min: 5,
        acquire: 30000,
        idle: 10000,
      },
      define: {
        timestamps: true,
        underscored: true,
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at',
      },
    });
  }
  return sequelize;
}

export async function connectDatabase(): Promise<void> {
  try {
    const seq = getSequelize();
    await seq.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (sequelize) {
    await sequelize.close();
    logger.info('Database connection closed');
  }
}
