import React, { useState, useRef } from "react";
import "./CardScanner.css";

const CardScanner = ({ onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError("");
      setCardData(null);
    } else {
      setError("Please select a valid image file");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError("");
      }
    } catch (err) {
      setError("Could not access camera. Please check permissions or use file upload.");
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg");
      setImagePreview(imageData);
      setSelectedImage(imageData);
      stopCamera();
      setError("");
      setCardData(null);
    }
  };

  const scanCard = async () => {
    if (!selectedImage && !imagePreview) {
      setError("Please select or capture an image first");
      return;
    }

    setScanning(true);
    setError("");
    setCardData(null);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock AI card recognition and pricing lookup
    // In a real implementation, this would call an AI service (e.g., Google Vision API)
    // to identify the card, then call pricing APIs (e.g., TCGPlayer, eBay)
    const mockCardData = {
      name: "Charizard VMAX",
      set: "Darkness Ablaze",
      number: "020/189",
      rarity: "Secret Rare",
      condition: "Near Mint",
      prices: {
        market: 145.99,
        low: 98.50,
        mid: 145.99,
        high: 225.00
      },
      trend: "+12.5%",
      lastUpdated: new Date().toLocaleDateString(),
      sources: [
        { name: "TCGPlayer", price: 145.99 },
        { name: "eBay Average", price: 152.30 },
        { name: "Card Market", price: 138.50 }
      ]
    };

    setCardData(mockCardData);
    setScanning(false);
  };

  const resetScanner = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setCardData(null);
    setError("");
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="card-scanner-overlay">
      <div className="card-scanner-modal">
        <div className="card-scanner-header">
          <h2>🃏 Pokémon Card Scanner</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="card-scanner-content">
          {!imagePreview && !cameraActive && (
            <div className="upload-section">
              <p className="instructions">
                Upload or capture a photo of your Pokémon card to get pricing information
              </p>
              <div className="button-group">
                <button className="scanner-button upload-button" onClick={() => fileInputRef.current.click()}>
                  📁 Upload Image
                </button>
                <button className="scanner-button camera-button" onClick={startCamera}>
                  📷 Use Camera
                </button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
          )}

          {cameraActive && (
            <div className="camera-section">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="camera-preview"
              />
              <div className="camera-controls">
                <button className="scanner-button capture-button" onClick={captureImage}>
                  📸 Capture
                </button>
                <button className="scanner-button cancel-button" onClick={stopCamera}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {imagePreview && !cameraActive && (
            <div className="preview-section">
              <img src={imagePreview} alt="Card preview" className="image-preview" />
              <div className="preview-controls">
                {!cardData && (
                  <>
                    <button 
                      className="scanner-button scan-button" 
                      onClick={scanCard}
                      disabled={scanning}
                    >
                      {scanning ? "🔍 Scanning..." : "🔍 Scan Card"}
                    </button>
                    <button className="scanner-button reset-button" onClick={resetScanner}>
                      🔄 Try Another
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {error && <div className="scanner-error">{error}</div>}

          {cardData && (
            <div className="pricing-results">
              <h3>Card Information</h3>
              <div className="card-info">
                <p><strong>Name:</strong> {cardData.name}</p>
                <p><strong>Set:</strong> {cardData.set}</p>
                <p><strong>Number:</strong> {cardData.number}</p>
                <p><strong>Rarity:</strong> {cardData.rarity}</p>
                <p><strong>Condition:</strong> {cardData.condition}</p>
              </div>

              <h3>💰 Pricing Information</h3>
              <div className="pricing-grid">
                <div className="price-card">
                  <span className="price-label">Market Price</span>
                  <span className="price-value primary">${cardData.prices.market}</span>
                </div>
                <div className="price-card">
                  <span className="price-label">Low</span>
                  <span className="price-value">${cardData.prices.low}</span>
                </div>
                <div className="price-card">
                  <span className="price-label">Mid</span>
                  <span className="price-value">${cardData.prices.mid}</span>
                </div>
                <div className="price-card">
                  <span className="price-label">High</span>
                  <span className="price-value">${cardData.prices.high}</span>
                </div>
              </div>

              <div className="trend-info">
                <span className={`trend ${cardData.trend.startsWith('+') ? 'positive' : 'negative'}`}>
                  {cardData.trend.startsWith('+') ? '📈' : '📉'} {cardData.trend} (30 days)
                </span>
              </div>

              <h4>Price Sources</h4>
              <div className="sources-list">
                {cardData.sources.map((source, idx) => (
                  <div key={idx} className="source-item">
                    <span>{source.name}</span>
                    <span className="source-price">${source.price}</span>
                  </div>
                ))}
              </div>

              <p className="last-updated">Last updated: {cardData.lastUpdated}</p>

              <button className="scanner-button reset-button" onClick={resetScanner}>
                🔄 Scan Another Card
              </button>

              <div className="disclaimer">
                <small>
                  ⚠️ Note: This is a demonstration with mock data. In a production environment, 
                  this would use AI image recognition (e.g., Google Vision API) to identify the card 
                  and fetch real-time pricing from TCGPlayer, eBay, and other marketplaces.
                </small>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardScanner;
