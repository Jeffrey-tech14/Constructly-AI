import path from 'path';
import pdfParse from 'pdf-parse';
import Tesseract from 'tesseract.js';
import {
  AuthClientTwoLegged,
  BucketsApi,
  ObjectsApi,
  DerivativesApi,
  ModelDerivativeApi
} from 'forge-apis';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

interface Room {
  name: string;
  length: number;
  width: number;
  height?: number;
  doors?: number;
  windows?: number;
}

interface ParsedPlan {
  rooms: Room[];
  floors: number;
}

export async function parsePlanFile(file: { buffer: Buffer; originalname: string }) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (['.jpg', '.jpeg', '.png'].includes(ext)) {
    return await parseImage(file.buffer);
  } else if (ext === '.pdf') {
    return await parsePDF(file.buffer);
  } else if (['.dwg', '.dxf'].includes(ext)) {
    return await parseCAD(file);
  } else if (['.rvt', '.ifc', '.pln'].includes(ext)) {
    return await parseBIM(file);
  } else {
    throw new Error('Unsupported file type');
  }
}

// 🧠 1. Image Parsing with OCR
async function parseImage(buffer: Buffer): Promise<ParsedPlan> {
  console.log('🖼 Running OCR...');

  const {
    data: { text },
  } = await Tesseract.recognize(buffer, 'eng', {
    logger: (m) => console.log(m),
  });

  console.log('📝 OCR Text:', text);

  const lines = text
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0);

  const roomRegex = /(living room|bedroom|kitchen|bathroom|toilet|balcony|dining|lounge|garage|store|office|study|porch)\s*[:\-]?\s*(\d+(\.\d+)?)\s*[x×*]\s*(\d+(\.\d+)?)/i;
  const doorRegex = /doors?\s*[:\-]?\s*(\d+)/i;
  const windowRegex = /windows?\s*[:\-]?\s*(\d+)/i;
  const floorRegex = /(floor\s*count|floors?)\s*[:\-]?\s*(\d+)/i;

  const rooms: Room[] = [];
  let floorCount = 1;

  for (const line of lines) {
    const roomMatch = roomRegex.exec(line);
    if (roomMatch) {
      const name = roomMatch[1].replace(/^\w/, (c) => c.toUpperCase());
      const length = parseFloat(roomMatch[2]);
      const width = parseFloat(roomMatch[4]);

      let doors = 0;
      let windows = 0;

      // Check next few lines for door/window context
      const startIndex = lines.indexOf(line);
      for (let i = startIndex + 1; i < startIndex + 4 && i < lines.length; i++) {
        const doorMatch = doorRegex.exec(lines[i]);
        const windowMatch = windowRegex.exec(lines[i]);

        if (doorMatch) doors = parseInt(doorMatch[1]);
        if (windowMatch) windows = parseInt(windowMatch[1]);
      }

      rooms.push({ name, length, width, height: 3, doors, windows });
    }

    const floorMatch = floorRegex.exec(line);
    if (floorMatch) {
      floorCount = parseInt(floorMatch[2]);
    }
  }

  return {
    rooms,
    floors: floorCount,
  };
}

async function parsePDF(buffer: Buffer): Promise<ParsedPlan> {
  const data = await pdfParse(buffer);
  const text = data.text;
  console.log('📄 PDF Extracted Text:', text);

  const lines = text
    .split('\n')
    .map((line) => line.trim().toLowerCase())
    .filter((line) => line.length > 0);

  const roomRegex = /(living room|bedroom|kitchen|bathroom|balcony|toilet|dining|lounge|garage|store|office|study|porch)\s*[:\-]?\s*(\d+(\.\d+)?)\s*[x×*]\s*(\d+(\.\d+)?)/i;
  const doorRegex = /doors?\s*[:\-]?\s*(\d+)/i;
  const windowRegex = /windows?\s*[:\-]?\s*(\d+)/i;
  const floorRegex = /(floor\s*count|floors?)\s*[:\-]?\s*(\d+)/i;

  const rooms: Room[] = [];
  let floorCount = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const roomMatch = roomRegex.exec(line);
    if (roomMatch) {
      const name = roomMatch[1].replace(/^\w/, (c) => c.toUpperCase());
      const length = parseFloat(roomMatch[2]);
      const width = parseFloat(roomMatch[4]);

      let doors = 0;
      let windows = 0;

      // Scan next 3 lines for door/window info
      for (let j = i + 1; j <= i + 3 && j < lines.length; j++) {
        const doorMatch = doorRegex.exec(lines[j]);
        const windowMatch = windowRegex.exec(lines[j]);

        if (doorMatch) doors = parseInt(doorMatch[1]);
        if (windowMatch) windows = parseInt(windowMatch[1]);
      }

      rooms.push({ name, length, width, height: 3, doors, windows });
    }

    const floorMatch = floorRegex.exec(line);
    if (floorMatch) {
      floorCount = parseInt(floorMatch[2]);
    }
  }

  return {
    rooms,
    floors: floorCount
  };
}

