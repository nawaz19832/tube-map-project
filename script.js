// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'build/pdf.worker.min.js';

// Global variables for rendering
let pdf, currentPage, currentScale = 1.5, offsetX = 0, offsetY = 0;

// Render the PDF
async function renderPDF() {
  try {
    pdf = await pdfjsLib.getDocument('tube_map.pdf').promise;
    currentPage = await pdf.getPage(1);
    const viewport = currentPage.getViewport({ scale: currentScale });
    const canvas = document.getElementById('pdfCanvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    context.translate(-offsetX, -offsetY);
    await currentPage.render({ canvasContext: context, viewport }).promise;
  } catch (error) {
    console.error('Error loading PDF:', error);
    document.getElementById('restaurantInfo').innerHTML = '<p>Error loading PDF. Check console for details.</p>';
  }
}

// Search for stations and extract restaurant info
async function searchStation() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  const resultDiv = document.getElementById('restaurantInfo');
  
  if (!query) {
    resultDiv.innerHTML = '<p>Please enter a station name.</p>';
    return;
  }

  resultDiv.innerHTML = '<p>Searching...</p>';
  try {
    const textContent = await currentPage.getTextContent();
    const items = textContent.items;
    let stationFound = false, restaurantInfo = '';

    for (let i = 0; i < items.length; i++) {
      if (items[i].str.toLowerCase().includes(query)) {
        stationFound = true;
        const stationName = items[i].str;
        const x = items[i].transform[4], y = items[i].transform[5];
        
        restaurantInfo = '';
        for (let j = i + 1; j < Math.min(i + 5, items.length); j++) {
          if (items[j].str.trim()) {
            restaurantInfo += items[j].str + ', ';
          }
        }
        restaurantInfo = restaurantInfo.replace(/,\s*$/, '') || 'No restaurant info found';

        resultDiv.innerHTML = `<h3>${stationName}</h3><p>Halal Restaurants: ${restaurantInfo}</p>`;
        highlightStation(x, y);
        break;
      }
    }

    if (!stationFound) {
      resultDiv.innerHTML = '<p>No station found.</p>';
    }
  } catch (error) {
    console.error('Error searching PDF:', error);
    resultDiv.innerHTML = '<p>Error searching PDF. Check console for details.</p>';
  }
}

// Placeholder for highlightStation
async function highlightStation(x, y) {
  console.log(`Highlighting station at x: ${x}, y: ${y}`);
}

// Initialize the PDF rendering
renderPDF();