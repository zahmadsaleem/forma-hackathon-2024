import {useEffect, useState} from "preact/hooks";

import {Forma} from "forma-embedded-view-sdk/auto";
import ExportButton from "./components/ExportButton.tsx";
import {getTreesJson} from "./api.ts";

const image_url = "https://texture-clipper-v3-prod-eu-west-1.s3.eu-west-1.amazonaws.com/texture/in/32643/%5B%5B584378.7365777978%2C1242788.6241095166%5D%2C%5B585117.1549196378%2C1243526.173726655%5D%5D/4096/satellite.jpeg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA2ZH3KLYNLQVSJK5H%2F20240214%2Feu-west-1%2Fs3%2Faws4_request&X-Amz-Date=20240214T155157Z&X-Amz-Expires=3700&X-Amz-Security-Token=IQoJb3JpZ2luX2VjELj%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCWV1LXdlc3QtMSJGMEQCIGnSpfWELRy%2Bejm0xmMCnXliNf4WahQxNSZZijCaXTYAAiABARWT3ur5PLvFVCrxmmM92wRnnwZzB7iRWQhxzGaVrCqmAwiR%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F8BEAAaDDc0MTQwODkyMzE2MiIMsbi34q9uwcMnMbBjKvoCPOLDBJa8ZXxIqB3xfzbvl1HD11J3tZ84Fbbtsn%2FnBVlamErHrOU0tSzni%2BYIAwDj4AJCISFUiDEupD1atlxzSIYAXtzY1k4CuHXlRuzId2pXE2x3jUT2qHc1XOYLh1YYw8KNxs4DYybA%2Byby8RdZW4Jj3URbujV7lYwVaXfi8xmHZdodXOmERWLb1ZcsgvDWvg6t0KdtnK0F8DiSSOlvZ1T4qTfTGfAThjRUUmdwDWiXb%2BKM2izYHQOXDFK%2BmOX3l0AZN53UhwUKtqm3Q6OGvxyk7GmE%2FLD3DngTc2QONxu8Mld4bq0sdIaNIHzAiIe0lCum0YPIn6Zpos6OaB8%2Bs%2BhY1njSTx1z5eU84Wq4kHEbghoYR%2BhlAV67aLcDCj5O%2B7hh%2BkysI7%2BqzFHq7ByuHI1GWuN04xxIiWp64o2prUBSypPW5Mm4DK6uOF3pQoIWoy2OO%2FyFR6j7DhwvFWRxljaMjOH%2FknnjaETxBykMzGhEcithhUWvAN5JMIDCs64GOp4BJLLpc%2BN%2FHyWVznL%2BTdhdu7JQ86Gf1uOQ6CkbO8CQQEs6LU2uLETpoJzbOOg3hCM0ldg8BkB%2BiWtXvWvIH1TRPfyxK%2FHpPe6LgHXMQDOJ1rEUWPQD5dWGiq5fFbKGv%2FYNBbez5oOassiLAaIxL63P3O2U685f2unC9%2Bc4NPtX64Q9AZHQJP%2FOgtutrBdfO5Ga2X4%2BNgXZG5PqaWnzZ64%3D&X-Amz-Signature=e81ab7fd561b8f6d75a0715de49d1151b0ec06641cf1938c259f0d06c39b2df0&X-Amz-SignedHeaders=host&response-cache-control=max-age%3D3600%2C%20private"
const width = 740;

export default function App() {
    const [message, setMessage] = useState<string | null>(null);
    const [iterations, setIterations] = useState<number>(2);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const persistTrees = async () => {
        setMessage("Hang on... doing some work...");
        setIsLoading(true);
        await getTreesJson(width, image_url, iterations, true);
        setMessage("Trees added to the Library!");
        setIsLoading(false);
    }
    useEffect(() => {
        Forma.render.cleanup();
        return () => {
            Forma.render.cleanup();
        };
    }, []);

    const refresh = async (e: number) => {
        setIterations(e);
        setMessage(null);
        setIsLoading(true);
        await getTreesJson(width, image_url, e);
        setIsLoading(false);
    }
    getTreesJson(width, image_url, iterations);
    return (
        <>
            <h1>Trees</h1>
            {message && <p>{message}</p>}
            {isLoading && <weave-progress-bar percentcomplete={""}></weave-progress-bar>}
            <p>Intolerance</p>
            <weave-slider value={iterations} min="1" max="4" step="1" variant="discrete"
                          label="Aggressiveness" onChange={(e: any) => refresh(Number(e.detail))}></weave-slider>
            <ExportButton callback={persistTrees}/>
        </>
    );
}
