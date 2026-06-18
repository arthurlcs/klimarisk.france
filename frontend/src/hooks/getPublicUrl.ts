// find the public URL for a given path, taking into account the BASE_URL and ensuring no duplicate slashes
export const getPublicUrl = (path: string) =>
  path.startsWith('http') ? path : `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`

// current location of data files, can be switched to local for development
export const getDataUrl = (fileName: string) => {
  return getPublicUrl(`data/${fileName}`); // For local development, place data files in public/data/
  // return `https://tiltobias.github.io/klimarisk-data/${fileName}`; // For production, fetch from GitHub Pages
}

export const getDataFileJSON = async (fileName: string) => {
  const res = await fetch(getDataUrl(fileName));
  return await res.json();
}