// 🧱 3. Forge CAD Parsing (DWG/DXF)
export async function parseCAD(file: { buffer: Buffer; originalname: string }): Promise<ParsedPlan> {
  const oauth2Client = new AuthClientTwoLegged(
    process.env.FORGE_CLIENT_ID!,
    process.env.FORGE_CLIENT_SECRET!,
    ['data:read', 'data:write', 'data:create', 'bucket:create'],
    true
  );
  const credentials = await oauth2Client.authenticate();

  const bucketKey = `constructly-${uuidv4()}`.toLowerCase();
  const objectName = file.originalname;
  const objectsApi = new ObjectsApi();
  const derivativesApi = new DerivativesApi();
  const modelApi = new ModelDerivativeApi();

  try {
    await new BucketsApi().createBucket({
      bucketKey,
      policyKey: 'transient'
    }, {}, oauth2Client, credentials);
  } catch (e: any) {
    if (e.statusCode !== 409) throw e;
  }

  await objectsApi.uploadObject(
    bucketKey,
    objectName,
    file.buffer.length,
    file.buffer,
    {},
    oauth2Client,
    credentials
  );

  const objectUrn = Buffer.from(`${bucketKey}/${objectName}`).toString('base64').replace(/=/g, '');

  await derivativesApi.translate({
    input: { urn: objectUrn },
    output: { formats: [{ type: 'svf', views: ['2d', '3d'] }] }
  }, { xAdsForce: true }, oauth2Client, credentials);

  // ⏳ Poll until translation is done
  const waitForTranslation = async () => {
    let status = 'inprogress';
    while (status !== 'success') {
      const res = await modelApi.getManifest(objectUrn, oauth2Client, credentials);
      status = res.body.status;
      if (status === 'failed') throw new Error('Translation failed');
      if (status !== 'success') await new Promise(r => setTimeout(r, 5000));
    }
  };
  await waitForTranslation();

  // 📦 Get metadata GUID
  const meta = await modelApi.getMetadata(objectUrn, oauth2Client, credentials);
  const metadataId = meta.body.data.metadata[0].guid;

  // 🌳 Get full model tree
  const props = await modelApi.getModelviewProperties(objectUrn, metadataId, {}, oauth2Client, credentials);
  const rooms: Room[] = [];

  for (const obj of props.body.data.collection) {
    const name = obj.name?.toLowerCase() || '';
    if (name.includes('room') || name.includes('bedroom') || name.includes('kitchen') || name.includes('living')) {
      const room: Partial<Room> = {
        name: obj.name,
        length: 0,
        width: 0,
        height: 0,
        doors: 0,
        windows: 0
      };
      const props = obj.properties || {};
      for (const category of Object.values(props)) {
        for (const [key, val] of Object.entries(category as Record<string, any>)) {
          const value = parseFloat(val);
          if (isNaN(value)) continue;
          if (key.toLowerCase().includes('length')) room.length = value;
          if (key.toLowerCase().includes('width')) room.width = value;
          if (key.toLowerCase().includes('height')) room.height = value;
          if (key.toLowerCase().includes('door')) room.doors = value;
          if (key.toLowerCase().includes('window')) room.windows = value;
        }
      }
      if (room.length && room.width) rooms.push(room as Room);
    }
  }

  const floors = Math.max(...rooms.map(r => (r.height ? Math.ceil(r.height / 3) : 1)), 1);

  return {
    rooms,
    floors
  };
}

