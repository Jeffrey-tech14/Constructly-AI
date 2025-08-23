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

export interface Door {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  type: string; // Panel | Flush | Metal
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

export interface Window {
  sizeType: string; // "standard" | "custom"
  standardSize: string;
  custom: { height: string; width: string; price?: string };
  glass: string; // Clear | Frosted | Tinted
  frame: string; // Wood | Steel | Aluminum
  count: number;
}

export interface Room {
  roomType: string;
  room_name: string;
  width: string;
  thickness: string;
  blockType: string; // Hollow, Solid, etc
  length: string;
  height: string;
  customBlock: { length: string; height: string; thickness: string; price: string };
  plaster: string; // "None" | "One Side" | "Both Sides"
  doors: Door[];
  windows: Window[];
}

interface ParsedPlan {
  rooms: Room[];
  floors: number;
}

// Helper function to create default room
function createDefaultRoom(name: string, length: number, width: number): Room {
  return {
    roomType: name,
    room_name: name,
    width: width.toString(),
    thickness: "0.2", // default thickness
    blockType: "Standard Block (400×200×200mm)",
    length: length.toString(),
    height: "2.7", // default height
    customBlock: { length: "", height: "", thickness: "", price: "" },
    plaster: "Both Sides",
    doors: [],
    windows: []
  };
}

// Helper function to add doors to room
function addDoorsToRoom(room: Room, doorCount: number): Room {
  const doors: Door[] = [];
  for (let i = 0; i < doorCount; i++) {
    doors.push({
      sizeType: "standard",
      standardSize: "0.9 × 2.1 m",
      custom: { height: "", width: "", price: "" },
      type: "Panel",
      frame: "Wood",
      count: 1
    });
  }
  return { ...room, doors };
}

// Helper function to add windows to room
function addWindowsToRoom(room: Room, windowCount: number): Room {
  const windows: Window[] = [];
  for (let i = 0; i < windowCount; i++) {
    windows.push({
      sizeType: "standard",
      standardSize: "1.2 × 1.2 m",
      custom: { height: "", width: "", price: "" },
      glass: "Clear",
      frame: "Aluminum",
      count: 1
    });
  }
  return { ...room, windows };
}

export async function parsePlanFile(file: { buffer: Buffer; originalname: string }): Promise<ParsedPlan> {
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

      // Create room with proper structure
      let room = createDefaultRoom(name, length, width);
      room = addDoorsToRoom(room, doors);
      room = addWindowsToRoom(room, windows);
      
      rooms.push(room);
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

// 📄 2. PDF Parsing
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

      // Create room with proper structure
      let room = createDefaultRoom(name, length, width);
      room = addDoorsToRoom(room, doors);
      room = addWindowsToRoom(room, windows);
      
      rooms.push(room);
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
async function parseCAD(file: { buffer: Buffer; originalname: string }): Promise<ParsedPlan> {
  if (!process.env.FORGE_CLIENT_ID || !process.env.FORGE_CLIENT_SECRET) {
    throw new Error('Autodesk Forge credentials not configured');
  }

  const oauth2Client = new AuthClientTwoLegged(
    process.env.FORGE_CLIENT_ID,
    process.env.FORGE_CLIENT_SECRET,
    ['data:read', 'data:write', 'data:create', 'bucket:read', 'bucket:create'],
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

  const objectUrn = Buffer.from(`${bucketKey}:${objectName}`).toString('base64').replace(/=/g, '');

  await derivativesApi.translate({
    input: { urn: objectUrn },
    output: { formats: [{ type: 'svf', views: ['2d', '3d'] }] }
  }, { xAdsForce: true }, oauth2Client, credentials);

  // ⏳ Poll until translation is done
  const waitForTranslation = async () => {
    let status = 'inprogress';
    let attempts = 0;
    while (status !== 'success' && attempts < 30) { // 30 attempts max (2.5 minutes)
      try {
        const res = await modelApi.getManifest(objectUrn, {}, oauth2Client, credentials);
        status = res.body.status;
        if (status === 'failed') throw new Error('Translation failed');
        if (status !== 'success') {
          await new Promise(r => setTimeout(r, 5000));
          attempts++;
        }
      } catch (error) {
        console.warn('Translation status check failed, retrying...', error);
        await new Promise(r => setTimeout(r, 5000));
        attempts++;
      }
    }
    if (status !== 'success') {
      throw new Error('Translation timeout');
    }
  };
  
  await waitForTranslation();

  // Get metadata
  const meta = await modelApi.getMetadata(objectUrn, {}, oauth2Client, credentials);
  const metadataId = meta.body.data.metadata[0].guid;

  // Get properties
  const props = await modelApi.getModelviewProperties(objectUrn, metadataId, {}, oauth2Client, credentials);
  const rooms: Room[] = [];

  for (const obj of props.body.data.collection) {
    const name = obj.name?.toLowerCase() || '';
    if (name.includes('room') || name.includes('space') || name.includes('area')) {
      let roomLength = 0;
      let roomWidth = 0;
      let roomHeight = 0;
      let doorCount = 0;
      let windowCount = 0;

      const properties = obj.properties || {};
      for (const category of Object.values(properties)) {
        for (const [key, val] of Object.entries(category as Record<string, any>)) {
          const keyLower = key.toLowerCase();
          const value = parseFloat(val);
          if (isNaN(value)) continue;
          
          if (keyLower.includes('length')) roomLength = value;
          if (keyLower.includes('width')) roomWidth = value;
          if (keyLower.includes('height')) roomHeight = value;
          if (keyLower.includes('door')) doorCount = value;
          if (keyLower.includes('window')) windowCount = value;
        }
      }

      if (roomLength > 0 && roomWidth > 0) {
        const roomName = obj.name || 'Unknown Room';
        let room = createDefaultRoom(roomName, roomLength, roomWidth);
        room = addDoorsToRoom(room, doorCount);
        room = addWindowsToRoom(room, windowCount);
        rooms.push(room);
      }
    }
  }

  const floors = Math.max(...rooms.map(r => (parseFloat(r.height) ? Math.ceil(parseFloat(r.height) / 3) : 1)), 1);

  return {
    rooms,
    floors
  };
}

// 🏗️ 4. BIM Parsing (Simplified version)
async function parseBIM(file: { buffer: Buffer; originalname: string }): Promise<ParsedPlan> {
  // For BIM files, we'll use a simplified approach since full BIM parsing is complex
  // This could be enhanced with specialized BIM libraries like IfcOpenShell or xBIM
  
  console.log('🏗️ BIM file detected, using simplified parsing');
  
  // For now, return a default structure or use CAD parsing as fallback
  // In a real implementation, you would use specialized BIM libraries
  
  return {
    rooms: [
      createDefaultRoom('Living Room', 5, 4),
      createDefaultRoom('Kitchen', 3, 3),
      createDefaultRoom('Bedroom', 4, 3.5)
    ],
    floors: 1
  };
}

// Fallback function for manual room creation
export function createRoomsFromManualInput(roomData: Array<{
  name: string;
  length: number;
  width: number;
  doors?: number;
  windows?: number;
}>): Room[] {
  return roomData.map(data => {
    let room = createDefaultRoom(data.name, data.length, data.width);
    room = addDoorsToRoom(room, data.doors || 0);
    room = addWindowsToRoom(room, data.windows || 0);
    return room;
  });
}

export default {
  parsePlanFile,
  createRoomsFromManualInput
};