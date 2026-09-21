/**
 * SheetDB Service - Google Sheets as Real-Time Cloud Database
 * Menghubungkan aplikasi langsung ke Google Spreadsheet via SheetDB API
 */

const SHEETDB_API_URL = import.meta.env.VITE_SHEETDB_API_URL || '';

export const isSheetDbConfigured = Boolean(
  SHEETDB_API_URL && 
  !SHEETDB_API_URL.includes('your-sheetdb-id')
);

// Helper fetch GET from specific sheet tab
export const fetchSheetData = async (sheetName) => {
  if (!isSheetDbConfigured) return null;
  try {
    let url = sheetName 
      ? `${SHEETDB_API_URL}?sheet=${encodeURIComponent(sheetName)}` 
      : SHEETDB_API_URL;
    let res = await fetch(url);
    if (!res.ok && sheetName) {
      // Fallback to default sheet
      res = await fetch(SHEETDB_API_URL);
    }
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : null;
  } catch (err) {
    console.warn(`Error fetching Google Sheet (${sheetName}):`, err);
    return null;
  }
};

// Helper write POST new row into specific sheet tab
export const insertSheetRow = async (sheetName, rowData) => {
  if (!isSheetDbConfigured) return null;
  try {
    let url = sheetName 
      ? `${SHEETDB_API_URL}?sheet=${encodeURIComponent(sheetName)}` 
      : SHEETDB_API_URL;
    let res = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: [rowData] })
    });
    if (!res.ok && sheetName) {
      // Fallback to default sheet
      res = await fetch(SHEETDB_API_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [rowData] })
      });
    }
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Error inserting row into Google Sheet (${sheetName}):`, err);
    return null;
  }
};

// Helper update PATCH row in specific sheet tab by column search (e.g. id)
export const updateSheetRow = async (sheetName, column, value, updatedData) => {
  if (!isSheetDbConfigured) return null;
  try {
    const url = `${SHEETDB_API_URL}/${encodeURIComponent(column)}/${encodeURIComponent(value)}${sheetName ? `?sheet=${encodeURIComponent(sheetName)}` : ''}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: updatedData })
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Error updating Google Sheet row (${sheetName}):`, err);
    return null;
  }
};

// Helper delete DELETE row from specific sheet tab by column search (e.g. id)
export const deleteSheetRow = async (sheetName, column, value) => {
  if (!isSheetDbConfigured) return null;
  try {
    const url = `${SHEETDB_API_URL}/${encodeURIComponent(column)}/${encodeURIComponent(value)}${sheetName ? `?sheet=${encodeURIComponent(sheetName)}` : ''}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Error deleting Google Sheet row (${sheetName}):`, err);
    return null;
  }
};

export { SHEETDB_API_URL };
