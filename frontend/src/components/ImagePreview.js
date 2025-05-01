// frontend/src/components/ImagePreview.js
import React from "react";

const ImagePreview = ({ file, existingImageUrl }) => {
  const [previewUrl, setPreviewUrl] = React.useState(null);

  React.useEffect(() => {
    let objectUrl = null;
    // Check if file is a valid File object before creating URL
    if (file instanceof File) {
      // Create a URL for the selected file object
      objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    } else if (existingImageUrl) {
      // Use existing image URL if no new file is selected
      // Construct full URL if needed (assuming '/uploads/...' is relative to backend)
      const baseUrl =
        process.env.REACT_APP_API_URL?.replace("/api", "") ||
        import.meta.env.VITE_API_URL?.replace("/api", "") ||
        "http://localhost:5001";
      setPreviewUrl(baseUrl + existingImageUrl);
    } else {
      setPreviewUrl(null); // Clear preview if no file and no existing image
    }

    // Cleanup function to revoke the object URL when the component unmounts or file changes
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [file, existingImageUrl]); // Rerun effect if file or existingImageUrl changes

  // Fallback image placeholder
  const placeholder = "https://placehold.co/150x150/e0e0e0/777?text=No+Image";

  return (
    <div className="image-preview">
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Profile Preview"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = placeholder;
          }} // Handle broken image links
        />
      ) : (
        <img src={placeholder} alt="No Profile" />
      )}
    </div>
  );
};

export default ImagePreview;
