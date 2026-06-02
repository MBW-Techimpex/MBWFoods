import API_BASE from '../config';

/**
 * Ensures an image URL is correctly formatted for display.
 * If the path is relative (starts with /uploads), it prepends the API_BASE.
 * @param {string} path 
 * @returns {string}
 */
export const getImageUrl = (path) => {
    if (!path) return '';
    if (typeof path !== 'string') return '';

    // If it's already a full URL, check if it's one of our legacy upload URLs
    if (path.startsWith('http') || path.startsWith('data:')) {
        // If it contains /uploads/, it's likely a legacy path from another domain
        if (path.includes('/uploads/')) {
            const filename = path.split('/uploads/').pop();
            return `${API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE}/uploads/${filename}`;
        }
        return path;
    }

    // If it's an absolute disk path (Windows: F:\...), try to extract the filename or just fail gracefully
    // BUT our fix ensures we store relative paths now.

    // Clean up any double slashes and ensure it starts with /uploads
    let cleanPath = path;
    if (path.includes('uploads\\')) {
        cleanPath = '/uploads/' + path.split('uploads\\').pop().replace(/\\/g, '/');
    } else if (path.includes('uploads/')) {
        cleanPath = '/uploads/' + path.split('uploads/').pop();
    } else if (!path.startsWith('/') && !path.startsWith('http')) {
        // If it's just a filename, prepend /uploads/
        cleanPath = '/uploads/' + path;
    } else if (path.startsWith('/') && !path.startsWith('/uploads/')) {
        // If it starts with / but not /uploads/, prepend /uploads
        cleanPath = '/uploads' + path;
    }

    // Combine API_BASE with the path
    const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : '/' + cleanPath;

    // Encode URI to handle spaces in filenames
    const fullUrl = `${base}${normalizedPath}`;
    
    // We only want to encode the path part, but since we know the structure:
    // If it's a data URL, don't encode
    if (fullUrl.startsWith('data:')) return fullUrl;
    
    return fullUrl.replace(/ /g, '%20');
};
