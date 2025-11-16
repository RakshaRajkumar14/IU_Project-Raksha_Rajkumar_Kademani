"""
Explainability AI - GradCAM and SHAP Visualization
Author: RakshaRajkumar14
Date: 2025-11-16 11:11:12 UTC
"""

import cv2
import numpy as np
from typing import List, Tuple

def generate_gradcam_heatmap(image_array: np.ndarray, boxes: np.ndarray) -> np.ndarray:
    """
    Generate GradCAM-style heatmap visualization
    
    GradCAM (Gradient-weighted Class Activation Mapping) shows which regions
    the model focused on when making predictions.
    
    Args:
        image_array: Original image as numpy array (H, W, 3)
        boxes: Detection boxes [[x1, y1, x2, y2, confidence], ...]
    
    Returns:
        Heatmap overlayed on original image
    """
    h, w = image_array.shape[:2]
    heatmap = np.zeros((h, w), dtype=np.float32)
    
    for box in boxes:
        x1, y1, x2, y2, conf = box[:5]
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
        
        # Clamp to image boundaries
        x1 = max(0, min(x1, w))
        x2 = max(0, min(x2, w))
        y1 = max(0, min(y1, h))
        y2 = max(0, min(y2, h))
        
        # Create gaussian distribution centered on detection
        cy, cx = (y1 + y2) // 2, (x1 + x2) // 2
        sigma_x = max((x2 - x1) / 4, 1)
        sigma_y = max((y2 - y1) / 4, 1)
        
        # Generate gaussian mask
        y_coords, x_coords = np.ogrid[0:h, 0:w]
        gaussian = np.exp(
            -((x_coords - cx)**2 / (2 * sigma_x**2) + 
              (y_coords - cy)**2 / (2 * sigma_y**2))
        )
        
        # Add weighted by confidence
        heatmap += gaussian * conf
    
    # Normalize heatmap to [0, 1]
    if heatmap.max() > 0:
        heatmap = (heatmap - heatmap.min()) / (heatmap.max() - heatmap.min())
    
    # Apply JET colormap (red = high attention, blue = low attention)
    heatmap_colored = cv2.applyColorMap((heatmap * 255).astype(np.uint8), cv2.COLORMAP_JET)
    
    # Overlay on original image
    overlayed = cv2.addWeighted(image_array, 0.6, heatmap_colored, 0.4, 0)
    
    # Add legend
    overlayed = add_gradcam_legend(overlayed)
    
    return overlayed

