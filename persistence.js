import fs from 'fs/promises';
import path from 'path';
import JSOG from 'jsog';

// Import necessary classes and registries from server.js
import {
    Goal,
    Offer,
    Completion,
    Org,
    orgRegistry,
    goalRegistry,
    offerRegistry,
    completionRegistry,
    apiKeyToPlayer
} from './social-realizer.js';

const DATA_DIR = './data';

// Ensure data directory exists
export async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// Construct objects from JSOG data
export function constructFromJSOG(data) {
    console.log('Constructing Element of Type', data.type);

    let instance;
    
    switch (data.type) {
        case 'Goal':
            instance = Object.create(Goal.prototype);
            const newGoal = new Goal(data.description, data.createdById, data.id);
            Object.assign(instance, newGoal, data);
            goalRegistry[data.id] = instance;
            break;
        case 'Offer':    
            instance = Object.create(Offer.prototype);
            const newOffer = new Offer(data.description, data.createdById, data.towardsGoals, data.id);
            Object.assign(instance, newOffer, data);
            offerRegistry[data.id] = instance;
            break;
        case 'Completion':  
            instance = Object.create(Completion.prototype);
            const newCompletion = new Completion(data.description, data.createdById, data.offerId, data.id);
            Object.assign(instance, newCompletion, data);
            completionRegistry[data.id] = instance;
            break;
        case 'Org':    
            instance = Object.create(Org.prototype);
            const newOrg = new Org(data.name || "Unknown Organization", data.id);
            Object.assign(instance, newOrg, data);
            orgRegistry[instance.id] = instance;
            if (data.apiKey) {
                apiKeyToPlayer[data.apiKey] = instance.id;
            }
            break;
        default:
            throw new Error("Unknown type: " + data.type);
    }

    if (instance.offersTowardsSelf) {
        instance.offersTowardsSelf = new Set(instance.offersTowardsSelf);
    }
    if (instance.towardsGoals) {
        instance.towardsGoals = new Set(instance.towardsGoals);
    }
    
    if (instance.__jsogObjectId) {
        delete instance.__jsogObjectId;
    }

    return instance
}

// Save element to file
export async function save(element) {
    await ensureDataDir();
    const fileName = `${element.constructor.name}_${element.id}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    
    const dataToSave = { ...element };
    if (element.constructor.name === 'Org') {
        const apiKey = Object.keys(apiKeyToPlayer).find(key => apiKeyToPlayer[key] === element.id);
        if (apiKey) {
            dataToSave.apiKey = apiKey;
        }
    }
    
    const preparedElement = convertSetsToArrays(dataToSave);
    const jsogEncoded = JSOG.encode(preparedElement);
    await fs.writeFile(filePath, JSOG.stringify(jsogEncoded));
}

// Load element from file
export async function load(elementType, id) {
    const fileName = `${elementType}_${id}.json`;
    const filePath = path.join(DATA_DIR, fileName);
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const jsogDecoded = JSOG.parse(fileContent);
        return convertArraysToSets(jsogDecoded);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`No saved data found for ${elementType} with id ${id}`);
            return null;
        }
        throw error;
    }
}

// Load all data from files
export async function loadAll() {
    await ensureDataDir();
    try {
        const files = await fs.readdir(DATA_DIR);
        
        for (const file of files) {
            const [elementType, id] = file.split('_');
            const cleanId = id.replace('.json', '');
            const element = await load(elementType, cleanId);
            
            if (element) {
                constructFromJSOG(element);
            }
        }

        for (const file of files) {
            const [elementType, id] = file.split('_');
            const cleanId = id.replace('.json', '');
            const registry = {
                'Org': orgRegistry,
                'Goal': goalRegistry,
                'Offer': offerRegistry,
                'Completion': completionRegistry
            }[elementType];

            if (registry && registry[cleanId]) {
                const element = registry[cleanId];
                if (element.orgData) {
                    Object.keys(element.orgData).forEach(orgId => {
                        if (orgRegistry[orgId]) {
                            element.orgData[orgId] = orgRegistry[orgId];
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Helper functions for Set conversion
function convertSetsToArrays(obj) {
    const seen = new WeakSet();
    
    function convert(value) {
        if (typeof value !== 'object' || value === null) {
            return value;
        }

        if (seen.has(value)) {
            return value;
        }
        seen.add(value);

        if (value instanceof Set) {
            return Array.from(value);
        }

        if (Array.isArray(value)) {
            return value.map(convert);
        }

        const result = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = convert(val);
        }
        return result;
    }

    return convert(obj);
}

function convertArraysToSets(obj) {
    const seen = new WeakSet();
    
    function convert(value) {
        if (typeof value !== 'object' || value === null) {
            return value;
        }

        if (seen.has(value)) {
            return value;
        }
        seen.add(value);

        if (Array.isArray(value)) {
            if (obj.type === 'Goal' && value === obj.offersTowardsSelf) {
                return new Set(value);
            }
            if (obj.type === 'Offer' && value === obj.towardsGoals) {
                return new Set(value);
            }
            return value.map(convert);
        }

        const result = {};
        for (const [key, val] of Object.entries(value)) {
            result[key] = convert(val);
        }
        return result;
    }

    return convert(obj);

} 