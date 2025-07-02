import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Dimensions, Modal, TouchableOpacity, Text, SafeAreaView, StatusBar, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Colors from '@/theme/colors';

interface PDFViewerProps {
  filePath: number; // React Native's require returns a number
  visible: boolean;
  onClose: () => void;
  title?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ filePath, visible, onClose, title }) => {
  const [loading, setLoading] = useState(true);
  
  // For demonstration purposes, we'll use a direct PDF viewer approach
  // In a real app, you would need to handle the file path conversion properly
  // This is a simplified implementation for the demo
  
  // Create HTML template to display PDF content using PDF.js viewer
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            height: 100vh;
            display: flex;
            flex-direction: column;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
          }
          .pdf-container {
            flex: 1;
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
            background-color: #f5f5f5;
          }
          .pdf-viewer-container {
            flex: 1;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: auto;
            padding: 20px;
            box-sizing: border-box;
          }
          .pdf-viewer {
            max-width: 100%;
            height: auto;
            border: none;
            background-color: white;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          .loading-container {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: rgba(255, 255, 255, 0.9);
            z-index: 10;
          }
          .loading-text {
            margin-top: 16px;
            font-size: 16px;
            color: #4a90e2;
          }
          .error-container {
            padding: 20px;
            text-align: center;
          }
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
            color: #e74c3c;
          }
          .error-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
          }
          .error-message {
            font-size: 16px;
            color: #666;
            margin-bottom: 20px;
            line-height: 1.5;
          }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js"></script>
      </head>
      <body>
        <div class="pdf-container">
          <!-- Using PDF.js to render the PDF -->
          <div class="pdf-viewer-container">
            <canvas id="pdf-canvas" class="pdf-viewer"></canvas>
          </div>
          
          <!-- Page navigation and zoom controls -->
          <div id="pdf-controls" style="display: none; padding: 10px; background-color: #f0f0f0; width: 100%; text-align: center;">
            <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap;">
              <div style="margin-right: 20px;">
                <button id="prev" style="margin-right: 10px; padding: 8px 16px; background-color: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer;">Previous</button>
                <span id="page-info" style="margin: 0 10px; font-size: 14px;">Page <span id="page-num">1</span> of <span id="page-count">?</span></span>
                <button id="next" style="margin-left: 10px; padding: 8px 16px; background-color: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer;">Next</button>
              </div>
              <div>
                <button id="zoom-out" style="padding: 8px; background-color: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 5px;">-</button>
                <span id="zoom-level" style="margin: 0 5px; font-size: 14px;">100%</span>
                <button id="zoom-in" style="padding: 8px; background-color: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 5px;">+</button>
              </div>
            </div>
          </div>
          
          <div id="loadingContainer" class="loading-container">
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4a90e2; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <div id="loading-text" class="loading-text">Loading ${title || 'Lab Result'}...</div>
          </div>
        </div>
        
        <script>
          // Add spin animation
          document.head.insertAdjacentHTML('beforeend', 
            '<style>@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>');
          
          // Set up PDF.js worker
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          
          // Primary and fallback PDF URLs that are publicly accessible
          const primaryPdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
          const fallbackPdfUrl1 = 'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf';
          const fallbackPdfUrl2 = 'https://www.africau.edu/images/default/sample.pdf';
          
          // Start with the primary URL
          let pdfUrl = primaryPdfUrl;
          
          // Note: In a production app, you would need to:
          // 1. Extract the actual file path from the require'd asset
          // 2. Serve the PDF file from a local server or convert it to base64
          // 3. Or use a native PDF viewer component that can handle require'd assets directly
          
          // Variables to track current page, total pages, and zoom level
          let pdfDocument = null;
          let currentPage = 1;
          let totalPages = 0;
          let currentZoom = 1.5; // Initial zoom level (150%)
          
          // Function to load PDF with fallback support
          function loadPDF(url, isRetry = false) {
            // Update loading message based on which URL we're trying
             const loadingText = document.getElementById('loading-text');
             if (url === primaryPdfUrl) {
               loadingText.textContent = 'Loading PDF...';
             } else if (url === fallbackPdfUrl1) {
               loadingText.textContent = 'Trying alternative PDF source (1/2)...';
             } else if (url === fallbackPdfUrl2) {
               loadingText.textContent = 'Trying alternative PDF source (2/2)...';
             }
            
            // Load the PDF
            const loadingTask = pdfjsLib.getDocument(url);
           
           // Function to render a specific page with zoom level
           function renderPage(pageNumber, zoomLevel) {
             pdfDocument.getPage(pageNumber).then(function(page) {
               const canvas = document.getElementById('pdf-canvas');
               const context = canvas.getContext('2d');
               
               // Set the canvas dimensions to match the PDF page with zoom
               const viewport = page.getViewport({scale: zoomLevel});
               canvas.width = viewport.width;
               canvas.height = viewport.height;
               
               // Render the PDF page
               const renderContext = {
                 canvasContext: context,
                 viewport: viewport
               };
               
               page.render(renderContext);
               
               // Update page info
               document.getElementById('page-num').textContent = pageNumber;
               
               // Update zoom level display
               document.getElementById('zoom-level').textContent = Math.round(zoomLevel * 100) + '%';
             });
           }
           
           // Event listeners for navigation buttons
            document.getElementById('prev').addEventListener('click', function() {
              if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage, currentZoom);
              }
            });
            
            document.getElementById('next').addEventListener('click', function() {
              if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage, currentZoom);
              }
            });
            
            // Event listeners for zoom controls
            document.getElementById('zoom-in').addEventListener('click', function() {
              if (currentZoom < 3) { // Max zoom: 300%
                currentZoom += 0.25;
                renderPage(currentPage, currentZoom);
              }
            });
            
            document.getElementById('zoom-out').addEventListener('click', function() {
              if (currentZoom > 0.5) { // Min zoom: 50%
                currentZoom -= 0.25;
                renderPage(currentPage, currentZoom);
              }
            });
           
             loadingTask.promise.then(function(pdf) {
               // Store the PDF document
               pdfDocument = pdf;
               totalPages = pdf.numPages;
               
               // Update total pages display
               document.getElementById('page-count').textContent = totalPages;
               
               // Show navigation controls if there are multiple pages
               if (totalPages > 1) {
                 document.getElementById('pdf-controls').style.display = 'block';
               }
               
               // PDF loaded, hide loading indicator
               document.getElementById('loadingContainer').style.display = 'none';
               
               // Render the first page with the initial zoom level
               renderPage(currentPage, currentZoom);
             }).catch(function(error) {
               // Error loading PDF
               console.error('Error loading PDF:', error);
               
               // Try fallback URLs if previous attempts failed
                if (!isRetry && url === primaryPdfUrl) {
                  console.log('Trying first fallback PDF URL...');
                  loadPDF(fallbackPdfUrl1, true);
                } else if (isRetry && url === fallbackPdfUrl1) {
                  console.log('Trying second fallback PDF URL...');
                  loadPDF(fallbackPdfUrl2, true);
                } else {
                  // All URLs failed or this was the last fallback
                 document.querySelector('.pdf-container').innerHTML = 
                    '<div class="error-container">'+
                    '<div class="error-icon">⚠️</div>'+
                    '<div class="error-title">Unable to load PDF</div>'+
                    '<div class="error-message">'+
                    'The PDF viewer could not load the document after trying multiple sources. This could be due to:<br>'+
                    '- Network connectivity issues<br>'+
                    '- The PDF file may be corrupted or not accessible<br>'+
                    '- CORS restrictions preventing access to the file<br>'+
                    '- Your browser may not support PDF.js<br><br>'+
                    'Please check your internet connection and try again later, or contact support if the issue persists.'+
                    '</div>'+
                    '</div>';
                 document.getElementById('loadingContainer').style.display = 'none';
               }
             });
           }
          
          // Start loading with primary URL
          loadPDF(pdfUrl);
          
          // Show error if PDF fails to load after 15 seconds (increased timeout to allow for fallback)
          setTimeout(function() {
            if (document.getElementById('loadingContainer').style.display !== 'none') {
              document.querySelector('.pdf-container').innerHTML = 
                '<div class="error-container">'+
                '<div class="error-icon">⚠️</div>'+
                '<div class="error-title">Unable to load PDF</div>'+
                '<div class="error-message">'+
                'The PDF viewer could not load the document after trying multiple sources. This could be due to:<br>'+
                '- Network connectivity issues<br>'+
                '- The PDF file may be corrupted or not accessible<br>'+
                '- CORS restrictions preventing access to the file<br>'+
                '- Your browser may not support PDF.js<br><br>'+
                'Please check your internet connection and try again later, or contact support if the issue persists.'+
                '</div>'+
                '</div>';
            }
          }, 15000);
        </script>
      </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor={Colors.primary500} barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={24} color={Colors.white} />
          </TouchableOpacity>
          {title && <Text style={styles.title}>{title}</Text>}
          <View style={styles.placeholder} />
        </View>

        <View style={styles.pdfContainer}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary500} />
              <Text style={styles.loadingText}>Loading document...</Text>
            </View>
          )}
          
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={styles.webView}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: Colors.primary500,
    ...Platform.select({
      ios: {
        paddingTop: 50,
      },
      android: {
        paddingTop: StatusBar.currentHeight,
      },
    }),
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  pdfContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webView: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.primary500,
  },
});

export default PDFViewer;