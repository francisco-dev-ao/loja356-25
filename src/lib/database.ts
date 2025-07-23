export interface DatabaseConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  database: string;
}

export class DatabaseClient {
  private config: DatabaseConfig | null = null;

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const saved = localStorage.getItem('db_config');
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch (error) {
        console.error('Error loading database config:', error);
      }
    }
  }

  setConfig(config: DatabaseConfig | null) {
    this.config = config;
  }

  isConnected(): boolean {
    return this.config !== null;
  }

  getConnectionString(): string {
    if (!this.config) {
      throw new Error('Database not configured');
    }
    
    return `postgresql://${this.config.username}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
  }

  // Simulate database operations (replace with actual DB client when needed)
  async query(sql: string, params: any[] = []): Promise<any> {
    if (!this.config) {
      throw new Error('Database not configured');
    }

    console.log('Executing query:', sql, params);
    
    // For now, return mock data based on the query
    if (sql.includes('SELECT * FROM products')) {
      return {
        rows: [
          {
            id: 1,
            name: 'Windows 10 Pro',
            description: 'Sistema operacional Windows 10 Professional',
            price: 299.99,
            category: 'windows',
            image: '/windows.png',
            active: true
          },
          {
            id: 2,
            name: 'Office 365 Business',
            description: 'Suite completa Office 365 para empresas',
            price: 129.99,
            category: 'office',
            image: '/office365.png',
            active: true
          }
        ]
      };
    }

    if (sql.includes('SELECT * FROM orders')) {
      return {
        rows: [
          {
            id: 1,
            user_id: 'user1',
            total: 299.99,
            status: 'completed',
            created_at: new Date().toISOString()
          }
        ]
      };
    }

    return { rows: [] };
  }

  async select(table: string, where: any = {}, options: any = {}): Promise<any[]> {
    const whereClause = Object.keys(where).length > 0 
      ? `WHERE ${Object.keys(where).map(key => `${key} = $${Object.keys(where).indexOf(key) + 1}`).join(' AND ')}`
      : '';
    
    const sql = `SELECT * FROM ${table} ${whereClause}`;
    const params = Object.values(where);
    
    const result = await this.query(sql, params);
    return result.rows;
  }

  async insert(table: string, data: any): Promise<any> {
    const columns = Object.keys(data).join(', ');
    const values = Object.keys(data).map((_, index) => `$${index + 1}`).join(', ');
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING *`;
    const params = Object.values(data);
    
    const result = await this.query(sql, params);
    return result.rows[0];
  }

  async update(table: string, data: any, where: any): Promise<any> {
    const setClause = Object.keys(data).map((key, index) => `${key} = $${index + 1}`).join(', ');
    const whereClause = Object.keys(where).map((key, index) => `${key} = $${Object.keys(data).length + index + 1}`).join(' AND ');
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
    const params = [...Object.values(data), ...Object.values(where)];
    
    const result = await this.query(sql, params);
    return result.rows[0];
  }

  async delete(table: string, where: any): Promise<boolean> {
    const whereClause = Object.keys(where).map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    
    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const params = Object.values(where);
    
    await this.query(sql, params);
    return true;
  }
}

// Global database client instance
export const db = new DatabaseClient();