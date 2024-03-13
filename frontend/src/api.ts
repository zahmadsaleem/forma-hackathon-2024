import {Forma} from "forma-embedded-view-sdk/auto";

let renderId: string | null = null;
const CLIENT_ID = "EvGfSIMI8WlghZJ9AvagL6flwweR0wvZ";
Forma.auth.configure({
    clientId: CLIENT_ID,
    callbackUrl: "http://localhost:8081/auth",
    scopes: ["data:write", "data:read"],
});

const token = await Forma.auth.acquireTokenSilent();

if (!token) {
    Forma.auth.acquireTokenOverlay().then((tokenResponse) => {
        console.log(`Here's my new token: ${tokenResponse.accessToken}`)
    })
}

export async function getTreesJson(width: number, image_url: string, iterations: number, addToView = false) {
    const project = await Forma.project.get();
    const res = await fetch('http://localhost:5000/trees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ref: project.refPoint,
            width,
            image_url,
            iterations,
        })
    })
    const geojson = await res.json();
    console.log(geojson);
    if (geojson.error) {
        return;
    }
    if (addToView) {
        await persistGeometry(geojson);
        return;
    }
    if (renderId) {
        await Forma.render.geojson.update({id: renderId, geojson});
        return;
    }
    const renderRes = await Forma.render.geojson.add({geojson});
    renderId = renderRes.id;
}

const projectId = Forma.getProjectId();

async function persistGeometry(geojson: GeoJSON) {
    const res = await fetch(`https://developer.api.autodesk.com/forma/basic/v1alpha/geometries/batch-create?authcontext=${projectId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.accessToken}`,
            'X-Ads-Region': Forma.getRegion()
        },
        body: JSON.stringify(toGeometries(geojson))
    })
    const response = await res.json();
    const urns = response.map((urn: any, i: any) => ({
        key: i.toString(),
        urn: urn.urn
    }));
    const group = await createGroup(urns);
    await Forma.library.createItem({
        data: {
            name: "Trees",
            urn: group,
            status: "success"
        }
    });
}

async function createGroup(urns: string[]) {
    const project = await Forma.project.get();
    const res = await fetch(`https://developer.api.autodesk.com/forma/group/v1alpha/groups?authcontext=${projectId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token?.accessToken}`,
            'X-Ads-Region': Forma.getRegion()
        },
        body: JSON.stringify({
            "name": "TreeAreas",
            "children": urns,
            "geoReference": {
                "refPoint": project.refPoint,
                "srid": project.srid,
            }
        })
    })

    const response = await res.json();
    return response.urn
}

interface GeoJSON {
    type: string,
    features: Feature[]
}

interface Feature {
    type: string,
    properties: any,
    geometry: Geometry
}

interface Geometry {
    type: string,
    coordinates: number[]
}

function toGeometries(geojson: GeoJSON) {
    return geojson.features.map((feature, i) => {
        return {
            id: i.toString(),
            geometry: {
                type: "polygon",
                coordinates: feature.geometry.coordinates,
                color: "#6db068",
                opacity: 0.5,
                lineWidth: 2,
            },
            "category": "vegetation",
            "name": "TreeArea",
            "userData": {}
        }
    })
}