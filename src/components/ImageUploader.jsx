import { useState, useRef } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";

export default function ImageUploader({ onImageUploaded, currentImage }) {
  const [preview, setPreview] = useState(currentImage || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten archivos de imagen.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar 5MB.");
      return;
    }

    setError("");
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);

    uploadImage(file);
  }

  async function uploadImage(file) {
    setUploading(true);
    setProgress(0);

    try {
      const fileName = `posts/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(pct);
        },
        (_err) => {
          setError("Error al subir la imagen.");
          setUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          onImageUploaded(url);
          setUploading(false);
        }
      );
    } catch {
      setError("Error al subir la imagen.");
      setUploading(false);
    }
  }

  function handleRemoveImage() {
    setPreview(null);
    onImageUploaded(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="image-uploader">
      <div className="uploader-actions">
        <button
          type="button"
          className="btn-upload"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          📷 Seleccionar imagen
        </button>
        {preview && (
          <button type="button" className="btn-remove-image" onClick={handleRemoveImage}>
            ✕ Quitar
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="file-input-hidden"
      />

      {uploading && (
        <div className="upload-progress">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <span>{progress}%</span>
        </div>
      )}

      {error && <p className="upload-error">{error}</p>}

      {preview && (
        <div className="image-preview">
          <img src={preview} alt="Preview" />
        </div>
      )}
    </div>
  );
}
