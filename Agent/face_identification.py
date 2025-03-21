import cv2
import numpy as np
from mtcnn.mtcnn import MTCNN
from keras_facenet import FaceNet
from numpy.linalg import norm

class FaceIdentification:
    def __init__(self, ref_img_path: str, threshold: float = 0.5, frame_interval: int = 30, consecutive_non_match_limit: int = 5):
        """
        Initializes the face matcher by loading the reference image, initializing the
        face detector (MTCNN) and embedding model (FaceNet), and computing the reference embedding.
        """
        self._threshold = threshold
        self._frame_interval = frame_interval
        self._non_match_limit = consecutive_non_match_limit

        # Initialize models
        self._detector = MTCNN()
        self._embedder = FaceNet()

        # Load and process the reference image
        ref_img = cv2.imread(ref_img_path)
        if ref_img is None:
            raise ValueError("Reference image not found!")
        ref_img_rgb = cv2.cvtColor(ref_img, cv2.COLOR_BGR2RGB)
        faces = self._detector.detect_faces(ref_img_rgb)
        if not faces:
            raise ValueError("No face detected in reference image.")
        x, y, w, h = faces[0]['box']
        x, y = max(0, x), max(0, y)
        ref_face = ref_img_rgb[y:y+h, x:x+w]
        ref_face_resized = cv2.resize(ref_face, (160, 160))
        ref_face_array = np.expand_dims(ref_face_resized, axis=0)
        self._ref_embedding = self._embedder.embeddings(ref_face_array)[0]

    def __cosine_similarity(self, a, b):
        """Calculates cosine similarity between two vectors."""
        return np.dot(a, b) / (norm(a) * norm(b))

    def __process_frame(self, frame):
        """
        Processes a single BGR frame:
          - Converts it to RGB.
          - Detects faces.
          - Computes the embedding for each detected face.
          - Returns True if any face's similarity with the reference exceeds the threshold.
        If no face is detected or none match, returns False.
        """
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        detections = self._detector.detect_faces(frame_rgb)
        if not detections:
            return False

        for detection in detections:
            x, y, w, h = detection['box']
            x, y = max(0, x), max(0, y)
            face_roi = frame_rgb[y:y+h, x:x+w]
            try:
                face_resized = cv2.resize(face_roi, (160, 160))
            except Exception:
                continue
            face_array = np.expand_dims(face_resized, axis=0)
            embedding = self._embedder.embeddings(face_array)[0]
            sim = self.__cosine_similarity(self._ref_embedding, embedding)
            if sim > self._threshold:
                return True
        return False

    def predict(self, video_path: str) -> bool:
        """
        Processes the provided video file without opening an OpenCV window.
        It evaluates one frame every `frame_interval` frames. It returns True if a matching face
        is detected in any frame or if non-matches never occur for five consecutive processed frames.
        Otherwise, if five consecutive processed frames are non-matches, it returns False.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Error opening video file.")

        frame_count = 0
        consecutive_non_matches = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1

            if frame_count % self._frame_interval == 0:
                is_match = self.__process_frame(frame)
                if is_match:
                    consecutive_non_matches = 0
                else:
                    consecutive_non_matches += 1
                    if consecutive_non_matches >= self._non_match_limit:
                        cap.release()
                        return False

        cap.release()
        return True

# Example usage:
# matcher = FaceMatcher("Images/reference.jpg", threshold=0.5)
# result = matcher.predict("Images/Video.mp4")
# print("Face match result:", result)