import { pool } from '../src/config/db.js';

async function migrate() {
    console.log('Starting migration to add description_short and description_short_en columns...');
    try {
        // Check if description_short column already exists
        const [columns] = await pool.query('SHOW COLUMNS FROM projects LIKE "description_short"');
        if (columns.length === 0) {
            console.log('Adding columns...');
            await pool.query('ALTER TABLE projects ADD COLUMN description_short TEXT AFTER badge_en, ADD COLUMN description_short_en TEXT AFTER description_short');
            console.log('Columns added successfully.');

            // Populate existing rows with a summary of the long descriptions as placeholder
            const [rows] = await pool.query('SELECT id, description, description_en FROM projects');
            for (const row of rows) {
                const limitChar = (str, limit = 150) => {
                    if (!str) return '';
                    if (str.length <= limit) return str;
                    return str.slice(0, limit).trim() + '...';
                };
                const shortEs = limitChar(row.description);
                const shortEn = limitChar(row.description_en);

                await pool.query(
                    'UPDATE projects SET description_short = ?, description_short_en = ? WHERE id = ?',
                    [shortEs, shortEn, row.id]
                );
            }
            console.log('Existing rows populated successfully.');
        } else {
            console.log('Columns description_short and description_short_en already exist.');
        }
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
