import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import Colors from '@/theme/colors';

interface PDFViewerStandaloneProps {
  filePath: string;
  title?: string;
  showControls?: boolean;
}

const PDFViewerStandalone: React.FC<PDFViewerStandaloneProps> = ({ 
  filePath, 
  title,
  showControls = false
}) => {
  // Create an HTML template for the PDF viewer
  const htmlTemplate = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>${title || 'PDF Viewer'}</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #f5f5f5;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        #container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        #viewer {
          flex: 1;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #f5f5f5;
          position: relative;
        }
        #canvas-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: ${showControls ? '50px' : '0'};
          overflow: auto;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        canvas {
          display: block;
          margin: 0 auto;
          border: 1px solid #ddd;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          background-color: white;
        }
        #controls {
          display: ${showControls ? 'flex' : 'none'};
          height: 50px;
          background-color: #f0f0f0;
          border-top: 1px solid #ddd;
          padding: 0 10px;
          align-items: center;
          justify-content: space-between;
        }
        .control-group {
          display: flex;
          align-items: center;
        }
        button {
          background-color: #4285f4;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 12px;
          margin: 0 5px;
          font-size: 14px;
          cursor: pointer;
          outline: none;
        }
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        #page-info {
          font-size: 14px;
          color: #333;
        }
        #loading {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }
        .spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-left-color: #4285f4;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin-bottom: 10px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        #error {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.9);
          display: none;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          padding: 20px;
          text-align: center;
        }
        #error-message {
          color: #d32f2f;
          font-size: 16px;
          margin-bottom: 10px;
        }
        #retry-button {
          background-color: #d32f2f;
        }
      </style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.min.js"></script>
    </head>
    <body>
      <div id="container">
        <div id="viewer">
          <div id="canvas-container">
            <canvas id="pdf-canvas"></canvas>
          </div>
          <div id="controls">
            <div class="control-group">
              <button id="prev-page" disabled>Previous</button>
              <span id="page-info">Page 1 of 1</span>
              <button id="next-page" disabled>Next</button>
            </div>
            <div class="control-group">
              <button id="zoom-out">Zoom Out</button>
              <span id="zoom-info">100%</span>
              <button id="zoom-in">Zoom In</button>
            </div>
          </div>
          <div id="loading">
            <div class="spinner"></div>
            <div>Loading PDF...</div>
          </div>
          <div id="error">
            <div id="error-message">Failed to load PDF</div>
            <button id="retry-button">Retry</button>
          </div>
        </div>
      </div>

      <script>
        // Set up PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

        // PDF URLs - primary and fallback
        const pdfUrl = '${filePath}';
        const fallbackPdfUrl = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';

        // Variables to track state
        let pdfDoc = null;
        let pageNum = 1;
        let pageRendering = false;
        let pageNumPending = null;
        let scale = 1.0;
        let canvas = document.getElementById('pdf-canvas');
        let ctx = canvas.getContext('2d');
        let loadingTimeout;

        // Load the PDF
        function loadPDF(url, isRetry = false) {
          document.getElementById('loading').style.display = 'flex';
          document.getElementById('error').style.display = 'none';
          
          // Set a timeout to show error if loading takes too long
          clearTimeout(loadingTimeout);
          loadingTimeout = setTimeout(() => {
            if (!pdfDoc && !isRetry) {
              // Try fallback URL if this is not already a retry attempt
              console.log('Loading timeout, trying fallback URL');
              loadPDF(fallbackPdfUrl, true);
            } else if (!pdfDoc) {
              // Show error if even the fallback fails
              document.getElementById('loading').style.display = 'none';
              document.getElementById('error').style.display = 'flex';
            }
          }, 10000); // 10 seconds timeout

          pdfjsLib.getDocument(url).promise
            .then(function(pdf) {
              pdfDoc = pdf;
              clearTimeout(loadingTimeout);
              document.getElementById('page-info').textContent = 'Page ' + pageNum + ' of ' + pdfDoc.numPages;
              document.getElementById('prev-page').disabled = pageNum <= 1;
              document.getElementById('next-page').disabled = pageNum >= pdfDoc.numPages;
              renderPage(pageNum);
            })
            .catch(function(error) {
              console.error('Error loading PDF:', error);
              if (!isRetry) {
                // Try fallback URL if this is not already a retry attempt
                console.log('Error loading PDF, trying fallback URL');
                loadPDF(fallbackPdfUrl, true);
              } else {
                // Show error if even the fallback fails
                clearTimeout(loadingTimeout);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').style.display = 'flex';
                document.getElementById('error-message').textContent = 'Failed to load PDF: ' + error.message;
              }
            });
        }

        // Render the page
        function renderPage(num) {
          pageRendering = true;
          
          // Show loading indicator
          document.getElementById('loading').style.display = 'flex';
          
          pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
              canvasContext: ctx,
              viewport: viewport
            };

            const renderTask = page.render(renderContext);

            renderTask.promise.then(function() {
              pageRendering = false;
              document.getElementById('loading').style.display = 'none';
              
              if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
              }
            });
          });

          document.getElementById('page-info').textContent = 'Page ' + num + ' of ' + pdfDoc.numPages;
          document.getElementById('prev-page').disabled = num <= 1;
          document.getElementById('next-page').disabled = num >= pdfDoc.numPages;
        }

        // Go to previous page
        function goPrevPage() {
          if (pageNum <= 1) return;
          pageNum--;
          queueRenderPage(pageNum);
        }

        // Go to next page
        function goNextPage() {
          if (pageNum >= pdfDoc.numPages) return;
          pageNum++;
          queueRenderPage(pageNum);
        }

        // Queue rendering of a page
        function queueRenderPage(num) {
          if (pageRendering) {
            pageNumPending = num;
          } else {
            renderPage(num);
          }
        }

        // Zoom in
        function zoomIn() {
          scale = Math.min(scale * 1.25, 3.0); // Limit max zoom
          document.getElementById('zoom-info').textContent = Math.round(scale * 100) + '%';
          queueRenderPage(pageNum);
        }

        // Zoom out
        function zoomOut() {
          scale = Math.max(scale / 1.25, 0.5); // Limit min zoom
          document.getElementById('zoom-info').textContent = Math.round(scale * 100) + '%';
          queueRenderPage(pageNum);
        }

        // Set up button events
        document.getElementById('prev-page').addEventListener('click', goPrevPage);
        document.getElementById('next-page').addEventListener('click', goNextPage);
        document.getElementById('zoom-in').addEventListener('click', zoomIn);
        document.getElementById('zoom-out').addEventListener('click', zoomOut);
        document.getElementById('retry-button').addEventListener('click', function() {
          loadPDF(pdfUrl);
        });

        // Load the PDF when the page loads
        document.addEventListener('DOMContentLoaded', function() {
          loadPDF(pdfUrl);
        });

        // Start loading immediately as well (for WebView)
        loadPDF(pdfUrl);
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: htmlTemplate }}
        style={styles.webView}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary500} />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

export default PDFViewerStandalone;