// 🏗️ 4. IFC BIM Parsing using Autodesk Forge
async function parseBIM(file: { buffer: Buffer; originalname: string }) {
  const oauth2Client = new AuthClientTwoLegged(
    process.env.FORGE_CLIENT_ID!,
    process.env.FORGE_CLIENT_SECRET!,
    ['data:read', 'data:write', 'data:create', 'bucket:create'],
    true
  );

  const credentials = await oauth2Client.authenticate();

  const bucketKey = `constructly-${uuidv4()}`.toLowerCase();
  const objectName = file.originalname;
  const objectsApi = new ObjectsApi();
  const derivativesApi = new DerivativesApi();
  const modelApi = new ModelDerivativeApi();

  try {
    await new BucketsApi().createBucket({ bucketKey, policyKey: 'transient' }, {}, oauth2Client, credentials);
  } catch (e: any) {
    if (e.statusCode !== 409) throw e;
  }

  await objectsApi.uploadObject(
    bucketKey,
    objectName,
    file.buffer.length,
    file.buffer,
    {},
    oauth2Client,
    credentials
  );

  const objectUrn = Buffer.from(`${bucketKey}/${objectName}`).toString('base64');

  await derivativesApi.translate({
    input: { urn: objectUrn },
    output: { formats: [{ type: 'svf', views: ['2d', '3d'] }] }
  }, { xAdsForce: true }, oauth2Client, credentials);

  const waitForTranslation = async () => {
    let status = 'inprogress';
    while (status !== 'success') {
      const res = await modelApi.getManifest(objectUrn, oauth2Client, credentials);
      status = res.body.status;
      if (status === 'failed') throw new Error('Translation failed');
      if (status !== 'success') await new Promise(r => setTimeout(r, 5000));
    }
  };

  await waitForTranslation();

  const meta = await modelApi.getMetadata(objectUrn, oauth2Client, credentials);
  const metadataId = meta.body.data.metadata[0].guid;

  const tree = await modelApi.getModelviewMetadata(objectUrn, metadataId, oauth2Client, credentials);

  const roomNodes = tree.body.data.objects.filter(obj =>
    obj.name?.toLowerCase().includes('room') ||
    obj.objectid?.toString().includes('space')
  );
  const allObjects = tree.body.data.objects;

  const doorObjects = allObjects.filter(obj => obj.name?.toLowerCase().includes('door'));
  const windowObjects = allObjects.filter(obj => obj.name?.toLowerCase().includes('window'));

  const rooms: any[] = [];

  for (const room of roomNodes) {
    try {
      const propertiesRes = await modelApi.getModelviewProperties(objectUrn, metadataId, { objectIds: [room.objectid] }, oauth2Client, credentials);
      const properties = propertiesRes.body.data.collection[0]?.properties || {};

      const dimensions = properties['Dimensions'] || properties['Constraints'] || {};

      const childIds = allObjects
        .filter(obj => obj.objectid && obj.hasOwnProperty('parent') && obj.parent === room.objectid)
        .map(obj => obj.objectid);

      const length = parseFloat(dimensions['Length']) || parseFloat(dimensions['X'] || dimensions['LengthX']) || 0;
      const width = parseFloat(dimensions['Width']) || parseFloat(dimensions['Y'] || dimensions['LengthY']) || 0;
      const height = parseFloat(dimensions['Height']) || parseFloat(dimensions['Z'] || dimensions['HeightZ']) || 0;
      const doors = doorObjects.filter(obj => childIds.includes(obj.objectid)).length;
      const windows = windowObjects.filter(obj => childIds.includes(obj.objectid)).length;

      rooms.push({
        name: room.name,
        length,
        width,
        height,
        doors,
        windows
      });
    } catch (e) {
      console.warn(`Failed to fetch properties for ${room.name}:`, e);
    }
  }

  return {
    rooms,
    floors: meta.body.data.metadata.length
  };
}

