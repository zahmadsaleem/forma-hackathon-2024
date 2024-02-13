import cv2


class PxToM:
    def __init__(self, image, actual_width, ref):
        self.image = image
        self.ref = ref
        self.actual_width = actual_width
        self.image_height, self.image_width = image.shape[0], image.shape[1]
        self.px_multiplier = actual_width / self.image_width
        self.pixel_translation = (-1 * self.image_width / 2, -1 * self.image_height / 2)

    def px_to_m(self, px, py):
        px, py = px + self.pixel_translation[0], py + self.pixel_translation[1]
        # return self.ref[0] + px * self.px_multiplier, self.ref[1] - py * self.px_multiplier
        return px * self.px_multiplier, -1 * py * self.px_multiplier

    def polygontoM(self, polygons):
        result = []
        # need to flatten the middle list
        for polygon in polygons:
            result.append(self.px_to_m(polygon[0][0], polygon[0][1]))
        return [result]


if __name__ == "__main__":
    sampleref = (584747.950360586, 1243157.396257912)
    sampleimg = cv2.imread("../images/satellite.jpeg")
    samplewidth = 740
    px_to_m = PxToM(sampleimg, samplewidth, sampleref)
    print(px_to_m.px_to_m(4000, 4000))
    print(px_to_m.px_to_m(1000, 1000))
    print(px_to_m.polygontoM([[[1000, 1000]], [[2000, 2000]], [[3000, 3000]]]))
