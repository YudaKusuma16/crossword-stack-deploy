import html2pdf from 'html2pdf.js'

// Konfigurasi PDF options berdasarkan ukuran grid
export const configurePdfOptions = (filename, orientation = 'portrait') => ({
  margin: 10,
  filename: filename,
  image: { type: 'jpeg', quality: 1.0 },
  html2canvas: {
    scale: 4,
    useCORS: true,
    letterRendering: true,
    logging: false,
    backgroundColor: '#ffffff'
  },
  jsPDF: {
    unit: 'mm',
    format: 'a4',
    orientation: orientation
  },
  pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
})

// Generate filename dari puzzle title
export const getPdfFilename = (title) => {
  const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
  return `crossword_${cleanTitle}_${Date.now()}.pdf`
}

// Main function - generate PDF dari element
export const generatePdf = async (element, filename, options) => {
  try {
    await html2pdf().set(options).from(element).save()
    return { success: true }
  } catch (error) {
    console.error('PDF generation failed:', error)
    return { success: false, error }
  }
}

// Tentukan orientation berdasarkan ukuran grid
export const getOrientation = (gridSize) => {
  return 'portrait'
}