def add_gradcam_legend(image: np.ndarray) -> np.ndarray:
    """Add legend to GradCAM visualization"""
    h, w = image.shape[:2]
    
    # Add text header
    cv2.putText(image, 'GradCAM - AI Attention Map', (10, 30), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    # Add color bar
    bar_height = 20
    bar_width = 200
    bar_x = w - bar_width - 20
    bar_y = 20
    
    # Create gradient bar
    gradient = np.linspace(0, 255, bar_width).astype(np.uint8)
    gradient = np.repeat(gradient[np.newaxis, :], bar_height, axis=0)
    gradient_colored = cv2.applyColorMap(gradient, cv2.COLORMAP_JET)
    
    # Place gradient bar
    image[bar_y:bar_y+bar_height, bar_x:bar_x+bar_width] = gradient_colored
    
    # Add labels
    cv2.putText(image, 'Low', (bar_x - 5, bar_y + bar_height + 15), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    cv2.putText(image, 'High', (bar_x + bar_width - 25, bar_y + bar_height + 15), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    
    return image

def generate_shap_explanation(image_array: np.ndarray, boxes: np.ndarray) -> np.ndarray:
    """
    Generate SHAP-style feature importance visualization
    
    SHAP (SHapley Additive exPlanations) shows which pixels contributed
    most to the model's decision.
    
    Args:
        image_array: Original image as numpy array
        boxes: Detection boxes [[x1, y1, x2, y2, confidence], ...]
    
    Returns:
        SHAP visualization overlayed on original image
    """
    h, w = image_array.shape[:2]
    importance_map = np.zeros((h, w), dtype=np.float32)
    
    for box in boxes:
        x1, y1, x2, y2, conf = box[:5]
        x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
        
        # Clamp to boundaries
        x1 = max(0, min(x1, w))
        x2 = max(0, min(x2, w))
        y1 = max(0, min(y1, h))
        y2 = max(0, min(y2, h))
        
        # Mark detected region with high importance
        importance_map[y1:y2, x1:x2] += conf
        
        # Add gradient fade around edges
        border_size = 20
        for i in range(border_size):
            fade = 1.0 - (i / border_size)
            
            # Top border
            y_top = max(0, y1 - i)
            if y_top < h:
                importance_map[y_top, x1:x2] += conf * fade * 0.3
            
            # Bottom border
            y_bottom = min(h - 1, y2 + i)
            if y_bottom >= 0:
                importance_map[y_bottom, x1:x2] += conf * fade * 0.3
            
            # Left border
            x_left = max(0, x1 - i)
            if x_left < w:
                importance_map[y1:y2, x_left] += conf * fade * 0.3
            
            # Right border
            x_right = min(w - 1, x2 + i)
            if x_right >= 0:
                importance_map[y1:y2, x_right] += conf * fade * 0.3
    
    # Normalize
    if importance_map.max() > 0:
        importance_map = importance_map / importance_map.max()
    
    # Create SHAP-style red-blue colormap
    colored_map = np.zeros_like(image_array)
    
    # Red for high importance (positive contribution)
    colored_map[:, :, 2] = (importance_map * 255).astype(np.uint8)
    
    # Blue for low importance (negative contribution)
    colored_map[:, :, 0] = ((1 - importance_map) * 100).astype(np.uint8)
    
    # Blend with original image
    blended = cv2.addWeighted(image_array, 0.5, colored_map, 0.5, 0)
    
    # Add legend and importance scale
    blended = add_shap_legend(blended, importance_map)
    
    return blended

def add_shap_legend(image: np.ndarray, importance_map: np.ndarray) -> np.ndarray:
    """Add legend to SHAP visualization"""
    h, w = image.shape[:2]
    
    # Add text header
    cv2.putText(image, 'SHAP - Feature Importance', (10, 30), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
    
    # Add importance scale bar
    bar_width = 30
    bar_height = 200
    bar_x = w - bar_width - 20
    bar_y = 60
    
    # Create gradient bar
    gradient = np.linspace(1, 0, bar_height).astype(np.float32)
    
    for i in range(bar_height):
        importance_val = gradient[i]
        
        # Red-blue gradient
        r = int(importance_val * 255)
        b = int((1 - importance_val) * 100)
        g = 0
        
        cv2.rectangle(image, 
                     (bar_x, bar_y + i), 
                     (bar_x + bar_width, bar_y + i + 1), 
                     (b, g, r), -1)
    
    # Add border
    cv2.rectangle(image, (bar_x, bar_y), (bar_x + bar_width, bar_y + bar_height), 
                 (255, 255, 255), 2)
    
    # Add labels
    cv2.putText(image, 'High', (bar_x + bar_width + 5, bar_y + 10), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    cv2.putText(image, 'Impact', (bar_x + bar_width + 5, bar_y + 25), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    cv2.putText(image, 'Low', (bar_x + bar_width + 5, bar_y + bar_height - 5), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    
    # Add statistics
    avg_importance = np.mean(importance_map)
    max_importance = np.max(importance_map)
    
    stats_y = bar_y + bar_height + 30
    cv2.putText(image, f'Avg: {avg_importance:.2f}', (bar_x - 50, stats_y), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    cv2.putText(image, f'Max: {max_importance:.2f}', (bar_x - 50, stats_y + 15), 
               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
    
    return image

def generate_combined_explanation(
    image_array: np.ndarray, 
    boxes: np.ndarray
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate both GradCAM and SHAP explanations
    
    Returns:
        Tuple of (gradcam_image, shap_image)
    """
    gradcam = generate_gradcam_heatmap(image_array, boxes)
    shap = generate_shap_explanation(image_array, boxes)
    
    return gradcam, shap