/**
 * SheetDB Service - Google Sheets as Real-Time Cloud Database
 * Menghubungkan aplikasi langsung ke Google Spreadsheet via SheetDB API
 */

const SHEETDB_API_URL = import.meta.env.VITE_SHEETDB_API_URL || 'https://sheetdb.io/api/v1/vlwni9jprvr6h';

export const isSheetDbConfigured = Boolean(
  SHEETDB_API_URL && 
  !SHEETDB_API_URL.includes('your-sheetdb-id')
);

// Helper fetch GET from specific sheet tab
export const fetchSheetData = async (sheetName) => {
  if (!isSheetDbConfigured) return null;
  try {
    let url = SHEETDB_API_URL;
    if (sheetName) {
      // Query specific sheet tab
      const res = await fetch(`${SHEETDB_API_URL}?sheet=${encodeURIComponent(sheetName)}`);
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }
      // If tab does not exist (404), do NOT fallback to main sheet to avoid mismatched schemas
      return [];
    }
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`Error fetching Google Sheet (${sheetName}):`, err);
    return [];
  }
};

// Helper write POST new row into specific sheet tab
export const insertSheetRow = async (sheetName, rowData) => {
  if (!isSheetDbConfigured) return null;
  try {
    const postToUrl = async (url) => {
      return await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: [rowData] })
      });
    };

    let res = null;
    if (sheetName) {
      res = await postToUrl(`${SHEETDB_API_URL}?sheet=${encodeURIComponent(sheetName)}`);
      if (!res.ok) {
        // Fallback to default sheet
        res = await postToUrl(SHEETDB_API_URL);
      }
    } else {
      res = await postToUrl(SHEETDB_API_URL);
    }

    if (!res.ok) return null;
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
    const patchUrl = `${SHEETDB_API_URL}/${encodeURIComponent(column)}/${encodeURIComponent(value)}`;
    let res = await fetch(`${patchUrl}${sheetName ? `?sheet=${encodeURIComponent(sheetName)}` : ''}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data: updatedData })
    });
    if (!res.ok && sheetName) {
      res = await fetch(patchUrl, {
        method: 'PATCH',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: updatedData })
      });
    }
    if (!res.ok) return null;
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
