from os import path

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import requests

from app.contours import image_to_geojson_contours

app = Flask(__name__)

counter = 0
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# add cors headers
dummy = {
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Polygon",
            "coordinates": [[[0, 0], [10, 0], [10, 10]]],
        },
        "properties": {
            "fill": "#0fff00",
            "stroke-width": "3",
            "fill-opacity": 0.6
        },
    }]
}


@app.route('/trees', methods=['POST'])
@cross_origin()
def process_image():
    global counter
    body = request.json
    image_url = body['image_url']
    ref = body['ref']
    width = body['width']
    iterations = body['iterations']
    img_path = path.join('./images', f'image-{counter}.jpeg')
    counter += 1
    ok = download_image(img_path, image_url)
    if not ok:
        print('Could not download image')
        return jsonify({'error': 'Could not download image'})
    return jsonify(image_to_geojson_contours(img_path, ref, width, iterations=iterations))
    # return jsonify(dummy)


def download_image(name, image_url):
    response = requests.get(image_url)
    if response.status_code == 200:
        with open(name, 'wb') as file:
            file.write(response.content)
            return True
    return False


if __name__ == '__main__':
    app.run(debug=True)
