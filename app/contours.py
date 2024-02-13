import base64
import json
from os import path
import cv2
import numpy as np
import matplotlib.pyplot as plt

from app.pixel import PxToM

LOWER_GREEN = np.array([25, 40, 40])
UPPER_GREEN = np.array([90, 255, 255])
MIN_AREA = 500
OUTPATH = './output'


def contour_image(image_np):
    hsv_image = cv2.cvtColor(image_np, cv2.COLOR_RGB2HSV)
    mask = cv2.inRange(hsv_image, LOWER_GREEN, UPPER_GREEN)
    contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    large_contours = [cnt for cnt in contours if cv2.contourArea(cnt) > MIN_AREA]
    return mask, large_contours


def contours_to_geojson(contours, translator):
    polygons = []
    for contour in contours:
        epsilon = 0.01 * cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, epsilon, True)
        polygons.append(approx)

    geojson = {"type": "FeatureCollection", "features": []}
    for polygon in polygons:
        geojson["features"].append({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": translator.polygontoM(polygon.tolist())
            },
            "properties": {
                "fill": "#0fff00",
                "stroke-width": "3",
                "fill-opacity": 0.6
            },
        })

    return geojson


def image_to_geojson_contours(image_path, ref, width):
    print(image_path, ref, width)
    image_np = cv2.imread(image_path, cv2.IMREAD_COLOR)
    _, contours = contour_image(image_np)
    translator = PxToM(image_np, width, ref)
    geojson = contours_to_geojson(contours, translator)
    return geojson

def run():
    img = "./images/satellite.jpeg"
    file_name = path.basename(img)
    image_np = cv2.imread(img, cv2.IMREAD_COLOR)
    mask, contours = contour_image(image_np)
    green_areas = cv2.bitwise_and(image_np, image_np, mask=mask)
    cv2.imwrite(path.join(OUTPATH, file_name + '.green_areas.jpeg'), cv2.cvtColor(green_areas, cv2.COLOR_RGB2BGR))
    cv2.imwrite(path.join(OUTPATH, file_name + '.mask.jpeg'), mask)
    translator = PxToM(image_np, 740, (584747.950360586, 1243157.396257912))
    geojson = contours_to_geojson(contours, translator)
    json_file_path = path.join(OUTPATH, file_name + '.polygons.json')
    with open(json_file_path, 'w') as file:
        file.write(json.dumps(geojson, indent=4))
    # plt.imshow(cv2.drawContours(image_np.copy(), contours, -1, (0, 255, 0), 3))
    # plt.axis('off')
    # plt.show()


if __name__ == '__main__':
    run()
