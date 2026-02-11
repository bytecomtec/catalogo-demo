const pdfUrl = 'Brochure-CCTV.pdf'; 
const primaryColor = '#ff9800'; 

// 1. CSS Corregido para visualización completa
const styles = `
    body { margin: 0; background: #1a1a1a; font-family: sans-serif; overflow: hidden; }
    #canvas-container { 
        position: relative; width: 100vw; height: 100dvh; 
        display: flex; justify-content: center; align-items: center;
        perspective: 2000px; /* Mejora el efecto 3D al girar */
    }
    #flipbook { 
        display: none; /* Se oculta hasta que esté listo */
        box-shadow: 0 0 20px rgba(0,0,0,0.5);
    }
    .page { background: white; width: 100%; height: 100%; }
    canvas { width: 100%; height: 100%; display: block; }
    
    .nav-btn {
        position: absolute; bottom: 40px; background: ${primaryColor}; 
        color: white; border: none; width: 55px; height: 55px; 
        border-radius: 50%; cursor: pointer; font-size: 24px; 
        z-index: 2000; box-shadow: 0 4px 15px rgba(0,0,0,0.6);
    }
    #prev-page { left: 20px; }
    #next-page { right: 20px; }
    #page-counter {
        position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%);
        color: white; background: rgba(0,0,0,0.5); padding: 5px 15px;
        border-radius: 15px; font-size: 12px; z-index: 1500;
    }
`;
$('<style>').text(styles).appendTo('head');

// 2. Estructura de la Interfaz
$('#canvas-container').append(`
    <div id="flipbook"></div>
    <button id="prev-page" class="nav-btn">‹</button>
    <button id="next-page" class="nav-btn">›</button>
    <div id="page-counter">Cargando páginas...</div>
`);

const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

async function init() {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const flipbook = $('#flipbook');
    const isMobile = window.innerWidth <= 768;

    // Renderizado de páginas
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = isMobile ? 1.5 : 2; // Menos escala en móvil para evitar lentitud
        const viewport = page.getViewport({ scale: scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const pageDiv = $('<div class="page"></div>').append(canvas);
        flipbook.append(pageDiv);
    }

    // Calcular tamaño para que no se corte
    const bookWidth = isMobile ? window.innerWidth * 0.85 : window.innerWidth * 0.8;
    const bookHeight = isMobile ? (bookWidth * 1.4) : (window.innerHeight * 0.8);

    // INICIALIZACIÓN DE TURN.JS
    flipbook.show().turn({
        width: bookWidth,
        height: bookHeight,
        display: isMobile ? 'single' : 'double',
        acceleration: true,
        gradients: true,
        elevation: 50,
        when: {
            turned: function(e, page) {
                $('#page-counter').text(`Página ${page} de ${pdf.numPages}`);
            }
        }
    });

    // Eventos de botones (Click y Touch)
    $('#prev-page').on('click touchstart', function(e) {
        e.preventDefault();
        flipbook.turn('previous');
    });

    $('#next-page').on('click touchstart', function(e) {
        e.preventDefault();
        flipbook.turn('next');
    });

    // Soporte de teclado
    $(window).bind('keydown', function(e) {
        if (e.keyCode === 37) flipbook.turn('previous');
        else if (e.keyCode === 39) flipbook.turn('next');
    });
}

// Ejecutar cuando el DOM esté listo
$(document).ready(init);
